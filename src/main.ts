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
