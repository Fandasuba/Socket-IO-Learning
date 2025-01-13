const socket = io("http://localhost:3000");
const roomSelector = document.getElementById("room-selector");
const joinRoomButton = document.getElementById("join-room");
const createRoomButton = document.getElementById("create-room");
const createRoomInput = document.getElementById("create-room-input");
const messagesDiv = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

let currentRoom = null; // for template literals for checking the room socket ids.

// Fetch available rooms on load
socket.emit("getRooms");
socket.on("availableRooms", (rooms) => {
  roomSelector.innerHTML = ""; // Clear existing options
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room;
    option.textContent = room;
    roomSelector.appendChild(option);
  });
});

// Handle creating a new room
createRoomButton.addEventListener("click", () => {
  const newRoom = createRoomInput.value.trim();
  if (newRoom) {
    socket.emit("createRoom", newRoom);
    createRoomInput.value = ""; // Clear input
  }
});

socket.on("roomCreated", (room) => {
  addMessage(`Room '${room}' created and joined.`);
  currentRoom = room;
});

socket.on("roomError", (error) => {
  addMessage(`Error: ${error}`);
});

// Join a room html listener and socket emit function.
joinRoomButton.addEventListener("click", () => {
  const selectedRoom = roomSelector.value;
  if (currentRoom) {
    socket.emit("leaveRoom", currentRoom);
  }
  currentRoom = selectedRoom;
  socket.emit("joinRoom", currentRoom);
  messagesDiv.innerHTML = "";
  addMessage(`You joined room: ${currentRoom}`);
});

socket.on("message", (message) => {
  // this one is for backend emits to the client.
  addMessage(message);
});

// submit html and submit emit function.
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("chatMessage", { room: currentRoom, message }); // Send message and room to server ending an object in style of socket demands, followed by a addMessage function to show your message without async. The function is below.
    addMessage(`You: ${message}`);
    messageInput.value = "";
  }
});

function addMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
}
