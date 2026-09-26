/* https://codepen.io/editor/metaimperiya/pen/019f85c0-e6f5-74f5-8011-96371dcc3db4 */
const width = document.body.clientWidth;
const height = 22;
const firePixels = new Array(width * height).fill(0);

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

let fireAnimationInterval
function startFireAnimation() { 
    fireAnimationInterval = setInterval(renderFireAnimation, 50);
}
function stopFireAnimation() {
    if(fireAnimationInterval) {
        clearInterval(fireAnimationInterval)
    } 
}
