# import asyncio
# import logging
# import pickle
# import socket

# # from logging.handlers import StreamRequestHandler, ThreadingTCPServer
# # from logging import handlers
# import socketserver
# import struct

# import jsonpickle
# import websockets


# # class LogRecordStreamHandler(logging.handlers.StreamRequestHandler):
# class LogRecordStreamHandler(socketserver.StreamRequestHandler):
#     """
#     Handler for a streaming logging request.
#     LogRecordStreamHandler:
#         Handles incoming log records from the SocketHandler.
#         Unpickles the log records and formats them.
#         Broadcasts the formatted log messages to all connected WebSocket clients using the broadcast_to_clients function.

#     """

#     # Additional code added to the original snippet
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         print("LogRecordStreamHandler initialized")

#         def handle(self):
#             """
#             Handles multiple log records sent over the socket,
#             expected to be 4-byte length followed by a pickled log record.
#             """

#             self.connection.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
#             while True:
#                 # Read length of incoming data (4 bytes)
#                 chunk = self.connection.recv(4)
#                 if len(chunk) < 4:
#                     break

#                 # Read the actual log data based on the length
#                 slen = struct.unpack(">L", chunk)[0]
#                 chunk = self.connection.recv(slen)
#                 while len(chunk) < slen:
#                     chunk += self.connection.recv(slen - len(chunk))

#                 # Unpickle the log record
#                 obj = pickle.loads(chunk)
#                 record = logging.makeLogRecord(obj)
#                 asyncio.run(self.broadcast(record))

#     def unPickle(self, data):
#         return pickle.loads(data)

#     def format(self, record):
#         # Format the log record as a string
#         formatter = logging.Formatter(
#             "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
#         )
#         return formatter.format(record)

#     async def broadcast(self, record):
#         print(f"Broadcasting message: {record}")
#         message = self.format(record)
#         await broadcast_to_clients(message)


# async def broadcast_to_clients(message):
#     """
#     Asynchronously sends log messages to all registered WebSocket clients
#     and flushes the output immediately after sending.
#     """
#     if log_server.clients:
#         await asyncio.gather(
#             *[send_and_flush(client, message) for client in log_server.clients]
#         )


# async def send_and_flush(client, message):
#     """
#     Sends a message to a client and flushes the output if the client supports flushing.
#     """
#     # Send the message immediately
#     await client.send(message)
#     # Ensure that the message is immediately flushed
#     await asyncio.sleep(0)  # Yield control to ensure async processing
#     await flush_client(client)


# async def flush_client(client):
#     """
#     Flushes the client output if the client supports the flush operation.
#     """
#     if hasattr(client, "flush"):
#         await client.flush()


# class LogRecordSocketReceiver(socketserver.ThreadingTCPServer):
#     """
#     Simple TCP socket-based logging receiver.
#     LogRecordSocketReceiver:
#     A TCP server that listens for incoming log records on a specified host and port (localhost:9999).
#     Manages connected WebSocket clients.

#     Listens on ws://localhost:6789 for client connections.
#     When a client connects, it is registered to receive broadcasted log message

#     """

#     allow_reuse_address = True

#     def __init__(self, host="localhost", port=9999, handler=LogRecordStreamHandler):
#         super().__init__((host, port), handler)
#         self.loop = asyncio.get_event_loop()
#         self.clients = set()

#     def start_server(self):
#         print(f"Starting log server on {self.server_address}")
#         server_thread = threading.Thread(target=self.serve_forever)
#         server_thread.daemon = True
#         server_thread.start()

#     async def register_client(self, websocket):
#         self.clients.add(websocket)
#         print(f"Client added to register_client : {websocket}")
#         print(f"All websocket clients           : {self.clients}")
#         try:
#             await websocket.wait_closed()
#         finally:
#             self.clients.remove(websocket)


# # Initialize the log server
# log_server = LogRecordSocketReceiver()


# # Start WebSocket server
# async def websocket_handler(websocket, path):
#     await log_server.register_client(websocket)


# def start_servers():
#     """
#     The start_servers function starts both the log server and the WebSocket server concurrently.
#     """
#     log_server.start_server()
#     ws_server = websockets.serve(websocket_handler, "localhost", 6789)
#     print("WebSocket server started on ws://localhost:6789")
#     asyncio.get_event_loop().run_until_complete(ws_server)
#     asyncio.get_event_loop().run_forever()


# if __name__ == "__main__":
#     """
#     The log server runs in a separate thread to handle blocking I/O operations without hindering the asynchronous WebSocket operations.
#     """
#     import threading

