import pytest
import logging
import time
import random


# Set up a logger
def setup_logger(log_file, level=logging.INFO):
    logger = logging.getLogger(__name__)
    logger.setLevel(level)
    handler = logging.FileHandler(log_file)
    handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(handler)
    return logger


@pytest.mark.parametrize(
    "log_speed", [0.1, 0.5, 1.0, 5.0, 10.0]
)  # Adjust logging speed here
def test_logging(log_speed):
    log_file = pytest.config.getoption("--log-file")
    logger = setup_logger(log_file)

    for _ in range(100):  # Adjust the range for more or fewer log entries
        logger.info(f"Logging gibberish: {random.choice(['foo', 'bar', 'baz', 'qux'])}")
        time.sleep(log_speed)  # Log at the specified speed

    # Simulate a pass/fail scenario
    assert random.choice([True, False]), "Simulated test failure"
