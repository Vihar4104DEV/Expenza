from typing import Iterable, Optional
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection


def send_email(
    *,
    subject: str,
    body_text: str,
    to: Iterable[str],
    body_html: Optional[str] = None,
    from_email: Optional[str] = None,
    reply_to: Optional[Iterable[str]] = None,
) -> None:
    """Send email via SMTP using Django settings.

    - Uses global EMAIL_* settings already configured in `expenza/config/email_config.py`.
    - Supports plaintext and optional HTML body.
    - Accepts custom from/reply-to if provided.
    """
    sender = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None)
    if not sender:
        # Fall back to a default
        sender = 'no-reply@expenza.local'

    connection = get_connection()
    msg = EmailMultiAlternatives(
        subject=subject,
        body=body_text,
        from_email=sender,
        to=list(to),
        connection=connection,
        reply_to=list(reply_to) if reply_to else None,
    )
    if body_html:
        msg.attach_alternative(body_html, 'text/html')
    msg.send(fail_silently=False)
