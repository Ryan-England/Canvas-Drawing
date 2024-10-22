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

canvas.addEventListener("mousedown", (m) => {
  x = m.offsetX;
  y = m.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (m) => {
  if (isDrawing) {
    drawLine(ctx, x, y, m.offsetX, m.offsetY);
    x = m.offsetX;
    y = m.offsetY;
  }
});

window.addEventListener("mouseup", (m) => {
  if (isDrawing) {
    drawLine(ctx, x, y, m.offsetX, m.offsetY);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

function clear() {
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");

    ctx?.clearRect(0, 0, 256, 256);
  }
}

const clearButton = document.createElement("button")
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  clear();
});
app.append(clearButton);


function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}