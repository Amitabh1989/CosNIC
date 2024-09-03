// In your JavaScript file

const testId = 123;  // Replace with your dynamic test ID
const socket = new WebSocket(`ws://${window.location.host}/ws/logs/${testId}/`);

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    document.getElementById('log').innerText += data.message + '\n';
};

socket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};
