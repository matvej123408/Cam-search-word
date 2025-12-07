const startBtn=document.getElementById('startBtn');
const stopBtn=document.getElementById('stopBtn');
const video=document.getElementById('video');
const canvas=document.getElementById('canvas');
const ocrText=document.getElementById('ocrText');
const lastMatch=document.getElementById('lastMatch');
const statusEl=document.getElementById('status');
const wordsInput=document.getElementById('words');
const alertAudio=document.getElementById('alertAudio');

let running=false;
let stream=null;
let loopHandle=null;

const { createWorker } = Tesseract;
const worker=createWorker({ logger:m=>{} });

async function initWorker(){
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      },
      audio: false
    });
  } catch (e) {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
  }

  video.srcObject = stream;
  await video.play();
}

function stopCamera(){
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    stream=null;
  }
  video.pause();
  video.srcObject=null;
}

function parseWords(){
  return (wordsInput.value||'').split(',').map(w=>w.trim().toLowerCase()).filter(Boolean);
}

async function capture(){
  const w=video.videoWidth,h=video.videoHeight;
  if(!w||!h)return null;
  canvas.width=w*0.6;canvas.height=h*0.6;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  return canvas;
}

async function scan(){
  const targets=parseWords();
  const frame=await capture();
  if(!frame)return;
  const { data:{ text }}=await worker.recognize(frame);
  ocrText.textContent=text.trim();
  const low=text.toLowerCase();
  for(const t of targets){
    if(low.includes(t)){
      lastMatch.textContent=t+' ('+new Date().toLocaleTimeString()+')';
      alertAudio.currentTime=0;
      alertAudio.play().catch(()=>{});
      return;
    }
  }
}

async function start(){
  if(running)return;
  running=true;
  startBtn.disabled=true;
  stopBtn.disabled=false;
  await initWorker();
  await startCamera();
  loopHandle=setInterval(scan,1500);
}

async function stop(){
  running=false;
  startBtn.disabled=false;
  stopBtn.disabled=true;
  if(loopHandle)clearInterval(loopHandle);
  stopCamera();
  try{await worker.terminate();}catch(e){}
}

startBtn.onclick=start;
stopBtn.onclick=stop;

if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js');
