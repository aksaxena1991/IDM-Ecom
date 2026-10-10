from pydantic import BaseModel


class MfaEnrollResponse(BaseModel):
    factor_id: str
    secret: str
    otpauth_uri: str


class MfaVerifyRequest(BaseModel):
    code: str
