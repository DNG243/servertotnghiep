var socket = io('http://localhost:3000');
socket.on('reload', function () {
  location.reload();
});
