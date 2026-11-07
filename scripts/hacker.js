const MAX_HACKER_TTL = 22;
const BASE_SPAWN = 0.55;
// Width at which spawn stays at BASE_SPAWN. Wider grids spawn less often so
// the number of new glyphs per frame stays about the same.
const SPAWN_FULL_WIDTH = 120;
function deriveOpacity(ttl) {
    return ttl / MAX_HACKER_TTL;
}

const HACKER_FONT_PX = 16;
const HACKER_ROW_HEIGHT = HACKER_FONT_PX * 0.85;
const HACKER_GLOW = 8;

let hackerWidth = 1;
let hackerHeight = MAX_HACKER_TTL;
let hackerCharWidth = 8.8;
let hackerSpawnProbability = BASE_SPAWN;
// Paint path. false draws DOM spans, true draws onto a canvas.
let useHackerCanvas = false;
const SPACE = 32;
// Parallel buffers, written in place. char: glyph code point, ttl: rows left to fall.
let hackerChars = new Uint16Array(0);
let hackerTtls = new Uint8Array(0);
// One span per cell, created with the grid. shown* tracks what is already on screen
// so a frame only writes textContent and className when those values change.
let hackerCells = [];
let shownCharCodes = new Uint16Array(0);
let shownTtls = new Uint8Array(0);

// .wrapper owns the scrollbar, so its content box is the page width that
// stops short of that bar. The canvas is display:none until the hacker
// theme loads, so measure a probe on the body with the same font metrics.
function pageContentWidth() {
    const page = document.querySelector(".wrapper");
    if (!page || page.clientWidth <= 0) return 0;
    return page.clientWidth;
}

function initHackerGrid() {
    const pageWidth = pageContentWidth();
    if (pageWidth <= 0) return;
    const container = document.getElementById("hacker-container");
    if (container) container.style.width = pageWidth + "px";
    const hackerProbe = document.createElement("span");
    hackerProbe.textContent = "0";
    hackerProbe.style.cssText = "font-family:monospace;font-size:16px;font-weight:bold;position:absolute;visibility:hidden;";
    document.body.appendChild(hackerProbe);
    hackerCharWidth = hackerProbe.getBoundingClientRect().width || 8.8;
    hackerProbe.remove();
    hackerWidth = Math.max(1, Math.floor(pageWidth / hackerCharWidth));
    hackerHeight = MAX_HACKER_TTL;
    hackerSpawnProbability = Math.min(BASE_SPAWN, BASE_SPAWN * SPAWN_FULL_WIDTH / hackerWidth);
    const count = hackerWidth * hackerHeight;
    hackerChars = new Uint16Array(count);
    hackerChars.fill(SPACE);
    hackerTtls = new Uint8Array(count);
    prepareHackerPaint();
}

