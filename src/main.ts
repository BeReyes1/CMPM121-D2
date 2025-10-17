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

canvas.style.cursor = "none";

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

function createSticker(startX: number, startY: number, emoji: string): Draw {
  let pos: Point = { x: startX, y: startY };

  function drag(x: number, y: number) {
    pos = { x, y };
  }

  function display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px monospace";
    ctx.fillText(emoji, pos.x - 16, pos.y + 16);
  }

  return { drag, display };
}

function createPreview(startX: number, startY: number, symbol: string): Draw {
  const points: Point[] = [{ x: startX, y: startY }];

  function drag(x: number, y: number) {
    points.push({ x, y });
  }

  function display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px monospace";
    const p = points[0];
    if (p == null) return;
    ctx.fillText(symbol, p.x - 16, p.y + 16);
  }

  return { drag, display };
}

function createStickerButtons() {
  const currentStickers = document.querySelectorAll(".sticker-button");
  currentStickers.forEach((b) => b.remove());

  stickers.forEach((sticker) => {
    const button = makeButton(sticker, () => {
      selectSticker(sticker);
      canvas.dispatchEvent(new Event("tool-moved"));
    });
    button.classList.add("sticker-button");
  });
}

let lines: Draw[] = [];
const redoLines: Draw[] = [];
let currentLine: Draw | null = null;
let currentThickness = 1;

let preview: Draw | null = null;
let currentTool: "Default" | "Custom" = "Default";
let currentSticker = "*";
const stickers: string[] = ["🦆", "🗑️", "🤡", "🌹", "📾"];

canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;

  if (currentTool == "Default") {
    currentLine = createDrawingLine(cursor.x, cursor.y, currentThickness);
  } else {
    currentLine = createSticker(cursor.x, cursor.y, currentSticker);
  }

  lines.push(currentLine);

  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
});

canvas.addEventListener("mousemove", (event) => {
  if (!cursor.active || currentLine == null) {
    preview = createPreview(event.offsetX, event.offsetY, currentSticker);
    canvas.dispatchEvent(new Event("tool-moved"));
  } else {
    currentLine.drag(event.offsetX, event.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mouseenter", () => {
  canvas.dispatchEvent(new Event("tool-moved"));
});

canvas.addEventListener("mouseleave", () => {
  cursor.active = false;
  preview = null;
  canvas.dispatchEvent(new Event("tool-moved"));
});

canvas.addEventListener("tool-moved", () => {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) line.display(ctx);
  if (preview && !cursor.active) {
    preview.display(ctx);
  }
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

makeButton("Export", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d");

  if (!exportCtx) return;

  const scaleFactor = exportCanvas.width / canvas.width;
  exportCtx.scale(scaleFactor, scaleFactor);

  for (const line of lines) {
    line.display(exportCtx);
  }

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

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
  currentTool = "Default";
  currentSticker = "*";
}

function selectSticker(sticker: string) {
  currentTool = "Custom";
  currentSticker = sticker;

  canvas.dispatchEvent(new Event("tool-moved"));
}

makeButton("Thin", () => selectTool(1));
makeButton("Thick", () => selectTool(10));

createStickerButtons();

makeButton("➕ Custom Sticker", () => {
  const text = prompt("Custom sticker text", "🧽");
  if (text && text.trim() !== "") {
    stickers.push(text);
    createStickerButtons();
    selectSticker(text);
    canvas.dispatchEvent(new Event("tool-moved"));
  }
});
