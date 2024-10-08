import asyncio
import json
import logging

import websockets

# from channels.consumer import AsyncConsumer, SyncConsumer
# from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer

log = logging.getLogger(__name__)


# class LiveLogsConsumer(AsyncConsumer):
#     async def websocket_connect(self, event):
#         log.info(f"Hello, connection is established from Client to server : {event}")
#         log.info(f"Channels name  : {self.channel_name}")
#         log.info(f"Channels layer : {self.channel_layer}")
#         self.send(
#             {
#                 "type": "websocket.accept",
#             }
#         )


#     async def websocket_receive(self, event):
#         log.info(f"Sending data from Server to Client now : {event} : message in event : {event.get("text")}")
#         self.send({
#             "type": "websocket.send",
#             "text": json.dumps({"message": "hey Buddy!"})
#         })

#     async def websocket_disconnect(self, event):
#         log.info(f"Websocket disconnection message received : {event} : message : {event.get("text", "No text found in disconnection message")},")
#         raise StopConsumer()


class LiveLogsConsumer(AsyncWebsocketConsumer):
    # async def connect(self):
    async def websocket_connect(self, event):
        await self.accept()
        self.log_server_uri = "ws://localhost:6789"  # Fixed the typo here
        # data = await self.receive()  # receives the data from the client
        # print("Data recevied from client is : ", data)
        # data = event.get("text")
        # # data_str = data.decode("utf-8")
        # print("Data recevied from client is : ", data)
        # self.test_run_id = data.get("test_run_id")
        # self.message = data.get("message")
        # print(
        #     f"Connecting to log server : {self.message}... for test case : {self.test_run_id} "
        # )

        # try:
        #     # Trying to connect to the log server
        #     self.log_server_connection = await websockets.connect(self.log_server_uri)
        #     print("Connected to log server successfully.")
        #     asyncio.create_task(self.broadcast_logs())
        # except Exception as e:
        #     print(f"Error connecting to log server: {e}")
        #     await self.close()  # Close the WebSocket if we can't connect to the log server

    async def websocket_receive(self, message):
        print("Data recevied from client is : ", message, type(message))
        data = message.get("text")
        data = json.loads(data)
        self.test_run_id = data.get("test_run_id")
        self.message = data.get("message")
        print(
            f"Connecting to log server : {self.message}... for test case : {self.test_run_id} "
        )

        try:
            # Trying to connect to the log server
            self.log_server_connection = await websockets.connect(self.log_server_uri)
            print("Connected to log server successfully.")
            asyncio.create_task(self.broadcast_logs())
        except Exception as e:
            print(f"Error connecting to log server: {e}")
            # await self.close()  # Close the WebSocket if we can't connect to the log server

    async def disconnect(self, code):
        # Cleanly close the connection to the log server
        if hasattr(self, "log_server_connection") and self.log_server_connection:
            await self.log_server_connection.close()
        # await self.close()

    async def broadcast_logs(self):
        try:
            # Continuously listen for messages from the log server and send to the WebSocket
            async for message in self.log_server_connection:
                print(f"Message from log server: {message}")
                await self.send(text_data=json.dumps({"logs": message}))
        except Exception as e:
            print(f"Error while broadcasting logs: {e}")
            # await self.close()


# class LiveLogsConsumer(AsyncWebsocketConsumer):
#     async def connect(self, scope):
#         await self.accept()
#         self.test_run_id = scope['path'].split('/')[-1]  # Extract test run ID from URL

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         if data.get('test_run_id') == self.test_run_id:
#             # Broadcast the log message to the client
#             await self.send(text_data=json.dumps(data))
