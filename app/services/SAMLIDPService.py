import os
from saml2 import BINDING_HTTP_POST, BINDING_HTTP_REDIRECT
from saml2.server import Server
from saml2.config import IdPConfig

class SAMLIdPService:
    def __init__(self):
        base_url = os.environ.get('SAMLIDP_URL')
        xmlsec_path = os.environ.get('XMLSEC_BIN', '/opt/homebrew/bin/xmlsec1')
        settings = {
            "entity_id" :f"{base_url}/saml/metadata",
            "services":{
                "idp":{
                    "endpoints":{
                        "single_sign_on_service":[
                            (f"{base_url}/saml/sso", BINDING_HTTP_POST),
                            (f"{base_url}/saml/sso", BINDING_HTTP_REDIRECT),

                        ]
                    },
                    "name":"FastAPI-IdM-Provider"
                }
            },
            "key_file": "certificates/idp.key",
            "cert_file": "certificates/idp.crt",
            "metadata": {
                "local": ["metadata/sp_metadata.xml"],  # Metadata of the Service Provider (e.g., Salesforce)
            },
            "xmlsec_binary": xmlsec_path,
        }

        config = IdPConfig()
        config.load(settings)
        self.server = Server(config=config)

    def build_assertion_identity(self, user):
        """
        Combines RBAC, ABAC, and PBAC into the SAML Attribute Statement.
        """
        # 1. ABAC: Core User Attributes
        identity = {
            "uid": [str(user.id)],
            "email": [user.email],
            "tenant_id": [str(user.tenant_id)],
        }

        # 2. ABAC: Dynamic UserAttributes
        for attr in user.attributes:
            identity[attr.key] = [attr.value]

        # 3. RBAC: Roles and Permissions
        identity["roles"] = [role.name for role in user.roles]

        # Flattened permissions: e.g., ["report:read", "user:write"]
        permissions = []
        for role in user.roles:
            for perm in role.permissions:
                permissions.append(f"{perm.resource}:{perm.action}")
        identity["permissions"] = list(set(permissions))

        return identity