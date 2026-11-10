import json
import urllib.request

from flask import current_app


def send(to, subject, html, text):
    """Sends an email through Resend. Without an API key (development) the text is logged instead."""
    key = current_app.config["RESEND_API_KEY"]
    if not key:
        current_app.logger.warning("Email to %s, %s:\n%s", to, subject, text)
        return
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(
            {"from": current_app.config["MAIL_FROM"], "to": [to], "subject": subject, "html": html, "text": text}
        ).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json", "User-Agent": "polaris"},
    )
    try:
        urllib.request.urlopen(request, timeout=10)
    except OSError:
        current_app.logger.exception("Sending the email to %s failed.", to)
