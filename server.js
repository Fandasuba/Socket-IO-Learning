const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

// CORS for the adjustment of the chat array thing,
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// loads files in the route directory. And then loads the chat form for now.
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat-html.html"));
});

// Set up socket.io
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle creating a new room
  socket.on("createRoom", (room) => {
    if (!rooms.has(room)) {
      rooms.add(room);
      socket.join(room);
      console.log(`User ${socket.id} created and joined room: ${room}`);
      socket.emit("roomCreated", room); // Confirm room creation to the client
      io.emit("availableRooms", Array.from(rooms)); // Notify all clients of available rooms
    } else {
      socket.emit("roomError", "Room already exists.");
    }
  });

  // Handle fetching available rooms
  socket.on("getRooms", () => {
    socket.emit("availableRooms", Array.from(rooms));
  });

  socket.on("joinRoom", (room) => {
    // idea here is to connect to a room. Then the socket id is some unique generated id from socket itself to give ids for users that join.
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    socket.to(room).emit("message", `User ${socket.id} joined the room.`); // emit is a syntax for essentially sending something outbound to clients.
  });

  socket.on("chatMessage", ({ room, message }) => {
    // see the on syntax for the name of the key we sent as on object that relays to the server.
    console.log(`Message in room ${room} from ${socket.id}: ${message}`);
    io.to(room).emit("message", message); // message is the actual message
  });

  socket.on("disconnect", () => {
    // on is a syntax used to listen for an event. emit is the actual script that runs. so socket.emit("disconnect"...) is the script that runs when you want to disconnect.")
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
