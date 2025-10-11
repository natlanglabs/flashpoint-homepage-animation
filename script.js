/* -------------------------------------------------
   FLASHPOINT – OPTIMIZED VERSION
   Performance improvements applied
-------------------------------------------------- */

/* -------------------------------------------------
   TIME GRADIENT CONFIGURATION
-------------------------------------------------- */
const timeGradients = [
  { hour: 0, gradient: "linear-gradient(to bottom,#001a33 0%,#002244 30%,#003355 60%,#004466 100%)" },
  { hour: 2, gradient: "linear-gradient(to bottom,#002244 0%,#002855 30%,#003366 60%,#003d77 100%)" },
  { hour: 4, gradient: "linear-gradient(to bottom,#1a2855 0%,#2d3366 30%,#4d4488 60%,#6d5599 100%)" },
  { hour: 5, gradient: "linear-gradient(to bottom,#6d5599 0%,#8d66aa 30%,#aa77bb 60%,#cc88cc 100%)" },
  { hour: 6, gradient: "linear-gradient(to bottom,#dd99bb 0%,#ee9988 30%,#ff9966 60%,#ff8855 100%)" },
  { hour: 8, gradient: "linear-gradient(to bottom,#FF8B5A 0%,#FFA570 30%,#FFBE86 60%,#FFD79C 100%)" },
  { hour: 10, gradient: "linear-gradient(to bottom,#FFD89A 0%,#FFE4AA 30%,#FFF0BB 60%,#FFF8CC 100%)" },
  { hour: 12, gradient: "linear-gradient(to bottom,#FFFADD 0%,#A8D8FF 40%,#6BB8FF 70%,#4A9FEE 100%)" },
  { hour: 14, gradient: "linear-gradient(to bottom,#FFEBB0 0%,#FFD8A0 30%,#FFC890 60%,#FFB880 100%)" },
  { hour: 16, gradient: "linear-gradient(to bottom,#FFB880 0%,#FFA870 30%,#FF9860 60%,#FF8850 100%)" },
  { hour: 18, gradient: "linear-gradient(to bottom,#FF7850 0%,#FF6844 30%,#FF5838 60%,#FF482C 100%)" },
  { hour: 19, gradient: "linear-gradient(to bottom,#FF482C 0%,#DD4433 30%,#BB4444 60%,#994455 100%)" },
  { hour: 20, gradient: "linear-gradient(to bottom,#FF5522 0%,#CC4455 30%,#883388 60%,#4433BB 100%)" },
  { hour: 22, gradient: "linear-gradient(to bottom,#010214 0%,#011334 20%,#195AB9 80%,#FF699F 100%)" },
  { hour: 23, gradient: "linear-gradient(to bottom,#10A184 0%,#195AB9 20%,#011334 80%,#010214 100%)" },
];

let currentMode = "manual";
let manualHour = 12;

/* -------------------------------------------------
   GRADIENT SELECTION & BACKGROUND UPDATES
-------------------------------------------------- */
function getGradientForHour(h) {
  h = h % 24;
  let bG, aG, bH, aH;
  for (let i = 0; i < timeGradients.length; i++) {
    if (timeGradients[i].hour <= h) {
      bG = timeGradients[i].gradient;
      bH = timeGradients[i].hour;
      const nextIdx = (i + 1) % timeGradients.length;
      aG = timeGradients[nextIdx].gradient;
      aH = timeGradients[nextIdx].hour;
      if (aH < bH) aH += 24;
    }
  }
  const p = Math.max(0, Math.min(1, (h - bH) / 1));
  return p < 0.5 ? bG : aG;
}

// OPTIMIZATION: Use requestAnimationFrame for background updates
let backgroundUpdateScheduled = false;
function updateBackgroundGradient(h) {
  if (backgroundUpdateScheduled) return;
  backgroundUpdateScheduled = true;
  
  requestAnimationFrame(() => {
    const container = document.querySelector('.container');
    const gradient = getGradientForHour(h);
    container.style.background = gradient;

    const searchBox = document.querySelector('.search-box');
    searchBox.style.setProperty('--reflection-gradient', gradient);
    
    backgroundUpdateScheduled = false;
  });
}

