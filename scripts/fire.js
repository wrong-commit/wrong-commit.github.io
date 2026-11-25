/* https://codepen.io/editor/metaimperiya/pen/019f85c0-e6f5-74f5-8011-96371dcc3db4 */
const height = 22;
let width = 0;
let fireCharWidth = 8.8;
let firePixels = [];

// .wrapper owns the scrollbar. Its content box is the page width that stops
// short of that bar.
function firePageWidth() {
    const page = document.querySelector(".wrapper");
    if (!page || page.clientWidth <= 0) return 0;
    return page.clientWidth;
}

function measureFireCharWidth() {
    const probe = document.createElement("span");
    probe.textContent = "0";
    probe.style.cssText = "font-family:monospace;font-size:16px;font-weight:bold;position:absolute;visibility:hidden;";
    document.body.appendChild(probe);
    fireCharWidth = probe.getBoundingClientRect().width || 8.8;
    probe.remove();
}

function initFireGrid() {
    const pageWidth = firePageWidth();
    if (pageWidth <= 0) return;
    const container = document.getElementById("fire-container");
    if (container) container.style.width = pageWidth + "px";
    measureFireCharWidth();
    const nextWidth = Math.max(1, Math.floor(pageWidth / fireCharWidth));
    if (nextWidth === width && firePixels.length === nextWidth * height) return;
    width = nextWidth;
    firePixels = new Array(width * height).fill(0);
}

const ramp = [" ", ".", ":", "░", "▒", "▓", "█"];

function updateFire() {
    for (let x = 0; x < width; x++) {
        firePixels[(height - 1) * width + x] = Math.random() > 0.35 ? 6 : 1;
    }
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width; x++) {
            const srcIdx = (y + 1) * width + x;
            const decay = Math.floor(Math.random() * 2);
            const wind = Math.floor(Math.random() * 3) - 1;
            let dstX = x + wind;
            if (dstX < 0) dstX = 0;
            if (dstX >= width) dstX = width - 1;

            const dstIdx = y * width + dstX;
            const newValue = firePixels[srcIdx] - decay;

            firePixels[dstIdx] = newValue > 0 ? newValue : 0;
        }
    }
}

function renderFireAnimation() {
    updateFire();
    let output = "";
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const val = firePixels[y * width + x];
            output += ramp[val] || " ";
        }
        output += "\n";
    }
    document.getElementById('fire-canvas').textContent = output;
}

const FIRE_FRAME_MS = 50;
let fireAnimationFrame = 0;
let fireLastFrameTime = 0;
let fireRunning = false;

function fireFrame(now) {
    fireAnimationFrame = 0;
    if (!fireRunning || document.hidden) return;
    // One step per paint. A late frame does not run the missed steps.
    if (now - fireLastFrameTime >= FIRE_FRAME_MS) {
        fireLastFrameTime = now;
        renderFireAnimation();
    }
    fireAnimationFrame = requestAnimationFrame(fireFrame);
}

function fireVisibilityHandler() {
    if (!fireRunning) return;
    if (document.hidden) {
        if (fireAnimationFrame) {
            cancelAnimationFrame(fireAnimationFrame);
            fireAnimationFrame = 0;
        }
        return;
    }
    fireLastFrameTime = 0;
    if (!fireAnimationFrame) {
        fireAnimationFrame = requestAnimationFrame(fireFrame);
    }
}

const MOBILE_FIRE_BUFFER_SIZE = "85%";
function isMobile() { 
    return !window.matchMedia("(max-width: 800px)").matches
}
let firePageObserver = null;
function watchFirePageWidth() {
    const page = document.querySelector(".wrapper");
    if (!page) return;
    if (firePageObserver) firePageObserver.disconnect();
    firePageObserver = new ResizeObserver(() => {
        if (!fireRunning) return;
        const pageWidth = page.clientWidth;
        const container = document.getElementById("fire-container");
        if (pageWidth <= 0 || !container) return;
        if (container.style.width === pageWidth + "px" && firePixels.length > 0) return;
        initFireGrid();
    });
    firePageObserver.observe(page);
}
function startFireAnimation() {
    stopFireAnimation();
    initFireGrid();
    fireRunning = true;
    fireLastFrameTime = 0;
    fireAnimationFrame = requestAnimationFrame(fireFrame);
    document.addEventListener("visibilitychange", fireVisibilityHandler);
    watchFirePageWidth();
    if (isMobile()) { 
        document.body.style.setProperty("--evil-theme-wrapper-height", MOBILE_FIRE_BUFFER_SIZE);
    }
}
function stopFireAnimation() {
    fireRunning = false;
    if (fireAnimationFrame) {
        cancelAnimationFrame(fireAnimationFrame);
        fireAnimationFrame = 0;
    }
    if (firePageObserver) {
        firePageObserver.disconnect();
        firePageObserver = null;
    }
    document.removeEventListener("visibilitychange", fireVisibilityHandler);
    document.body.style.removeProperty("--evil-theme-wrapper-height");
    const canvas = document.getElementById("fire-canvas");
    if (canvas) canvas.textContent = "";
    firePixels = [];
}
