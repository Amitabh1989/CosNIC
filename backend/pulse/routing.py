from django.urls import path

from .consumers import LiveLogsConsumer

websocket_urlpatterns = [
    path("ws/livelogs/", LiveLogsConsumer.as_asgi()),
]
