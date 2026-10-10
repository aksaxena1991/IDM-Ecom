from __future__ import annotations

import base64
import uuid
from datetime import datetime, timedelta, timezone
from xml.sax.saxutils import escape

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
from fastapi import APIRouter, Form, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from lxml import etree
from signxml import XMLSigner
from sqlalchemy import select

from app.core.deps import DbDep, RedisDep, get_current_session
from app.core.config import get_settings
from app.core.middleware import ProblemDetail
from app.core.keystore import keystore
from app.models.entities import Application, AppProtocol, AppStatus, SamlAssertionReplay, Tenant, User
from app.features.access.services import APP_ACCESS, access_service
from app.features.audit.services import audit_service
from app.core.metrics import metrics

router = APIRouter(tags=["saml"])

SAML_NS = "urn:oasis:names:tc:SAML:2.0:assertion"
SAMLP_NS = "urn:oasis:names:tc:SAML:2.0:protocol"


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def _self_signed_cert(private_pem: bytes, *, cn: str) -> tuple[bytes, bytes]:
    private_key = serialization.load_pem_private_key(private_pem, password=None)
    assert isinstance(private_key, rsa.RSAPrivateKey)
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, cn)])
    now = datetime.now(timezone.utc)
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(private_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - timedelta(minutes=1))
        .not_valid_after(now + timedelta(days=3650))
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .add_extension(
            x509.KeyUsage(
                digital_signature=True,
                content_commitment=False,
                key_encipherment=False,
                data_encipherment=False,
                key_agreement=False,
                key_cert_sign=False,
                crl_sign=False,
                encipher_only=False,
                decipher_only=False,
            ),
            critical=True,
        )
        .sign(private_key, hashes.SHA256())
    )
    return private_pem, cert.public_bytes(serialization.Encoding.PEM)


async def _get_saml_app(db: DbDep, client_id: str | None = None, entity_id: str | None = None) -> Application:
    stmt = select(Application).where(Application.protocol == AppProtocol.saml).where(
        Application.status == AppStatus.active
    )
    if client_id:
        stmt = stmt.where(Application.client_id == client_id)
    result = await db.execute(stmt)
    apps = list(result.scalars().all())
    if entity_id:
        for app in apps:
            if app.config.get("entity_id") == entity_id:
                return app
        raise ProblemDetail(status=400, title="invalid_request", detail="Unknown SAML entity")
    if not apps:
        raise ProblemDetail(status=400, title="invalid_request", detail="No SAML application")
    return apps[0]


