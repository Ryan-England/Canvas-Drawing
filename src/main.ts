import "./style.css";

const APP_NAME = "Hello, welcome to our Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;


const header = document.createElement("h1");
header.innerHTML = "Please draw here:";
app.append(header);

const canvas = document.createElement("canvas");
canvas.id = "getCanvas";
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

class StickerCommand {
 point: {x: number, y: number};
 sticker: string;

 constructor(x:number, y:number, image:string) {
  this.point = {x, y};
  this.sticker = image;
 }

 display(context: CanvasRenderingContext2D) {
  context.font = `24px monospace`;
  context.fillText(this.sticker, this.point.x - cursor.xOffset, this.point.y - cursor.yOffset);
 }
 drag(x: number, y: number) {
  this.point = {x, y};
 }
}

const cursor = {
  x: 0,
  y: 0,
  xOffset: 20,
  yOffset: 0,
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
    } else if (style == "thin") {
      cursor.fontSize = 20;
      cursor.face = "^v^";
      if (cursor.mouseDown) {
        cursor.face = "^w^";
      }
    }
    else {
      cursor.fontSize = 24;
      cursor.face = style;
    }
    context.font = `${cursor.fontSize}px monospace`;
    context.fillText(cursor.face, cursor.x - cursor.xOffset, cursor.y - cursor.yOffset);
  }
}

let isDrawing: boolean = false;
let isMarker: boolean = true;
let style: string = "thin";
const lines: (LineCommand | StickerCommand)[] = [];
const redoStack: (LineCommand | StickerCommand)[] = [];
let currentLine: LineCommand;
let currentSticker: StickerCommand;

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


  console.log(isMarker)
  if (isMarker) {
    currentLine = new LineCommand(cursor.x, cursor.y, style);
    currentLine.grow(cursor.x, cursor.y);
    lines.push(currentLine);
    canvas.dispatchEvent(draw);
  } else {
    currentSticker = new StickerCommand(cursor.x, cursor.y, style);
    lines.push(currentSticker);
  }
});

canvas.addEventListener("mousemove", (m) => {

  cursor.x = m.offsetX;
  cursor.y = m.offsetY;
  canvas.dispatchEvent(moved);

  if (isDrawing && isMarker) {
    currentLine.grow(cursor.x, cursor.y);
    canvas.dispatchEvent(draw);
  } else if (isDrawing) {
    currentSticker.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(moved);
  }
});

self.addEventListener("mouseup", (m) => {
  cursor.x = m.offsetX;
  cursor.y = m.offsetY;
  if (isMarker) currentLine.grow(cursor.x, cursor.y);
  isDrawing = false;
  currentLine = new LineCommand(cursor.x, cursor.y, style);
  cursor.mouseDown = false;
  canvas.dispatchEvent(draw);
});

app.append(document.createElement("br"), document.createElement("br"));

const buttons: HTMLButtonElement[] = [];
let buttonCounter = 0;

const availableTools = [
  {
  name: "Clear",
  press: () => {
    clear();
    lines.splice(0, lines.length);
    redoStack.splice(0, lines.length);
    }
  },
  {
    name: "Undo",
    press: () => {
      const movedLine: LineCommand | StickerCommand | undefined = lines.pop();
      if (movedLine != undefined) {
        redoStack.push(movedLine);
        canvas.dispatchEvent(draw);
      }
    }
  },
  {
    name: "Redo",
    press: () => {
      const movedLine: LineCommand | StickerCommand | undefined = redoStack.pop();
      if (movedLine != undefined) {
        lines.push(movedLine);
        canvas.dispatchEvent(draw);
      }
    }
  },
  {
    name: "Thin Marker",
    press: () => {
      style = "thin";
      isMarker = true;
    }
  },
  {
    name: "Thick Marker",
    press: () => {
      style = "thick";
      isMarker = true;
    }
  }, 
  {
    name: "Custom Sticker",
    press: () => {
      const newSticker = prompt("Please enter text or an emoji: ", "🤷‍♀️");
      if (newSticker != null) {
        const newButton = document.createElement("button");
        newButton.textContent = `${newSticker} Sticker`;
        newButton.addEventListener("click", () => {
          style = newSticker;
          isMarker = false;
          canvas.dispatchEvent(moved);
        })
        app.append(newButton);
        buttons.push(newButton);
        buttonCounter++;
        if (buttonCounter >= 5) {
          app.append(document.createElement("br"));
          buttonCounter = 0;
        }
      }
    }
  },
  {
    name: "🍫 Sticker",
    press: () => {
      style = "🍫";
      isMarker = false;
      canvas.dispatchEvent(moved);
    }
  },
  {
    name: "🏳️‍⚧️ Sticker",
    press: () => {
      style = "🏳️‍⚧️";
      isMarker = false;
      canvas.dispatchEvent(moved);
    }
  },
  {
    name: "🎊 Sticker",
    press: () => {
      style = "🎊";
      isMarker = false;
      canvas.dispatchEvent(moved);
    }
  }
]

for (const tool of availableTools) {
  const toolButton = document.createElement("button");
  toolButton.textContent = tool.name;
  toolButton.addEventListener("click", tool.press)
  app.append(toolButton);
  buttons.push(toolButton);
  buttonCounter++;
  if (buttonCounter >= 5) {
    app.append(document.createElement("br"));
    buttonCounter = 0;
  }
}

/*
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
  const movedLine: LineCommand | StickerCommand | undefined = lines.pop();
  if (movedLine != undefined) {
    redoStack.push(movedLine);
    canvas.dispatchEvent(draw);
  }
});
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  const movedLine: LineCommand | StickerCommand | undefined = redoStack.pop();
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
  isMarker = true;
});
app.append(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick Marker";
thickButton.addEventListener("click", () => {
  style = "thick";
  isMarker = true;
});
app.append(thickButton);

const chocButton = document.createElement("button");
chocButton.textContent = "🍫 Sticker";
chocButton.addEventListener("click", () => {
  style = "🍫";
  isMarker = false;
  canvas.dispatchEvent(moved);
});
app.append(chocButton);
*/

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