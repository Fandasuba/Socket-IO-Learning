const socket = io("http://localhost:3000");
const nameSection = document.getElementById("name-section");
const chatSection = document.getElementById("chat-section");
const usernameInput = document.getElementById("username-input");
const setNameButton = document.getElementById("set-name-button");
const userDisplay = document.getElementById("user-display");
const roomSelector = document.getElementById("room-selector");
const joinRoomButton = document.getElementById("join-room");
const createRoomButton = document.getElementById("create-room");
const createRoomInput = document.getElementById("create-room-input");
const messagesDiv = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

let currentRoom = null;
let username = "";

// Create guest name.
setNameButton.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    socket.emit("setName", name);
    nameSection.style.display = "none";
    chatSection.style.display = "block";
    userDisplay.textContent = `Current User: ${name}`;

    console.log("Name set:", name);
  } else {
    alert("Please enter a valid name.");
  }
});

// Create room function,
createRoomButton.addEventListener("click", () => {
  const newRoom = createRoomInput.value.trim();
  if (newRoom) {
    socket.emit("createRoom", newRoom);
    createRoomInput.value = "";
  } else {
    alert("Please enter a room name.");
  }
});

// Handle receiving the list of rooms
socket.on("availableRooms", (rooms) => {
  console.log("Received rooms:", rooms);
  roomSelector.innerHTML = '<option value="">Select a room...</option>';
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room;
    option.textContent = room;
    roomSelector.appendChild(option);
  });
});

// Handle room creation confirmation
socket.on("roomCreated", (room) => {
  console.log("Room created:", room);
  socket.emit("getRooms"); // Request updated room list. See Server JS for reference for dynamic updating.
  alert(`Room '${room}' created successfully!`);
});

// Join room button handler and socket function.
joinRoomButton.addEventListener("click", () => {
  const selectedRoom = roomSelector.value;
  if (!selectedRoom) {
    alert("Please select a room to join.");
    return;
  }

  if (currentRoom) {
    socket.emit("leaveRoom", currentRoom);
  }

  currentRoom = selectedRoom;
  socket.emit("joinRoom", selectedRoom);
  messagesDiv.innerHTML = "";
  addMessage(`You joined room: ${selectedRoom}`);
});

// Message form processing.
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();

  if (!currentRoom) {
    alert("Please join a room first!");
    return;
  }

  if (message) {
    socket.emit("chatMessage", {
      room: currentRoom,
      message: message,
      username: username,
    });
    messageInput.value = "";
  }
});

// Handle incoming messages section.
socket.on("message", (message) => {
  addMessage(message);
});

function addMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Request initial rooms list on loading.
socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("getRooms");
});