def build_saml_response(
    *,
    issuer: str,
    destination: str,
    recipient: str,
    audience: str,
    name_id: str,
    session_index: str,
    private_pem: bytes,
    in_response_to: str | None = None,
    assertion_id: str | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    not_on_or_after = now + timedelta(minutes=5)
    assertion_id = assertion_id or f"_a{uuid.uuid4().hex}"
    response_id = f"_r{uuid.uuid4().hex}"

    assertion_xml = f"""<saml:Assertion xmlns:saml="{SAML_NS}" ID="{assertion_id}" IssueInstant="{now.strftime('%Y-%m-%dT%H:%M:%SZ')}" Version="2.0">
  <saml:Issuer>{escape(issuer)}</saml:Issuer>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">{escape(name_id)}</saml:NameID>
    <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
      <saml:SubjectConfirmationData NotOnOrAfter="{not_on_or_after.strftime('%Y-%m-%dT%H:%M:%SZ')}" Recipient="{escape(recipient)}"{f' InResponseTo="{escape(in_response_to)}"' if in_response_to else ""}/>
    </saml:SubjectConfirmation>
  </saml:Subject>
  <saml:Conditions NotBefore="{(now - timedelta(seconds=60)).strftime('%Y-%m-%dT%H:%M:%SZ')}" NotOnOrAfter="{not_on_or_after.strftime('%Y-%m-%dT%H:%M:%SZ')}">
    <saml:AudienceRestriction>
      <saml:Audience>{escape(audience)}</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AuthnStatement AuthnInstant="{now.strftime('%Y-%m-%dT%H:%M:%SZ')}" SessionIndex="{escape(session_index)}">
    <saml:AuthnContext>
      <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
    </saml:AuthnContext>
  </saml:AuthnStatement>
</saml:Assertion>"""

    from signxml import methods

    key_pem, cert_pem = _self_signed_cert(private_pem, cn=issuer)
    assertion_el = etree.fromstring(assertion_xml.encode("utf-8"))
    # Exclusive C14N so embedding under samlp:Response does not invalidate the signature
    signer = XMLSigner(
        method=methods.enveloped,
        digest_algorithm="sha256",
        signature_algorithm="rsa-sha256",
        c14n_algorithm="http://www.w3.org/2001/10/xml-exc-c14n#",
    )
    signed_assertion = signer.sign(assertion_el, key=key_pem, cert=cert_pem)
    signed_assertion_str = etree.tostring(signed_assertion, encoding="unicode")

    in_response_attr = f' InResponseTo="{escape(in_response_to)}"' if in_response_to else ""
    response = f"""<samlp:Response xmlns:samlp="{SAMLP_NS}" xmlns:saml="{SAML_NS}" ID="{response_id}" Version="2.0" IssueInstant="{now.strftime('%Y-%m-%dT%H:%M:%SZ')}" Destination="{escape(destination)}"{in_response_attr}>
  <saml:Issuer>{escape(issuer)}</saml:Issuer>
  <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>
  {signed_assertion_str}
</samlp:Response>"""
    return response


@router.get("/saml/metadata/{tenant_slug}")
async def saml_metadata(tenant_slug: str, db: DbDep):
    settings = get_settings()
    tenant = (
        await db.execute(select(Tenant).where(Tenant.slug == tenant_slug))
    ).scalar_one_or_none()
    if tenant is None:
        raise ProblemDetail(status=404, title="Not Found", detail="Unknown tenant")
    key = await keystore.ensure_active_rs256_key(db, tenant_id=tenant.id)
    private_pem = keystore.load_private_pem(key)
    _, cert_pem = _self_signed_cert(private_pem, cn=f"sso-{tenant_slug}")
    # Strip PEM headers for metadata certificate
    cert_b64 = "".join(
        line for line in cert_pem.decode("ascii").splitlines() if not line.startswith("-----")
    )
    entity_id = f"{settings.base_url}/saml/metadata/{tenant_slug}"
    sso_url = f"{settings.base_url}/saml/sso"
    xml = f"""<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="{escape(entity_id)}">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
        <X509Data><X509Certificate>{cert_b64}</X509Certificate></X509Data>
      </KeyInfo>
    </KeyDescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="{escape(sso_url)}"/>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="{escape(sso_url)}"/>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
  </IDPSSODescriptor>
</EntityDescriptor>"""
    return HTMLResponse(content=xml, media_type="application/samlmetadata+xml")


@router.post("/saml/sso")
@router.get("/saml/sso")
async def saml_sso(
    request: Request,
    db: DbDep,
    redis: RedisDep,
    SAMLRequest: str | None = Form(None),
    RelayState: str | None = Form(None),
    client_id: str | None = Query(None),
):
    if SAMLRequest is None:
        SAMLRequest = request.query_params.get("SAMLRequest")
    if RelayState is None:
        RelayState = request.query_params.get("RelayState")

    settings = get_settings()
    session = await get_current_session(request, db, redis)
    if session is None:
        from urllib.parse import urlencode

        return RedirectResponse(url=f"/login?{urlencode({'redirect': str(request.url)})}", status_code=302)

    in_response_to = None
    app: Application | None = None

    if SAMLRequest:
        try:
            raw = base64.b64decode(SAMLRequest)
            try:
                root = etree.fromstring(raw)
            except etree.XMLSyntaxError:
                import zlib

                root = etree.fromstring(zlib.decompress(raw, -15))
            issuer_el = root.find(f".//{{{SAML_NS}}}Issuer")
            entity_id = issuer_el.text if issuer_el is not None else None
            in_response_to = root.get("ID")
            app = await _get_saml_app(db, entity_id=entity_id)
            destination = root.get("Destination")
            if destination and destination != f"{settings.base_url}/saml/sso":
                raise ProblemDetail(status=400, title="invalid_request", detail="Destination mismatch")
        except ProblemDetail:
            raise
        except Exception as exc:  # noqa: BLE001
            raise ProblemDetail(status=400, title="invalid_request", detail=f"Invalid SAMLRequest: {exc}") from exc
    else:
        if not client_id:
            raise ProblemDetail(status=400, title="invalid_request", detail="client_id required for IdP-initiated")
        app = await _get_saml_app(db, client_id=client_id)

    acs_url = app.config.get("acs_url")
    audience = app.config.get("audience") or app.config.get("entity_id")
    if not acs_url or not audience:
        raise ProblemDetail(status=400, title="invalid_client", detail="SAML app missing acs_url/audience")

    user_result = await db.execute(select(User).where(User.id == session.user_id))
    user = user_result.scalar_one()
    decision = await access_service.decide(db, user=user, application=app, action=APP_ACCESS)
    if not decision.allowed:
        await audit_service.record(
            db,
            redis,
            tenant_id=user.tenant_id,
            actor=user.email,
            action="access.denied",
            target=str(app.id),
            payload={"reason": decision.reason, "policies": decision.matched_policies, "via": "saml"},
        )
        raise ProblemDetail(status=403, title="Forbidden", detail=decision.message)

    tenant = (await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))).scalar_one()
    key = await keystore.ensure_active_rs256_key(db, tenant_id=tenant.id)
    private_pem = keystore.load_private_pem(key)
    issuer = f"{settings.base_url}/saml/metadata/{tenant.slug}"
    assertion_id = f"_a{uuid.uuid4().hex}"
    replay_key = f"sso:saml:replay:{assertion_id}"
    if await redis.exists(replay_key):
        raise ProblemDetail(status=400, title="invalid_request", detail="Replay detected")
    existing = await db.execute(
        select(SamlAssertionReplay).where(SamlAssertionReplay.assertion_id == assertion_id)
    )
    if existing.scalar_one_or_none() is not None:
        raise ProblemDetail(status=400, title="invalid_request", detail="Replay detected")

    response_xml = build_saml_response(
        issuer=issuer,
        destination=acs_url,
        recipient=acs_url,
        audience=audience,
        name_id=user.email,
        session_index=str(session.id),
        private_pem=private_pem,
        in_response_to=in_response_to,
        assertion_id=assertion_id,
    )
    await redis.set(replay_key, "1", ex=300)
    db.add(
        SamlAssertionReplay(
            assertion_id=assertion_id,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
        )
    )
    await db.commit()
    metrics.incr("token_issues")

    await audit_service.record(
        db,
        redis,
        tenant_id=session.tenant_id,
        actor=user.email,
        action="saml.sso",
        target=str(app.id),
    )

    saml_b64 = _b64(response_xml.encode("utf-8"))
    relay = f'<input type="hidden" name="RelayState" value="{escape(RelayState)}"/>' if RelayState else ""
    html = f"""<!DOCTYPE html><html><body onload="document.forms[0].submit()">
<form method="post" action="{escape(acs_url)}">
<input type="hidden" name="SAMLResponse" value="{saml_b64}"/>
{relay}
<noscript><button type="submit">Continue</button></noscript>
</form></body></html>"""
    return HTMLResponse(html)
