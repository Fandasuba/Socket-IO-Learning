import { io } from "socket.io-client";

const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const messagesList = document.getElementById("messages");

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value;
  const listItem = document.createElement("li");
  listItem.textContent = message;
  messagesList.appendChild(listItem);
  messageInput.value = "";
  messageInput.focus();

  const socket = io("http://localhost:3000");
});
