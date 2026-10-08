"""In-process counters for operational visibility."""

from __future__ import annotations

from collections import defaultdict
from threading import Lock


class MetricsRegistry:
    def __init__(self) -> None:
        self._counters: dict[str, int] = defaultdict(int)
        self._lock = Lock()

    def incr(self, name: str, amount: int = 1) -> None:
        with self._lock:
            self._counters[name] += amount

    def render(self) -> str:
        with self._lock:
            lines = ["# HELP sso_custom Custom SSO counters", "# TYPE sso_custom counter"]
            for name, value in sorted(self._counters.items()):
                lines.append(f'sso_{name} {value}')
            return "\n".join(lines) + "\n"


metrics = MetricsRegistry()

__all__ = ["metrics", "MetricsRegistry"]
