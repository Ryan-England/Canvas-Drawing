import "./style.css";

const APP_NAME = "Hello, welcome to our Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;


const header = document.createElement("h1");
header.innerHTML = "Please draw here:";
app.append(header);

const canvas = document.createElement("canvas");
canvas.id = "getCanvas"
canvas.height = 256;
canvas.width = 256;
app.append(canvas);

const ctx = canvas.getContext("2d");

let isDrawing: boolean = false;
let x: number = 0;
let y: number = 0;
const lines: {x, y}[][] = [];
const redoStack = [];
let currentLine: {x, y}[] = [];

const draw =new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => {
  redraw();
});

canvas.addEventListener("mousedown", (m) => {
  x = m.offsetX;
  y = m.offsetY;
  isDrawing = true;

  currentLine = [];
  currentLine.push({x, y});
  lines.push(currentLine);
  canvas.dispatchEvent(draw);
});

canvas.addEventListener("mousemove", (m) => {
  if (isDrawing) {
    //drawLine(ctx, x, y, m.offsetX, m.offsetY);
    x = m.offsetX;
    y = m.offsetY;

    currentLine.push({x, y});
    canvas.dispatchEvent(draw);
  }
});

window.addEventListener("mouseup", (m) => {
  //drawLine(ctx, x, y, m.offsetX, m.offsetY);
  x = m.offsetX;
  y = m.offsetY;
  currentLine.push({x, y});
  x = 0;
  y = 0;
  isDrawing = false;
  currentLine = [];
  canvas.dispatchEvent(draw);
});

const clearButton = document.createElement("button")
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  clear();
  lines.splice(0, lines.length);
});
app.append(clearButton);

function clear() {
  ctx?.clearRect(0, 0, 256, 256);
}

function redraw() {
  clear();
  for (const line of lines) {
    if (line.length > 1) {
      ctx?.beginPath();
      const { x, y } = line[0];
      ctx?.moveTo(x, y);
      for (const { x, y } of line) {
        ctx?.lineTo(x, y);
      }
      ctx?.stroke();
    }
  }
}

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}