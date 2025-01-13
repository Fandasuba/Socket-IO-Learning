const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app); // Use Express to create the server
const io = socketIo(server); // Set up Socket.IO with the server

// Serve static files (like script.js) from the current directory
app.use(express.static(__dirname));

// Serve the chat HTML file when the root URL is requested
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat-html.html")); // Serve chat-html.html from the root folder
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});

// Set up socket.io
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // You can add socket event listeners here (e.g., for messages)

  // Handle socket disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
