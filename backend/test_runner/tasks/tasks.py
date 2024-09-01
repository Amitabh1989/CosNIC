# tasks.py

from channels.layers import get_channel_layer
from celery import shared_task
import time


@shared_task
def run_test(test_id):
    channel_layer = get_channel_layer()
    room_group_name = f"test_{test_id}"

    # Example log generation
    for i in range(10):
        log_message = f"Log entry {i} for test {test_id}"
        channel_layer.group_send(
            room_group_name, {"type": "log_message", "message": log_message}
        )
        time.sleep(1)
