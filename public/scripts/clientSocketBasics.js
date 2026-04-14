const socket = io();

var localToken = localStorage.getItem("token");
var localUsername = localStorage.getItem("username");

socket.emit("connection-protocol", localToken)
