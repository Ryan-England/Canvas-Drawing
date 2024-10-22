import "./style.css";

const APP_NAME = "Hello, welcome to our Canvas.";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;
