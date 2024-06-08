const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const color = document.getElementById("color");
const colorOptions = Array.from(document.getElementsByClassName("color-option"));
const brush = document.getElementById("brush");
const erase = document.getElementById("erase");
const range = document.getElementById("range");
const clearCanvasBtn = document.getElementById("clearCanvas");
const saveCanvasBtn = document.getElementById("saveCanvas");
const loadCanvasBtn = document.getElementById("loadCanvas");
const deleteCanvasBtn = document.getElementById("deleteCanvas");

const startTimerBtn = document.getElementById("startTimer");
const timerDisplay = document.getElementById("timerDisplay");
const wordDisplay = document.getElementById("wordDisplay");
const exitPageBtn = document.getElementById("exitPage");

const INITIAL_COLOR = "#2c2c2c";
const INITIAL_LINEWIDTH = 5.0;
const CANVAS_WIDTH_SIZE = 700;
const CANVAS_HEIGHT_SIZE = 500;

canvas.width = CANVAS_WIDTH_SIZE;
canvas.height = CANVAS_HEIGHT_SIZE;
ctx.strokeStyle = INITIAL_COLOR;
ctx.fillStyle = INITIAL_COLOR;
ctx.lineWidth = range.value;

const MODE_BUTTON = [brush, erase];
let mode = brush;
let painting = false;

const words = ["사과", "바나나", "포도", "오렌지", "수박"]; // 미리 저장된 제시어들

function startPainting() { painting = true; }
function stopPainting() { painting = false; }

function onMouseMove(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    if (mode === brush) {
        if (!painting) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
        else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    else if (mode === erase) {
        if (painting) {
            ctx.clearRect(x - ctx.lineWidth / 2, y - ctx.lineWidth / 2, ctx.lineWidth, ctx.lineWidth);
        }
    }
}

function handleModeChange(event) {
    mode = event.target;
    for (let i = 0; i < MODE_BUTTON.length; i++) {
        const button = MODE_BUTTON[i];
        if (button === mode) {
            button.style.backgroundColor = "skyblue";
        }
        else {
            button.style.backgroundColor = "white";
        }
    }
    if (mode === brush) {
        ctx.strokeStyle = INITIAL_COLOR;
    }
}

function startTimer() {
    const timerDuration = 5000; // 5초
    let timeLeft = timerDuration / 1000;

    // 제시어 선택
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    wordDisplay.textContent = `제시어: ${selectedWord}`;

    timerDisplay.textContent = `타이머: ${timeLeft}초`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `타이머: ${timeLeft}초`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("시간 종료");
            saveDrawing(selectedWord);      // 시간이 종료되었을때만 제시어와 그림이 로컬 스토리지에 저장됨
        }
    }, 1000);
}

function handleRangeChange(event) {
    const size = event.target.value;
    ctx.lineWidth = size;
    range.value = size;
}

function onLineWidthChange(event) {
    ctx.lineWidth = event.target.value;
}

function onColorChange(event) {     // 색 팔레트 바꾸기
    ctx.strokeStyle = event.target.value;
    ctx.fillStyle = event.target.value;
}

function onColorClik(event) {   // 색 선택 버튼
    const colorValue = event.target.dataset.color;
    ctx.strokeStyle = colorValue;
    ctx.fillStyle = colorValue;
    color.value = colorValue;
}


function clearCanvas() {
    ctx.clearRect(0, 0, CANVAS_WIDTH_SIZE, CANVAS_HEIGHT_SIZE);
}

function saveDrawing(word) {    // ex) 사과_1, 사과_2 형식으로 같은 주제에 대해서는 count+1 형식으로 이름 저장됨
    let drawings = JSON.parse(localStorage.getItem("drawings")) || [];
    const existingDrawings = drawings.filter(d => d.title.startsWith(word));
    const count = existingDrawings.length;
    const title = `${word}_${count + 1}`;
    const dataURL = canvas.toDataURL();

    drawings.push({ title, dataURL });
    localStorage.setItem("drawings", JSON.stringify(drawings));
    alert("그림이 저장되었습니다.");
}


/* main.html에서 사용해야하는 기능 */
function loadCanvas() { // 저장된 그림 이름을 입력하면 canvas.html 페이지에서 나타남.
    const drawings = JSON.parse(localStorage.getItem("drawings")) || [];
    const titles = drawings.map(d => d.title).join("\n");
    const title = prompt(`불러올 그림의 제목을 입력하세요:\n${titles}`);
    const drawing = drawings.find(d => d.title === title);
    if (drawing) {
        const img = new Image();
        img.src = drawing.dataURL;
        img.onload = function () {
            const CANVAS_SIZE_WIDTH = canvas.width; // 캔버스 너비 설정
            const CANVAS_SIZE_HEIGHT = canvas.height; // 캔버스 높이 설정
            ctx.clearRect(0, 0, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT);
            ctx.drawImage(img, 0, 0, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT); // 캔버스 크기에 맞게 이미지를 그립니다
        }
    } else {
        alert("그림을 찾을 수 없습니다.");
    }
}

/* main.html에서 사용해야하는 기능 */
function deleteCanvas() {
    const drawings = JSON.parse(localStorage.getItem("drawings")) || [];
    const titles = drawings.map(d => d.title).join("\n");
    const title = prompt(`삭제할 그림의 제목을 입력하세요:\n${titles}`);
    const newDrawings = drawings.filter(d => d.title !== title);

    if (newDrawings.length < drawings.length) {
        localStorage.setItem("drawings", JSON.stringify(newDrawings));
        alert("그림이 삭제되었습니다.");
    }
}


function exitPage() {
    window.location.href = "../index.html";
}

if (canvas) {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", stopPainting);
    canvas.addEventListener("mouseleave", stopPainting);
}

MODE_BUTTON.forEach(mode => mode.addEventListener("click", handleModeChange));
startTimerBtn.addEventListener("click", startTimer);
range.addEventListener("input", onLineWidthChange);
color.addEventListener("change", onColorChange);
colorOptions.forEach(color => color.addEventListener("click", onColorClik));
clearCanvasBtn.addEventListener("click", clearCanvas);

loadCanvasBtn.addEventListener("click", loadCanvas);
deleteCanvasBtn.addEventListener("click", deleteCanvas);
exitPageBtn.addEventListener("click", exitPage);

