import "./style.css";

const APP_NAME = "Hello, welcome to our Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;


const header = document.createElement("h1");
header.innerHTML = "Please draw here:";
app.append(header);

/*
const canvasGet = document.getElementById("canvas");
const ctx = canvasGet.getContext("2d");
*/
const canvas = document.createElement("canvas");
canvas.height = 256;
canvas.width = 256;
app.append(canvas);