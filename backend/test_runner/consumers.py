# your_project_name/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer


class LogConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.test_id = self.scope["url_route"]["kwargs"]["test_id"]
        self.room_group_name = f"test_{self.test_id}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data["message"]

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "log_message", "message": message}
        )

    # Receive message from room group
    async def log_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))
