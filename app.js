let video = document.getElementById("camera");
let startBtn = document.getElementById("startBtn");
let stopBtn = document.getElementById("stopBtn");

let stream = null;
let running = false;
let audio = new Audio("music.mp3");
audio.preload = "auto";

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });
        video.srcObject = stream;
    } catch (e) {
        alert("Camera error: " + e);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

startBtn.onclick = () => {
    running = true;
    loopOCR();
};

stopBtn.onclick = () => {
    running = false;
};

async function loopOCR() {
    if (!running) return;

    if (!stream) await startCamera();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    let text = ""; // placeholder (ocr not implemented here)
    // You can implement OCR manually later

    if (text.length > 0) {
        audio.play();
    }

    requestAnimationFrame(loopOCR);
}