function updateTimeValue(h) {
  const hrs = Math.floor(h);
  const mins = Math.floor((h % 1) * 60);
  document.getElementById("timeValue").textContent = `${hrs
    .toString()
    .padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/* -------------------------------------------------
   GRADIENT PREVIEW
-------------------------------------------------- */
function initGradientPreview() {
  const prev = document.getElementById("gradientPreview");
  timeGradients.forEach((g) => {
    const seg = document.createElement("div");
    seg.className = "gradient-segment";
    seg.style.background = g.gradient;
    seg.title = `${g.hour}:00`;

    seg.addEventListener("click", () => {
      const sl = document.getElementById("hourSlider");
      sl.value = g.hour;
      manualHour = g.hour;
      updateBackgroundGradient(g.hour);
      updateTimeValue(g.hour);
      updateActiveSegment();
    });

    prev.appendChild(seg);
  });
}

function updateActiveSegment() {
  const segs = document.querySelectorAll(".gradient-segment");
  const cH =
    currentMode === "manual"
      ? manualHour
      : new Date().getHours() + new Date().getMinutes() / 60;

  segs.forEach((seg, idx) => {
    const nIdx = (idx + 1) % timeGradients.length;
    const cGH = timeGradients[idx].hour;
    const nGH = timeGradients[nIdx].hour === 0 ? 24 : timeGradients[nIdx].hour;
    if (cH >= cGH && cH < nGH) seg.classList.add("active");
    else seg.classList.remove("active");
  });
}

/* -------------------------------------------------
   MODE SWITCHING
-------------------------------------------------- */
document.getElementById("toggleAuto").addEventListener("click", function () {
  currentMode = "auto";
  this.classList.add("active");
  document.getElementById("toggleManual").classList.remove("active");
  document.getElementById("useRealTime").classList.remove("active");
  startAutoMode();
});

document.getElementById("toggleManual").addEventListener("click", function () {
  currentMode = "manual";
  this.classList.add("active");
  document.getElementById("toggleAuto").classList.remove("active");
  document.getElementById("useRealTime").classList.remove("active");
});

document.getElementById("useRealTime").addEventListener("click", function () {
  currentMode = "realtime";
  this.classList.add("active");
  document.getElementById("toggleAuto").classList.remove("active");
  document.getElementById("toggleManual").classList.remove("active");

  const now = new Date();
  const cH = now.getHours() + now.getMinutes() / 60;
  const sl = document.getElementById("hourSlider");
  sl.value = cH;
  manualHour = cH;
  updateBackgroundGradient(cH);
  updateTimeValue(cH);
  updateActiveSegment();
});

/* -------------------------------------------------
   SLIDER INTERACTION
-------------------------------------------------- */
document.getElementById("hourSlider").addEventListener("input", function () {
  if (currentMode === "manual") {
    manualHour = parseFloat(this.value);
    updateBackgroundGradient(manualHour);
    updateTimeValue(manualHour);
    updateActiveSegment();
  }
});

/* -------------------------------------------------
   AUTO MODE
-------------------------------------------------- */
function startAutoMode() {
  if (currentMode !== "auto") return;
  manualHour += 1 / 3600;
  if (manualHour >= 24) manualHour = 0;

  const sl = document.getElementById("hourSlider");
  sl.value = manualHour;
  updateBackgroundGradient(manualHour);
  updateTimeValue(manualHour);
  updateActiveSegment();

  requestAnimationFrame(startAutoMode);
}

/* -------------------------------------------------
   INITIALIZATION
-------------------------------------------------- */
initGradientPreview();
updateBackgroundGradient(manualHour);
updateTimeValue(manualHour);
updateActiveSegment();

/* -------------------------------------------------
   WEBGL SHADER - OPTIMIZED
-------------------------------------------------- */
const canvas = document.getElementById("shaderCanvas");
const gl = canvas.getContext("webgl", { 
  alpha: true, 
  premultipliedAlpha: false,
  antialias: false, // OPTIMIZATION: Disable antialiasing
  powerPreference: "high-performance" // OPTIMIZATION: Prefer performance
});

// OPTIMIZATION: Reduce canvas resolution on lower-end devices
const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
canvas.width = 700 * pixelRatio;
canvas.height = 700 * pixelRatio;
gl.viewport(0, 0, canvas.width, canvas.height);

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// OPTIMIZATION: Simplified shader with fewer calculations
const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_timeOfDay;
  varying vec2 vUv;

  float tanh(float x) {
    float e2x = exp(2.0 * clamp(x, -10.0, 10.0));
    return (e2x - 1.0) / (e2x + 1.0);
  }

  vec3 getTimeBasedPalette(float hour) {
    hour = mod(hour, 24.0);
    vec3 baseColor;
    if (hour < 2.0) baseColor = vec3(0.0,0.15,0.35);
    else if (hour < 4.0) baseColor = vec3(0.0,0.2,0.4);
    else if (hour < 5.0) baseColor = vec3(0.4,0.3,0.55);
    else if (hour < 6.0) baseColor = vec3(0.7,0.5,0.75);
    else if (hour < 8.0) baseColor = vec3(1.0,0.55,0.35);
    else if (hour < 10.0) baseColor = vec3(1.0,0.5,0.25);
    else if (hour < 12.0) baseColor = vec3(1.0,0.55,0.3);
    else if (hour < 14.0) baseColor = vec3(1.0,0.5,0.25);
    else if (hour < 16.0) baseColor = vec3(1.0,0.6,0.35);
    else if (hour < 18.0) baseColor = vec3(1.0,0.4,0.2);
    else if (hour < 19.0) baseColor = vec3(0.9,0.3,0.4);
    else if (hour < 21.0) baseColor = vec3(0.3,0.25,0.6);
    else baseColor = vec3(0.15,0.2,0.45);
    return mix(baseColor, vec3(1.0,0.4,0.1), 0.25);
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5);
    float dist = distance(uv, center);
    float circleFade = 1.0 - smoothstep(0.2, 0.45, dist);

    vec2 p = (uv - 0.5) * 2.0;
    vec2 mouseNorm = u_mouse / u_resolution;
    float mouseInfluence = max(0.0, 1.0 - distance(uv, mouseNorm) * 2.0) * 0.3;

    float angle = length(p) * 4.0 + mouseInfluence * 0.5;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    p *= rotation;

    float l = length(p) - 0.7 + mouseInfluence * 0.1;
    float t = u_time * 1.3 + mouseInfluence * 0.5;

    // OPTIMIZATION: Reduced pattern calculations from 4 to 3
    float val1 = clamp(0.1 / max(l / 0.1, -l) - sin(l + p.y * max(1.0, -l / 0.1) + t), -3.0, 3.0);
    float val2 = clamp(0.1 / max(l / 0.1, -l) - sin(l + p.y * max(1.0, -l / 0.1) + t + 2.094), -3.0, 3.0);
    float val3 = clamp(0.1 / max(l / 0.1, -l) - sin(l + p.y * max(1.0, -l / 0.1) + t + 4.188), -3.0, 3.0);

    float pattern1 = pow(0.5 + 0.5 * tanh(val1 * 2.0), 2.2);
    float pattern2 = pow(0.5 + 0.5 * tanh(val2 * 1.8), 1.8);
    float pattern3 = pow(0.5 + 0.5 * tanh(val3 * 2.2), 2.0);

    vec3 basePalette = getTimeBasedPalette(u_timeOfDay);
    vec3 color1 = mix(basePalette * 1.3, basePalette * 0.7 + vec3(0.3, 0.1, 0.0), pattern1);
    vec3 color2 = mix(basePalette * 0.8 + vec3(0.0, 0.2, 0.4), basePalette * 1.1 + vec3(0.1, 0.3, 0.5), pattern2);
    vec3 color3 = mix(basePalette * 1.1 + vec3(0.2, 0.0, 0.3), basePalette * 0.9 + vec3(0.4, 0.2, 0.0), pattern3);

    // OPTIMIZATION: Simplified mixing
    float w1 = pattern1;
    float w2 = pattern2;
    float w3 = pattern3;
    float totalW = w1 + w2 + w3 + 0.001;

    vec3 finalColor = (color1 * w1 + color2 * w2 + color3 * w3) / totalW;
    
    float shadowPattern = sin(l * 5.0 + t * 0.8) * 0.5 + 0.5;
    finalColor *= 0.75 + shadowPattern * 0.4;
    
    float luminance = dot(finalColor, vec3(0.299, 0.587, 0.114));
    finalColor = mix(vec3(luminance), finalColor, 3.5);

    finalColor = pow(finalColor, vec3(0.7)) * 1.5;
    finalColor = clamp(finalColor, 0.0, 1.0);

    float alpha = circleFade;
    gl_FragColor = vec4(finalColor * alpha, alpha);
  }
`;

/* -------------------------------------------------
   WEBGL SETUP
-------------------------------------------------- */
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("Program link error:", gl.getProgramInfoLog(program));
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "a_position");
const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
const mouseLocation = gl.getUniformLocation(program, "u_mouse");
const timeOfDayLocation = gl.getUniformLocation(program, "u_timeOfDay");

