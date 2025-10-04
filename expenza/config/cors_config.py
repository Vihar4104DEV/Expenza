import os

# =============================================================================
# CORS CONFIGURATION
# =============================================================================

environment = os.environ.get("ENV", "development")


ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")
print("environment",environment)

if environment == "development" or environment == "base":
    CORS_ALLOW_CREDENTIALS = True
    CORS_ORIGIN_ALLOW_ALL = True
    CORS_ALLOW_HEADERS = (
        "accept",  # Allow 'Accept' header (used for content negotiation)
        "authorization",  # Allow 'Authorization' header (used for authentication tokens)
        "content-type",  # Allow 'Content-Type' header (specifies the media type of the request)
        "user-agent",  # Allow 'User-Agent' header (provides client details)
        "x-csrftoken",  # Allow 'X-CSRFToken' header (used for CSRF protection in Django)
        "x-requested-with",  # Allow 'X-Requested-With' header (identifies AJAX requests)
        "ngrok-skip-browser-warning",  # Allow 'ngrok-skip-browser-warning' (used to bypass ngrok's browser warning)
        "access-control-allow-origin",  # Allow CORS origin header
        "access-control-allow-headers",  # Allow CORS headers
        "access-control-allow-methods",  # Allow CORS methods
        "access-control-allow-credentials",  # Allow CORS credentials
        "X-DeviceType"
    )


else:
    CORS_ORIGIN_WHITELIST = ALLOWED_HOSTS
    CORS_ALLOWED_ORIGINS = [
        f"http://{host}" if not host.startswith("http") else host
        for host in ALLOWED_HOSTS if host
    ] + [
        f"https://{host}" if not host.startswith("http") else host
        for host in ALLOWED_HOSTS if host
    ]
    CORS_ALLOW_HEADERS = [
        "accept",
        "accept-encoding",
        "authorization",
        "content-type",
        "dnt",
        "origin",
        "user-agent",
        "x-csrftoken",
        "x-requested-with",
        "X-DeviceType"
    ]


CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
