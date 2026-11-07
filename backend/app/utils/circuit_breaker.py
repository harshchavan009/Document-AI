import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class CircuitBreakerOpenException(Exception):
    """Raised when an outbound AI service call is blocked due to active cooldown."""

    def __init__(self, message: str, retry_after: int = 120):
        super().__init__(message)
        self.retry_after = retry_after
        self.message = message


class GeminiCircuitBreaker:
    """
    Protects API budget and prevents cascading failures when Google Gemini
    returns 429 (ResourceExhausted / RateLimit) or 503 (Unavailable / Overloaded).
    Trips open for cooldown_seconds after failure_threshold consecutive errors.
    """

    def __init__(self, failure_threshold: int = 3, cooldown_seconds: int = 120):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.consecutive_failures = 0
        self.opened_at: Optional[float] = None

    @property
    def is_open(self) -> bool:
        """Returns True if the circuit breaker is currently open."""
        if self.opened_at is None:
            return False
        elapsed = time.time() - self.opened_at
        if elapsed >= self.cooldown_seconds:
            # Cooldown has passed; allow tentative request
            return False
        return True

    @property
    def remaining_cooldown(self) -> int:
        """Returns the number of seconds remaining before cooldown expires."""
        if self.opened_at is None:
            return 0
        elapsed = time.time() - self.opened_at
        remaining = self.cooldown_seconds - elapsed
        return max(0, int(remaining))

    def check_can_execute(self) -> None:
        """
        Validates whether outbound Gemini calls are permitted.
        Raises CircuitBreakerOpenException if the circuit breaker is tripped.
        """
        if self.is_open:
            remaining = self.remaining_cooldown
            msg = (
                f"Google Gemini rate limit cooldown active. "
                f"Please wait {remaining} seconds before submitting research queries."
            )
            logger.warning(f"Circuit breaker prevented outbound Gemini call. {msg}")
            raise CircuitBreakerOpenException(msg, retry_after=remaining)

    def record_success(self) -> None:
        """Resets the circuit breaker upon a successful API call."""
        if self.consecutive_failures > 0 or self.opened_at is not None:
            logger.info("Gemini circuit breaker reset to closed state after successful call.")
        self.consecutive_failures = 0
        self.opened_at = None

    def record_failure(self, error: Exception) -> None:
        """
        Records an API error. Trips the circuit breaker if the error indicates
        rate limits (429, ResourceExhausted, quota) or service overload (503).
        """
        err_str = str(error).lower()
        is_rate_limit = (
            "429" in err_str or
            "resourceexhausted" in err_str or
            "quota" in err_str or
            "rate limit" in err_str or
            "503" in err_str or
            "unavailable" in err_str
        )

        if is_rate_limit:
            self.consecutive_failures += 1
            logger.warning(
                f"Gemini API rate limit error detected ({self.consecutive_failures}/{self.failure_threshold}): {error}"
            )
            if self.consecutive_failures >= self.failure_threshold:
                self.opened_at = time.time()
                logger.error(
                    f"Gemini circuit breaker TRIPPED. Opening circuit for {self.cooldown_seconds}s cooldown."
                )

    def trip_manually(self, cooldown: Optional[int] = None) -> None:
        """Manually trips the circuit breaker for testing or administrative cooldown."""
        self.consecutive_failures = self.failure_threshold
        self.opened_at = time.time()
        if cooldown is not None:
            self.cooldown_seconds = cooldown

    def reset(self) -> None:
        """Manually resets the breaker back to normal closed state."""
        self.consecutive_failures = 0
        self.opened_at = None


# Shared singleton instance across backend workers
gemini_circuit_breaker = GeminiCircuitBreaker()
