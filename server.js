const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const rooms = new Set(); // Set creates an object containing all the rooms, which also features messages due to emit object variables. Double check this at some point.
const users = new Map(); // Using Map instead of object for better user tracking

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
  console.log("User connected:", socket.id);

  socket.emit("availableRooms", Array.from(rooms)); // sends an array of available rooms to the client side.

  socket.on("setName", (name) => {
    // listens for an event called setName on the client side.
    console.log(`User ${socket.id} set name to: ${name}`);
    users.set(socket.id, name);
    socket.emit("availableRooms", Array.from(rooms));
  });

  socket.on("createRoom", (room) => {
    console.log(`Creating room: ${room}`);
    if (!rooms.has(room)) {
      rooms.add(room);
      socket.emit("roomCreated", room);
      io.emit("availableRooms", Array.from(rooms)); // looking for the rooms array from above.
    } else {
      socket.emit("roomError", "Room already exists");
    }
  });

  socket.on("getRooms", () => {
    socket.emit("availableRooms", Array.from(rooms));
  });

  socket.on("joinRoom", (room) => {
    const userName = users.get(socket.id) || "Anonymous"; // display name case checking.

    // Leave all current rooms
    socket.rooms.forEach((r) => {
      // Defaults to leaving rooms because some strange join room on start thing that was going on.
      if (r !== socket.id) {
        socket.leave(r);
      }
    });

    socket.join(room);
    socket.to(room).emit("message", `${userName} has joined the room.`);
    console.log(`${userName} joined room: ${room}`);
  });

  socket.on("leaveRoom", (room) => {
    // redundant code atm since i never made leave button.
    const userName = users.get(socket.id) || "Anonymous";
    socket.leave(room);
    socket.to(room).emit("message", `${userName} has left the room.`);
  });

  socket.on("chatMessage", (data) => {
    const userName = users.get(socket.id) || "Anonymous";
    const formattedMessage = `${userName}: ${data.message}`;
    io.to(data.room).emit("message", formattedMessage);
  });

  socket.on("disconnect", () => {
    const userName = users.get(socket.id) || "Anonymous";
    console.log(`User disconnected: ${userName}`);
    users.delete(socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