#     start_servers()


import asyncio
import json
import logging
import pickle
import socket
import socketserver
import struct

import jsonpickle
import websockets


class LogRecordStreamHandler(socketserver.StreamRequestHandler):
    """
    Handler for a streaming logging request.
    LogRecordStreamHandler:
        Handles incoming log records from the SocketHandler.
        Deserializes the log records and formats them.
        Broadcasts the formatted log messages to all connected WebSocket clients using the broadcast_to_clients function.
    """

    # Additional code added to the original snippet
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print("LogRecordStreamHandler initialized")

    def handle(self):
        """
        Handles multiple log records sent over the socket,
        expected to be 4-byte length followed by a serialized log record (using JSON).
        """
        self.connection.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        while True:
            try:
                # Read length of incoming data (4 bytes)
                chunk = self.connection.recv(4)
                if len(chunk) < 4:
                    break

                # Read the actual log data based on the length
                slen = struct.unpack(">L", chunk)[0]
                chunk = self.connection.recv(slen)
                while len(chunk) < slen:
                    chunk += self.connection.recv(slen - len(chunk))

                # # Deserialize the log record (using JSON instead of pickle)
                # obj = json.loads(chunk.decode("utf-8"))
                # record = logging.makeLogRecord(obj)
                # asyncio.run(self.broadcast(record))
                # Deserialize using jsonpickle
                log_record = pickle.loads(chunk)
                record = logging.makeLogRecord(log_record)
                asyncio.run(self.broadcast(record))

            except Exception as e:
                print(f"Error handling log record: {e}")
                break

    def format(self, record):
        # Format the log record as a string
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        return formatter.format(record)

    async def broadcast(self, record):
        """
        Broadcast the log message to all connected WebSocket clients.
        """
        print(f"Broadcasting message: {record}")
        message = self.format(record)
        await broadcast_to_clients(message)


async def broadcast_to_clients(message):
    """
    Asynchronously sends log messages to all registered WebSocket clients
    and flushes the output immediately after sending.
    """
    if log_server.clients:
        await asyncio.gather(
            *[send_and_flush(client, message) for client in log_server.clients]
        )


async def send_and_flush(client, message):
    """
    Sends a message to a client and flushes the output if the client supports flushing.
    """
    # Send the message immediately
    await client.send(message)
    # Ensure that the message is immediately flushed
    await asyncio.sleep(0)  # Yield control to ensure async processing
    await flush_client(client)


async def flush_client(client):
    """
    Flushes the client output if the client supports the flush operation.
    """
    if hasattr(client, "flush"):
        await client.flush()


class LogRecordSocketReceiver(socketserver.ThreadingTCPServer):
    """
    Simple TCP socket-based logging receiver.
    LogRecordSocketReceiver:
    A TCP server that listens for incoming log records on a specified host and port (localhost:9999).
    Manages connected WebSocket clients.

    Listens on ws://localhost:6789 for client connections.
    When a client connects, it is registered to receive broadcasted log message
    """

    allow_reuse_address = True

    def __init__(self, host="localhost", port=9999, handler=LogRecordStreamHandler):
        super().__init__((host, port), handler)
        self.loop = asyncio.get_event_loop()
        self.clients = set()

    def start_server(self):
        print(f"Starting log server on {self.server_address}")
        server_thread = threading.Thread(target=self.serve_forever)
        server_thread.daemon = True
        server_thread.start()

    async def register_client(self, websocket):
        """
        Registers a new WebSocket client.
        """
        self.clients.add(websocket)
        print(f"Client added to register_client : {websocket}")
        print(f"All websocket clients           : {self.clients}")
        try:
            await websocket.wait_closed()
        finally:
            self.clients.remove(websocket)


# Initialize the log server
log_server = LogRecordSocketReceiver()


# Start WebSocket server
async def websocket_handler(websocket, path):
    await log_server.register_client(websocket)


def start_servers():
    """
    The start_servers function starts both the log server and the WebSocket server concurrently.
    """
    log_server.start_server()
    ws_server = websockets.serve(websocket_handler, "localhost", 6789)
    print("WebSocket server started on ws://localhost:6789")
    asyncio.get_event_loop().run_until_complete(ws_server)
    asyncio.get_event_loop().run_forever()


if __name__ == "__main__":
    """
    The log server runs in a separate thread to handle blocking I/O operations without hindering the asynchronous WebSocket operations.
    """
    import threading

    start_servers()
