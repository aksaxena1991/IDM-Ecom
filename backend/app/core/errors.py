from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class ProblemDetail(Exception):
    def __init__(
        self,
        *,
        status: int,
        title: str,
        detail: str | None = None,
        type_: str = "about:blank",
        instance: str | None = None,
        extensions: dict[str, Any] | None = None,
    ) -> None:
        self.status = status
        self.title = title
        self.detail = detail
        self.type = type_
        self.instance = instance
        self.extensions = extensions or {}


def problem_response(
    *,
    status: int,
    title: str,
    detail: str | None = None,
    type_: str = "about:blank",
    instance: str | None = None,
    extensions: dict[str, Any] | None = None,
) -> JSONResponse:
    body: dict[str, Any] = {
        "type": type_,
        "title": title,
        "status": status,
    }
    if detail is not None:
        body["detail"] = detail
    if instance is not None:
        body["instance"] = instance
    if extensions:
        body.update(extensions)
    return JSONResponse(
        status_code=status,
        content=body,
        media_type="application/problem+json",
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ProblemDetail)
    async def problem_detail_handler(_: Request, exc: ProblemDetail) -> JSONResponse:
        return problem_response(
            status=exc.status,
            title=exc.title,
            detail=exc.detail,
            type_=exc.type,
            instance=exc.instance,
            extensions=exc.extensions,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        return problem_response(
            status=exc.status_code,
            title=detail,
            detail=detail,
            instance=str(request.url.path),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return problem_response(
            status=422,
            title="Validation Error",
            detail="Request validation failed",
            instance=str(request.url.path),
            extensions={"errors": exc.errors()},
        )
