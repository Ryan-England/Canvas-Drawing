import "./style.css";

const THICK_LINE = 8;
const THIN_LINE = 2;
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;
const EXPORT_WIDTH = 1024;
const EXPORT_HEIGHT = 1024;

class LineCommand {
  points: {x: number, y: number}[];
  width: number;
  color: string;

  constructor(x: number, y: number, style: string, newColor: string) {
    this.points = [{ x, y }];

    if (style == "thick") {
      //this.width = 8;
      this.width = THICK_LINE;
    } else {
      //this.width = 2;
      this.width = THIN_LINE;
    }

    this.color = newColor;
  }
  display(context: CanvasRenderingContext2D) {
    context.strokeStyle = this.color;
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
    if (currentStyle == "thick") {
      cursor.fontSize = 28;
      cursor.face = "^m^";
      if (cursor.mouseDown) {
        cursor.face = "^x^";
      }
    } else if (currentStyle == "thin") {
      cursor.fontSize = 20;
      cursor.face = "^v^";
      if (cursor.mouseDown) {
        cursor.face = "^w^";
      }
    }
    else {
      cursor.fontSize = 24;
      cursor.face = currentStyle;
    }
    context.font = `${cursor.fontSize}px monospace`;
    context.fillText(cursor.face, cursor.x - cursor.xOffset, cursor.y - cursor.yOffset);
  }
}

function clear() {
  //ctx.clearRect(0, 0, 256, 256);
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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


const APP_NAME = "Hello, welcome to our Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

let isDrawing: boolean = false;
let isMarker: boolean = true;
let currentStyle: string = "thin";
const lines: (LineCommand | StickerCommand)[] = [];
const redoStack: (LineCommand | StickerCommand)[] = [];
let currentLine: LineCommand;
let currentSticker: StickerCommand;

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

  if (isMarker) {
    const currentColor = `rgb(${redSlider.value}, ${greenSlider.value}, ${blueSlider.value})`
    console.log(currentColor);
    currentLine = new LineCommand(cursor.x, cursor.y, currentStyle, currentColor);
    currentLine.grow(cursor.x, cursor.y);
    lines.push(currentLine);
    canvas.dispatchEvent(draw);
  } else {
    currentSticker = new StickerCommand(cursor.x, cursor.y, currentStyle);
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
  if (isMarker && currentLine != undefined) currentLine.grow(cursor.x, cursor.y);
  isDrawing = false;
  currentLine = new LineCommand(cursor.x, cursor.y, currentStyle, "black");
  cursor.mouseDown = false;
  canvas.dispatchEvent(draw);
});

app.append(document.createElement("br"), document.createElement("br"));

const redLabel = document.createElement("div");
redLabel.innerText = "Red: "
app.append(redLabel);

const redSlider = document.createElement("input");
redSlider.type = "range";
redSlider.min = "0";
redSlider.max = "255";
redSlider.step = "5";
redSlider.value = "0";
app.append(redSlider);

const greenLabel = document.createElement("div");
greenLabel.innerText = "Green: "
app.append(greenLabel);

const greenSlider = document.createElement("input");
greenSlider.type = "range";
greenSlider.min = "0";
greenSlider.max = "255";
greenSlider.step = "5";
greenSlider.value = "0";
app.append(greenSlider)

const blueLabel = document.createElement("div");
blueLabel.innerText = "Blue: "
app.append(blueLabel);

const blueSlider = document.createElement("input");
blueSlider.type = "range";
blueSlider.min = "0";
blueSlider.max = "255";
blueSlider.step = "5";
blueSlider.value = "0";
app.append(blueSlider)
app.append(document.createElement("br"));

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
    name: "Thin Sketch",
    press: () => {
      currentStyle = "thin";
      isMarker = true;
    }
  },
  {
    name: "Thick Sketch",
    press: () => {
      currentStyle = "thick";
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
          currentStyle = newSticker;
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
    name: "Export",
    press: () => {
      const confirmation = prompt("Would you like a transparent background? (Y/N)", "n");
      const firstLetter = Array.from(String(confirmation))[0];
      const tempCanvas = document.createElement("canvas");
      tempCanvas.id = "ExportCanvas";
      //tempCanvas.height = 1024;
      //tempCanvas.width = 1024;
      tempCanvas.height = EXPORT_HEIGHT;
      tempCanvas.width = EXPORT_WIDTH;
      const expCtx = tempCanvas.getContext("2d")!;
      expCtx.scale(4, 4);
      if (!(firstLetter == "y" || firstLetter == "Y")) {
        //expCtx.clearRect(0, 0, 1024, 1024)
        expCtx.clearRect(0, 0, tempCanvas.height, tempCanvas.width);
      }
      for (const line of lines) {
        line.display(expCtx);
      }
      const anchor = document.createElement("a");
      anchor.href = tempCanvas.toDataURL("image/png");
      anchor.download = "sketchpadExport.png";
      anchor.click();
    }
  },
  {
    name: "🍫 Sticker",
    press: () => {
      currentStyle = "🍫";
      isMarker = false;
      canvas.dispatchEvent(moved);
    }
  },
  {
    name: "🏳️‍⚧️ Sticker",
    press: () => {
      currentStyle = "🏳️‍⚧️";
      isMarker = false;
      canvas.dispatchEvent(moved);
    }
  },
  {
    name: "🎊 Sticker",
    press: () => {
      currentStyle = "🎊";
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
