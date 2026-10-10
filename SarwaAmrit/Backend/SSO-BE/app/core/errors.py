"""Compatibility shim — use app.core.middleware."""

from app.core.middleware import ProblemDetail, problem_response, register_exception_handlers

__all__ = ["ProblemDetail", "problem_response", "register_exception_handlers"]
