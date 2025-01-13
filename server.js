const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const rooms = new Set(); // Add this line to initialize rooms
let users = {};

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat-html.html"));
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setName", (name) => {
    users[socket.id] = name;
    console.log(`${name} set their name.`);
    socket.emit("nameSet", name); // Add confirmation event
  });

  socket.on("createRoom", (room) => {
    console.log("Starting to create a Room function.");
    if (!rooms.has(room)) {
      rooms.add(room);
      socket.join(room);
      console.log(`User ${users[socket.id]} created and joined room: ${room}`);
      socket.emit("roomCreated", room);
      io.emit("availableRooms", Array.from(rooms));
    } else {
      socket.emit("roomError", "Room already exists.");
    }
  });

  socket.on("getRooms", () => {
    socket.emit("availableRooms", Array.from(rooms));
  });

  socket.on("joinRoom", (room) => {
    // Leave previous room if any
    Array.from(socket.rooms).forEach((r) => {
      if (r !== socket.id) socket.leave(r);
    });

    socket.join(room);
    console.log(`User ${users[socket.id]} joined room: ${room}`);
    socket.to(room).emit("message", `${users[socket.id]} joined the room.`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`User ${users[socket.id]} left room: ${room}`);
    socket.to(room).emit("message", `${users[socket.id]} left the room.`);
  });

  socket.on("chatMessage", (data) => {
    const { room, message } = data;
    const senderName = users[socket.id] || "Anonymous";
    const formattedMessage = `${senderName}: ${message}`;
    io.to(room).emit("message", formattedMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
