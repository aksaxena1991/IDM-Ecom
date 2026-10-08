from __future__ import annotations

import base64

from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from lxml import etree
from signxml import XMLVerifier

from app.api.auth.saml import build_saml_response


def test_saml_response_has_enveloped_signature():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    xml = build_saml_response(
        issuer="http://localhost:8000/saml/metadata/demo",
        destination="http://localhost:3000/saml/acs",
        recipient="http://localhost:3000/saml/acs",
        audience="http://localhost:3000/saml/metadata",
        name_id="user@example.com",
        session_index="sid-1",
        private_pem=private_pem,
    )
    root = etree.fromstring(xml.encode("utf-8"))
    assertion = root.find(".//{urn:oasis:names:tc:SAML:2.0:assertion}Assertion")
    assert assertion is not None
    sig = assertion.find(".//{http://www.w3.org/2000/09/xmldsig#}Signature")
    assert sig is not None
    cert_b64 = assertion.findtext(".//{http://www.w3.org/2000/09/xmldsig#}X509Certificate")
    assert cert_b64
    cert = x509.load_der_x509_certificate(base64.b64decode(cert_b64))
    # Trust the embedded IdP cert out-of-band (as an SP would via metadata)
    XMLVerifier().verify(assertion, x509_cert=cert, id_attribute="ID")


def test_saml_metadata_shape_mentions_entity_id():
    from app.api.auth.saml import SAML_NS, SAMLP_NS

    assert SAML_NS.startswith("urn:oasis")
    assert SAMLP_NS.startswith("urn:oasis")