let mouseX = 300, mouseY = 300;
let currentMouseX = 300, currentMouseY = 300;

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

let startTime = Date.now();
let isTyping = false;
let targetSlowdown = 1.3;
let currentSlowdown = 1.3;

function render() {
  currentMouseX += (mouseX - currentMouseX) * 0.02;
  currentMouseY += (mouseY - currentMouseY) * 0.02;
  currentSlowdown += (targetSlowdown - currentSlowdown) * 0.05;

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  const time = (Date.now() - startTime) / 1000;
  const currentTimeOfDay =
    currentMode === "manual"
      ? manualHour
      : new Date().getHours() + new Date().getMinutes() / 60;

  gl.uniform1f(timeLocation, time);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  gl.uniform2f(mouseLocation, currentMouseX, currentMouseY);
  gl.uniform1f(timeOfDayLocation, currentTimeOfDay);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
render();

/* -------------------------------------------------
   RADIAL BLUR - OPTIMIZED
-------------------------------------------------- */
function createRadialBlurLayers() {
  const existing = document.querySelector(".radial-gradient-blur");
  if (existing) existing.remove();

  const radialBlur = document.createElement("div");
  radialBlur.className = "radial-gradient-blur";
  radialBlur.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:3;";

  // OPTIMIZATION: Reduced blur layers from 4 to 2
  const blurConfigs = [
    { blur: 8, innerClear: 100, outerFade: 250 },
    { blur: 24, innerClear: 200, outerFade: 500 },
  ];

  blurConfigs.forEach((config, index) => {
    const div = document.createElement("div");
    div.className = `blur-layer-${index}`;
    div.style.cssText = `
      position:absolute;
      top:0;left:0;width:100%;height:100%;
      backdrop-filter:blur(${config.blur}px);
      -webkit-backdrop-filter:blur(${config.blur}px);
      z-index:${index + 1};
      transition:backdrop-filter 0.3s ease;
      will-change:transform;
    `;
    div.dataset.baseBlur = config.blur;
    div.dataset.innerClear = config.innerClear;
    div.dataset.outerFade = config.outerFade;
    radialBlur.appendChild(div);
  });

  document.querySelector(".blur-target").appendChild(radialBlur);
  return radialBlur;
}

function createBackgroundGlow() {
  const glowLayer = document.createElement("div");
  glowLayer.className = "background-glow";
  glowLayer.style.cssText =
    "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0;mix-blend-mode:screen;transition:opacity 0.5s ease;will-change:transform;";

  const glowGradient = document.createElement("div");
  glowGradient.className = "glow-gradient";
  glowGradient.style.cssText =
    "position:absolute;width:100%;height:100%;background:radial-gradient(circle at center,rgba(100,150,255,0.15) 0%,rgba(50,100,255,0.08) 20%,rgba(20,60,200,0.05) 40%,transparent 70%);filter:blur(80px);transform:scale(2);";

  glowLayer.appendChild(glowGradient);
  document.querySelector(".blur-target").insertBefore(glowLayer, document.querySelector(".blur-target").firstChild);
  setTimeout(() => (glowLayer.style.opacity = "1"), 100);
  return glowGradient;
}

const radialBlurContainer = createRadialBlurLayers();
const backgroundGlow = createBackgroundGlow();

// OPTIMIZATION: Throttle mask updates
let lastMaskUpdate = 0;
const MASK_UPDATE_INTERVAL = 16; // ~60fps

function updateRadialMasks(mouseX, mouseY) {
  const now = Date.now();
  if (now - lastMaskUpdate < MASK_UPDATE_INTERVAL) return;
  lastMaskUpdate = now;
  
  const blurLayers = radialBlurContainer.querySelectorAll('[class^="blur-layer-"]');
  blurLayers.forEach((layer) => {
    const innerClear = parseInt(layer.dataset.innerClear);
    const outerFade = parseInt(layer.dataset.outerFade);
    const mask = `radial-gradient(circle at ${mouseX}px ${mouseY}px, transparent ${innerClear}px, black ${outerFade}px)`;
    layer.style.mask = mask;
    layer.style.webkitMask = mask;
  });
}

// OPTIMIZATION: Throttle glow updates
let lastGlowUpdate = 0;
const GLOW_UPDATE_INTERVAL = 32; // ~30fps (glow doesn't need to be as smooth)

function updateBackgroundGlow(x, y) {
  const now = Date.now();
  if (now - lastGlowUpdate < GLOW_UPDATE_INTERVAL || !backgroundGlow) return;
  lastGlowUpdate = now;
  
  const xPercent = (x / window.innerWidth) * 100;
  const yPercent = (y / window.innerHeight) * 100;
  backgroundGlow.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%,rgba(100,150,255,0.15) 0%,rgba(50,100,255,0.08) 20%,rgba(20,60,200,0.05) 40%,transparent 70%)`;
}

/* -------------------------------------------------
   MOUSE ANIMATION - OPTIMIZED
-------------------------------------------------- */
let currentX = window.innerWidth / 2,
  currentY = window.innerHeight / 2,
  targetX = currentX,
  targetY = currentY,
  glowX = currentX,
  glowY = currentY,
  animationFrame = null,
  lastMouseMove = Date.now(),
  idleRotation = 0,
  isIdle = false;

const IDLE_TIMEOUT = 2000;
const IDLE_SPEED = 0.5;

function animate() {
  const now = Date.now();
  const timeSinceMove = now - lastMouseMove;

  if (timeSinceMove > IDLE_TIMEOUT && !isIdle) isIdle = true;
  if (isIdle) idleRotation += IDLE_SPEED;

  const lerpFactor = isIdle ? 0.1 : 0.08;
  const glowLerpFactor = isIdle ? 0.08 : 0.07;

  currentX += (targetX - currentX) * lerpFactor;
  currentY += (targetY - currentY) * lerpFactor;
  glowX += (targetX - glowX) * glowLerpFactor;
  glowY += (targetY - glowY) * glowLerpFactor;

  updateRadialMasks(currentX, currentY);
  updateBackgroundGlow(glowX, glowY);

  animationFrame = requestAnimationFrame(animate);
}

// OPTIMIZATION: Throttle mousemove events
let lastMouseEvent = 0;
const MOUSE_THROTTLE = 16; // ~60fps

document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastMouseEvent < MOUSE_THROTTLE) return;
  lastMouseEvent = now;
  
  targetX = e.clientX;
  targetY = e.clientY;
  lastMouseMove = now;
  isIdle = false;
  if (!animationFrame) animationFrame = requestAnimationFrame(animate);
});

updateRadialMasks(currentX, currentY);
updateBackgroundGlow(glowX, glowY);
animationFrame = requestAnimationFrame(animate);

/* -------------------------------------------------
   RING ACTIVATION + TYPING
-------------------------------------------------- */
const whiteRing = document.querySelector(".white-ring");
const container = document.querySelector(".container");
let isMouseInRing = false;

function isPointInRing(x, y) {
  const rect = whiteRing.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const outer = rect.width / 2;
  return dist < outer;
}

document.addEventListener("mousemove", (e) => {
  const wasInRing = isMouseInRing;
  isMouseInRing = isPointInRing(e.clientX, e.clientY);
  if (isMouseInRing && !wasInRing) container.classList.add("ring-active");
  else if (!isMouseInRing && wasInRing) container.classList.remove("ring-active");
});

window.addEventListener("load", () => {
  const searchInput = document.getElementById("searchInput");
  setTimeout(() => searchInput.focus(), 500);

  searchInput.addEventListener("input", (e) => {
    isTyping = e.target.value.length > 0;
    if (isTyping) {
      container.classList.add("typing");
      whiteRing.classList.add("typing");
      targetSlowdown = 0.15;
    } else {
      container.classList.remove("typing");
      whiteRing.classList.remove("typing");
      targetSlowdown = 1.3;
    }
  });

  searchInput.addEventListener("blur", () => {
    if (searchInput.value.length === 0) {
      container.classList.remove("typing");
      whiteRing.classList.remove("typing");
      targetSlowdown = 1.3;
    }
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.length > 0) {
      container.classList.add("typing");
      whiteRing.classList.add("typing");
      targetSlowdown = 0.15;
    }
  });

  canvas.addEventListener("mouseenter", () => (targetSlowdown = 0.2));
  canvas.addEventListener("mouseleave", () => {
    if (!isTyping) targetSlowdown = 1.3;
  });
});