"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

# import backend.test_runner.routing
# import backend.pulse.routing
import pulse.routing
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# application = get_asgi_application()


application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        # "websocket": AllowedHostsOriginValidator(
        #     AuthMiddlewareStack(URLRouter(backend.pulse.routing.websocket_urlpatterns))
        # )
        "websocket": URLRouter(pulse.routing.websocket_urlpatterns),
    }
)
