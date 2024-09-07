import asyncio
import logging
import pickle
import socket

# from logging.handlers import StreamRequestHandler, ThreadingTCPServer
# from logging import handlers
import socketserver
import struct

import websockets


# class LogRecordStreamHandler(logging.handlers.StreamRequestHandler):
class LogRecordStreamHandler(socketserver.StreamRequestHandler):
    """
    Handler for a streaming logging request.
    LogRecordStreamHandler:
        Handles incoming log records from the SocketHandler.
        Unpickles the log records and formats them.
        Broadcasts the formatted log messages to all connected WebSocket clients using the broadcast_to_clients function.

    """

    # Additional code added to the original snippet
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print("LogRecordStreamHandler initialized")

    def handle(self):
        """
        Handles multiple requests - each expected to be a 4-byte length,
        followed by the LogRecord in pickle format.
        """
        # while True:
        #     chunk = self.connection.recv(4)
        #     if len(chunk) < 4:
        #         break
        #     slen = struct.unpack(">L", chunk)[0]
        #     chunk = self.connection.recv(slen)
        #     while len(chunk) < slen:
        #         chunk += self.connection.recv(slen - len(chunk))
        #     obj = self.unPickle(chunk)
        #     record = logging.makeLogRecord(obj)
        #     asyncio.run(self.broadcast(record))
        self.connection.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

        while True:
            chunk = self.connection.recv(4)
            if len(chunk) < 4:
                break
            slen = struct.unpack(">L", chunk)[0]
            chunk = self.connection.recv(slen)
            while len(chunk) < slen:
                chunk += self.connection.recv(slen - len(chunk))
            obj = self.unPickle(chunk)
            record = logging.makeLogRecord(obj)
            asyncio.run(self.broadcast(record))

        # buffer = b""
        # while True:
        #     chunk = self.connection.recv(4096)
        #     if not chunk:
        #         break
        #     buffer += chunk
        #     while len(buffer) >= 4:
        #         slen = struct.unpack(">L", buffer[:4])[0]
        #         if len(buffer) < 4 + slen:
        #             break
        #         data = buffer[4 : 4 + slen]
        #         buffer = buffer[4 + slen :]
        #         obj = self.unPickle(data)
        #         record = logging.makeLogRecord(obj)
        #         asyncio.run(self.broadcast(record))

    def unPickle(self, data):
        return pickle.loads(data)

    def format(self, record):
        # Format the log record as a string
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        return formatter.format(record)

    async def broadcast(self, record):
        print(f"Broadcasting message: {record}")
        message = self.format(record)
        await broadcast_to_clients(message)


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
        self.clients.add(websocket)
        print(f"Client added to register_client : {websocket}")
        print(f"All websocket clients           : {self.clients}")
        try:
            await websocket.wait_closed()
        finally:
            self.clients.remove(websocket)


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
    await client.send(message)
    await flush_client(client)


async def flush_client(client):
    """
    Flushes the client output if the client supports the flush operation.
    """
    if hasattr(client, "flush"):
        await client.flush()


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
