from fastapi import APIRouter, Depends, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.services.SAMLIDPService import SAMLIdPService
from app.repositories.user_repo import UserRepository
from saml2.saml import NameID

router = APIRouter(prefix="/saml", tags=["SAML SSO"])
saml_service = SAMLIdPService()


@router.get("/metadata")
async def get_metadata():
    """Exposes the IdP Metadata XML for Service Providers to download."""
    return HTMLResponse(content=str(saml_service.server.config.idp_config), media_type="application/xml")


@router.get("/sso")
@router.post("/sso")
async def sso_entrypoint(
        request: Request,
        SAMLRequest: str = None,
        user_email: str = Form(None),
        db: Session = Depends(get_db)
):
    # 1. Use provided email or default for testing
    if not user_email:
        user_email = "aksaxena1991@gmail.com"

    user = UserRepository.get_user_with_security_context(db, user_email)
    if not user:
        raise HTTPException(status_code=401, detail=f"Identity not found: {user_email}")

    # 2. Extract SP info and validate PBAC
    # (Optional: check Policy model to see if this user/tenant is allowed for this SP)

    # 3. Build the SAML Identity
    identity = saml_service.build_assertion_identity(user)

    # 4. Create the SAML Response
    # This signs the assertion with your private key
    name_id = NameID(
        text=user.email,
        format="urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress"
    )
    # Use the SP entity ID from metadata, or default for testing
    sp_entity_id = "http://localhost:8080/saml/sp"
    acs_url = "http://localhost:8080/saml/acs"

    saml_response = saml_service.server.create_authn_response(
        identity=identity,
        name_id=name_id,
        destination=acs_url,
        sp_entity_id=sp_entity_id,
        in_response_to=None  # In production, extract this from the SAMLRequest
    )

    # 5. POST Binding: Auto-submit form to redirect back to SP
    content = f"""
    <html>
        <body onload="document.forms[0].submit()">
            <form method="post" action="{acs_url}">
                <input type="hidden" name="SAMLResponse" value="{saml_response}" />
                <input type="submit" value="Redirecting to Service..." />
            </form>
        </body>
    </html>
    """
    return HTMLResponse(content=content)