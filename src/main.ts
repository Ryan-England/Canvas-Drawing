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
canvas.style.cursor = "none";
app.append(canvas);

const ctx = canvas.getContext("2d")!;

class LineCommand {
  points: {x: number, y: number}[];
  width: number;

  constructor(x: number, y: number, style: string) {
    this.points = [{ x, y }];

    if (style == "thick") {
      this.width = 8;
    } else {
      this.width = 2;
    }
  }
  display(context: CanvasRenderingContext2D) {
    context.strokeStyle = "black";
    context.lineWidth = this.width;
    if (this.points.length > 1) {
      context.beginPath();
      const { x, y } = this.points[0];
      context.moveTo(x, y);
      for (const { x, y } of this.points) {
        context.lineTo(x, y);
      }
      context.stroke();
    }
  }
  grow(x: number, y: number) {
    this.points.push({ x, y });
  }
}

const cursor = {
  x: 0,
  y: 0,
  fontSize: 28,
  face: "^v^",
  active: false,
  mouseDown: false,
  draw: (context: CanvasRenderingContext2D) => {
    if (style == "thick") {
      cursor.fontSize = 28;
      cursor.face = "^m^";
      if (cursor.mouseDown) {
        cursor.face = "^x^";
      }
    } else {
      cursor.fontSize = 20;
      cursor.face = "^v^";
      if (cursor.mouseDown) {
        cursor.face = "^w^";
      }
    }
    context.font = `${cursor.fontSize}px monospace`;
    context.fillText(cursor.face, cursor.x - 20, cursor.y);
  }
}

let isDrawing: boolean = false;
let style: string = "thin";
const lines: LineCommand[] = [];
const redoStack: LineCommand[] = [];
let currentLine: LineCommand;

const draw =new Event("drawing-changed");
canvas.addEventListener("drawing-changed", redraw);
const moved = new Event("tool-moved");
canvas.addEventListener("tool-moved", redraw);

canvas.addEventListener("mouseout", () => {
  cursor.active = false;
  canvas.dispatchEvent(moved);
});

canvas.addEventListener("mouseenter", (m) => {
  cursor.x = m.offsetX;
  cursor.y = m.offsetY;
  cursor.active = true;
  canvas.dispatchEvent(moved);
})

canvas.addEventListener("mousedown", (m) => {
  cursor.x = m.offsetX;
  cursor.y = m.offsetY;
  isDrawing = true;
  cursor.mouseDown = true;

  currentLine = new LineCommand(cursor.x, cursor.y, style);
  currentLine.grow(cursor.x, cursor.y);
  lines.push(currentLine);
  canvas.dispatchEvent(draw);
});

canvas.addEventListener("mousemove", (m) => {

  cursor.x = m.offsetX;
  cursor.y = m.offsetY;
  canvas.dispatchEvent(moved);

  if (isDrawing) {
    currentLine.grow(cursor.x, cursor.y);
    canvas.dispatchEvent(draw);
  }
});

self.addEventListener("mouseup", (m) => {
  cursor.x = m.offsetX;
  cursor.y = m.offsetY;
  currentLine.grow(cursor.x, cursor.y);
  isDrawing = false;
  currentLine = new LineCommand(cursor.x, cursor.y, style);
  cursor.mouseDown = false;
  canvas.dispatchEvent(draw);
});

app.append(document.createElement("br"), document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  clear();
  lines.splice(0, lines.length);
  redoStack.splice(0, lines.length);
});
app.append(clearButton);

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  const movedLine: LineCommand | undefined = lines.pop();
  if (movedLine != undefined) {
    redoStack.push(movedLine);
    canvas.dispatchEvent(draw);
  }
});
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  const movedLine: LineCommand | undefined = redoStack.pop();
  if (movedLine != undefined) {
    lines.push(movedLine);
    canvas.dispatchEvent(draw);
  }
});
app.append(redoButton);

const thinButton = document.createElement("button");
thinButton.textContent = "Thin Marker";
thinButton.addEventListener("click", () => {
  style = "thin";
});
app.append(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick Marker";
thickButton.addEventListener("click", () => {
  style = "thick";
});
app.append(thickButton);

function clear() {
  ctx.clearRect(0, 0, 256, 256);
}

function redraw() {
  clear();
  for (const line of lines) {
    line.display(ctx);
  }
  if (cursor.active) {
    cursor.draw(ctx);
  }
}