function buildHackerDom() {
    const canvas = document.getElementById("hacker-canvas");
    const count = hackerWidth * hackerHeight;
    const frag = document.createDocumentFragment();
    hackerCells = new Array(count);
    shownCharCodes = new Uint16Array(count);
    shownCharCodes.fill(SPACE);
    shownTtls = new Uint8Array(count);
    for (let y = 0; y < hackerHeight; y++) {
        for (let x = 0; x < hackerWidth; x++) {
            const i = y * hackerWidth + x;
            const span = document.createElement("span");
            span.textContent = " ";
            hackerCells[i] = span;
            frag.appendChild(span);
        }
        frag.appendChild(document.createTextNode("\n"));
    }
    canvas.replaceChildren(frag);
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const alphabetCodes = new Uint16Array(alphabet.length);
const glyphText = [];
glyphText[SPACE] = " ";
for (let i = 0; i < alphabet.length; i++) {
    alphabetCodes[i] = alphabet.charCodeAt(i);
    glyphText[alphabetCodes[i]] = alphabet[i];
}
// Spec option: when true, a falling glyph picks a new character every frame.
const changeCharEachFrame = true;

function randomGlyphCode() {
    return alphabetCodes[Math.floor(Math.random() * alphabetCodes.length)];
}

function updateHacker() {
    // Move each glyph down one row. Walk bottom-up so a row is copied
    // before it is overwritten. Values are written in place.
    for (let y = hackerHeight - 1; y > 0; y--) {
        const row = y * hackerWidth;
        const above = row - hackerWidth;
        for (let x = 0; x < hackerWidth; x++) {
            let ttl = hackerTtls[above + x] - 1;
            let char = hackerChars[above + x];
            if (ttl <= 0) {
                ttl = 0;
                char = SPACE;
            } else if (changeCharEachFrame && char !== SPACE) {
                char = randomGlyphCode();
            }
            hackerTtls[row + x] = ttl;
            hackerChars[row + x] = char;
        }
    }

    // New glyphs enter on the top row. Most cells stay empty so columns read as
    // streams. TTL is random, so brightness and how far a glyph falls both vary.
    for (let x = 0; x < hackerWidth; x++) {
        if (Math.random() > hackerSpawnProbability) {
            hackerTtls[x] = 0;
            hackerChars[x] = SPACE;
            continue;
        }
        hackerChars[x] = randomGlyphCode();
        hackerTtls[x] = 1 + Math.floor(Math.random() * MAX_HACKER_TTL);
    }
}

// One rule per opacity in _hacker_tmp.css. Spans use the matching class.
let hackerTmpStyle;
function hackerTmpStylesheet() {
    if (hackerTmpStyle && hackerTmpStyle.isConnected) return hackerTmpStyle;
    hackerTmpStyle = document.createElement("style");
    hackerTmpStyle.id = "_hacker_tmp.css";
    document.head.appendChild(hackerTmpStyle);
    return hackerTmpStyle;
}

function writeHackerOpacityStyles() {
    const cssRules = [];
    for (let ttl = 1; ttl <= MAX_HACKER_TTL; ttl++) {
        cssRules.push(`.o${ttl}{opacity:${deriveOpacity(ttl).toFixed(2)}}`);
    }
    hackerTmpStylesheet().textContent = cssRules.join("");
}

function hackerBitmap() {
    let bitmap = document.getElementById("hacker-bitmap");
    if (bitmap) return bitmap;
    bitmap = document.createElement("canvas");
    bitmap.id = "hacker-bitmap";
    bitmap.style.display = "none";
    document.getElementById("hacker-container").appendChild(bitmap);
    return bitmap;
}

function sizeHackerBitmap() {
    const bitmap = hackerBitmap();
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = hackerWidth * hackerCharWidth;
    const cssHeight = hackerHeight * HACKER_ROW_HEIGHT;
    bitmap.width = Math.ceil(cssWidth * dpr);
    bitmap.height = Math.ceil(cssHeight * dpr);
    bitmap.style.width = cssWidth + "px";
    bitmap.style.height = cssHeight + "px";
}

function prepareHackerPaint() {
    const dom = document.getElementById("hacker-canvas");
    const bitmap = hackerBitmap();
    if (useHackerCanvas) {
        dom.replaceChildren();
        dom.style.display = "none";
        bitmap.style.display = "block";
        hackerCells = [];
        sizeHackerBitmap();
        return;
    }
    bitmap.style.display = "none";
    dom.style.display = "";
    buildHackerDom();
}

function toggleHackerPaint() {
    useHackerCanvas = !useHackerCanvas;
    prepareHackerPaint();
    if (hackerChars.length) {
        if (useHackerCanvas) paintHackerCanvas();
        else paintHackerDom();
    }
    return useHackerCanvas;
}

function paintHackerDom() {
    const count = hackerWidth * hackerHeight;
    for (let i = 0; i < count; i++) {
        const charCode = hackerChars[i];
        const ttl = hackerTtls[i];
        const span = hackerCells[i];
        if (shownCharCodes[i] !== charCode) {
            span.textContent = String.fromCharCode(charCode);
            shownCharCodes[i] = charCode;
        }
        if (shownTtls[i] !== ttl) {
            span.className = ttl === 0 ? "" : "o" + ttl;
            shownTtls[i] = ttl;
        }
    }
}

function paintHackerCanvas() {
    const bitmap = hackerBitmap();
    const ctx = bitmap.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = hackerWidth * hackerCharWidth;
    const cssHeight = hackerHeight * HACKER_ROW_HEIGHT;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.font = `bold ${HACKER_FONT_PX}px monospace`;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#00ff00";
    ctx.shadowColor = "rgba(0, 255, 0, 0.6)";
    ctx.shadowBlur = HACKER_GLOW;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    for (let y = 0; y < hackerHeight; y++) {
        const row = y * hackerWidth;
        const yPx = y * HACKER_ROW_HEIGHT;
        for (let x = 0; x < hackerWidth; x++) {
            const i = row + x;
            const charCode = hackerChars[i];
            if (charCode === SPACE) continue;
            ctx.globalAlpha = deriveOpacity(hackerTtls[i]);
            ctx.fillText(glyphText[charCode], x * hackerCharWidth, yPx);
        }
    }
    ctx.globalAlpha = 1;
}

function renderHackerAnimation() {
    updateHacker();
    if (useHackerCanvas) paintHackerCanvas();
    else paintHackerDom();
}

const HACKER_FRAME_MS = 25;
let hackerAnimationFrame = 0;
let hackerLastFrameTime = 0;
let hackerRunning = false;

function hackerFrame(now) {
    hackerAnimationFrame = 0;
    if (!hackerRunning || document.hidden) return;
    // One step per paint. A late frame does not run the missed steps.
    if (now - hackerLastFrameTime >= HACKER_FRAME_MS) {
        hackerLastFrameTime = now;
        renderHackerAnimation();
    }
    hackerAnimationFrame = requestAnimationFrame(hackerFrame);
}

function hackerVisibilityHandler() {
    if (!hackerRunning) return;
    if (document.hidden) {
        if (hackerAnimationFrame) {
            cancelAnimationFrame(hackerAnimationFrame);
            hackerAnimationFrame = 0;
        }
        return;
    }
    hackerLastFrameTime = 0;
    if (!hackerAnimationFrame) {
        hackerAnimationFrame = requestAnimationFrame(hackerFrame);
    }
}

let hackerPageObserver = null;
function watchHackerPageWidth() {
    const page = document.querySelector(".wrapper");
    if (!page) return;
    if (hackerPageObserver) hackerPageObserver.disconnect();
    hackerPageObserver = new ResizeObserver(() => {
        if (!hackerRunning) return;
        const width = page.clientWidth;
        const container = document.getElementById("hacker-container");
        if (width <= 0 || !container) return;
        if (container.style.width === width + "px" && hackerChars.length > 0) return;
        initHackerGrid();
    });
    hackerPageObserver.observe(page);
}
function startHackerAnimation() {
    // Stop first so cleanup cannot wipe the grid this start is about to build.
    stopHackerAnimation();
    initHackerGrid();
    writeHackerOpacityStyles();
    hackerRunning = true;
    hackerLastFrameTime = 0;
    hackerAnimationFrame = requestAnimationFrame(hackerFrame);
    watchHackerPageWidth();
    document.addEventListener('visibilitychange', hackerVisibilityHandler);
}
function stopHackerAnimation() {
    hackerRunning = false;
    if (hackerAnimationFrame) {
        cancelAnimationFrame(hackerAnimationFrame);
        hackerAnimationFrame = 0;
    }
    if (hackerPageObserver) {
        hackerPageObserver.disconnect();
        hackerPageObserver = null;
    }
    document.removeEventListener('visibilitychange', hackerVisibilityHandler);
    if (hackerTmpStyle) {
        hackerTmpStyle.remove();
        hackerTmpStyle = null;
    }

    const dom = document.getElementById("hacker-canvas");
    if (dom) {
        dom.replaceChildren();
        dom.style.display = "";
    }
    const bitmap = document.getElementById("hacker-bitmap");
    if (bitmap) {
        bitmap.style.display = "none";
        bitmap.width = 0;
        bitmap.height = 0;
    }

    hackerCells = [];
    hackerChars = new Uint16Array(0);
    hackerTtls = new Uint8Array(0);
    shownCharCodes = new Uint16Array(0);
    shownTtls = new Uint8Array(0);
}
