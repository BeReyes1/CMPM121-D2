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

interface Point {
  x: number;
  y: number;
}
type Line = Point[];

let lines: Line[] = [];
const redoLines: Line[] = [];
let currentLine: Line = [];

canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;

  currentLine.push({ x: cursor.x, y: cursor.y });
  lines.push(currentLine);

  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = [];
});

canvas.addEventListener("mousemove", (event) => {
  if (!cursor.active) return;

  currentLine.push({ x: event.offsetX, y: event.offsetY });
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("drawing-changed", () => {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const line of lines) {
    if (line.length > 1) {
      ctx.beginPath();
      const start = line[0];
      if (start == null) continue;
      ctx.moveTo(start.x, start.y);
      for (const { x, y } of line) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
});

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.appendChild(clearButton);

clearButton.addEventListener("mousedown", () => {
  lines = [];
  currentLine = [];
  canvas.dispatchEvent(new Event("drawing-changed"));
});

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
document.body.appendChild(undoButton);

undoButton.addEventListener("mousedown", () => {
  if (lines.length == 0) return;
  redoLines.push(lines.pop()!);

  canvas.dispatchEvent(new Event("drawing-changed"));
});

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
document.body.appendChild(redoButton);

redoButton.addEventListener("mousedown", () => {
  if (redoLines.length == 0) return;

  lines.push(redoLines.pop()!);
  canvas.dispatchEvent(new Event("drawing-changed"));
});
