from __future__ import annotations

from app.api.auth.saml import build_saml_response
from app.core.keystore import keystore
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from lxml import etree
from signxml import XMLVerifier, methods


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
    XMLVerifier().verify(assertion, require_x509=True)
