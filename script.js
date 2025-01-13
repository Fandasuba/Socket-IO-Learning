const socket = io("http://localhost:3000");
const nameSection = document.getElementById("name-section");
const chatSection = document.getElementById("chat-section");
const usernameInput = document.getElementById("username-input");
const setNameButton = document.getElementById("set-name-button");
const roomSelector = document.getElementById("room-selector");
const joinRoomButton = document.getElementById("join-room");
const createRoomButton = document.getElementById("create-room");
const createRoomInput = document.getElementById("create-room-input");
const messagesDiv = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

let currentRoom = null;
let username = "";

// Handle name setting
setNameButton.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    socket.emit("setName", name);
  } else {
    alert("Please enter a valid name.");
  }
});

// Confirm name was set
socket.on("nameSet", (name) => {
  username = name;
  nameSection.style.display = "none";
  chatSection.style.display = "block";
  addMessage(`Welcome, ${username}!`);
});

// Handle room management
socket.emit("getRooms");

socket.on("availableRooms", (rooms) => {
  roomSelector.innerHTML = '<option value="">Select a room...</option>';
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room;
    option.textContent = room;
    roomSelector.appendChild(option);
  });
});

createRoomButton.addEventListener("click", () => {
  const newRoom = createRoomInput.value.trim();
  if (newRoom) {
    socket.emit("createRoom", newRoom);
    createRoomInput.value = "";
  } else {
    alert("Please enter a room name.");
  }
});

socket.on("roomCreated", (room) => {
  currentRoom = room;
  addMessage(`Room '${room}' created and joined.`);
  // Auto-select the newly created room
  roomSelector.value = room;
});

socket.on("roomError", (error) => {
  alert(`Error: ${error}`);
});

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
  socket.emit("joinRoom", currentRoom);
  messagesDiv.innerHTML = "";
  addMessage(`You joined room: ${currentRoom}`);
});

// Handle messages
socket.on("message", (message) => {
  addMessage(message);
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message && currentRoom) {
    socket.emit("chatMessage", { room: currentRoom, message });
    messageInput.value = "";
  } else if (!currentRoom) {
    alert("Please join a room first.");
  }
});

function addMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
