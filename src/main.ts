import "./style.css";

document.body.innerHTML = "";

const title = document.createElement("h1");
title.textContent = "App Title";
document.body.appendChild(title);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.className = "canvas";
document.body.appendChild(canvas);

const cursor = { active: false, x: 0, y: 0 };
const ctx = canvas.getContext("2d");

canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

canvas.addEventListener("mousemove", (event) => {
  if (!cursor.active) {
    return;
  }

  ctx?.beginPath();
  ctx?.moveTo(cursor.x, cursor.y);
  ctx?.lineTo(event.offsetX, event.offsetY);
  ctx?.stroke();
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.appendChild(clearButton);

clearButton.addEventListener("mousedown", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
});
