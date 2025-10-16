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

interface Draw {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
}

function createDrawingLine(
  startX: number,
  startY: number,
  thickness: number,
): Draw {
  const points: Point[] = [{ x: startX, y: startY }];

  function drag(x: number, y: number) {
    points.push({ x, y });
  }

  function display(ctx: CanvasRenderingContext2D) {
    if (points.length < 2) return;
    ctx.beginPath();
    const start = points[0];
    if (start == null) return;
    ctx.lineWidth = thickness;
    ctx.moveTo(start.x, start.y);
    for (const p of points) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  return { drag, display };
}

let lines: Draw[] = [];
const redoLines: Draw[] = [];
let currentLine: Draw | null = null;
let currentThickness = 2;

canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;

  currentLine = createDrawingLine(cursor.x, cursor.y, currentThickness);
  lines.push(currentLine);

  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
});

canvas.addEventListener("mousemove", (event) => {
  if (!cursor.active || currentLine == null) return;

  currentLine.drag(event.offsetX, event.offsetY);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("drawing-changed", () => {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) line.display(ctx);
});

const buttonContainer = document.createElement("div");
document.body.appendChild(buttonContainer);

const makeButton = (name: string, OnClick: () => void): HTMLButtonElement => {
  const button = document.createElement("button");
  button.textContent = name;
  button.addEventListener("click", OnClick);
  buttonContainer.appendChild(button);
  return button;
};

makeButton("Clear", () => {
  lines = [];
  currentLine = null;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

makeButton("Undo", () => {
  if (lines.length == 0) return;
  redoLines.push(lines.pop()!);

  canvas.dispatchEvent(new Event("drawing-changed"));
});

makeButton("Redo", () => {
  if (redoLines.length == 0) return;

  lines.push(redoLines.pop()!);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

function selectTool(thickness: number) {
  currentThickness = thickness;
}

makeButton("Thin", () => selectTool(2));
makeButton("Thick", () => selectTool(8));
