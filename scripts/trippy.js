const speed = 50; // degrees per second
let lastTime = performance.now();
let isTrippyTheme = () => localStorage.getItem("theme") === "trippy"

// Get static list of all elements to trip out
const trippyTargets = [
    ...Array.from(
        document.querySelectorAll('.wrapper>.box')
    ),
    ...Array.from(
        document.querySelectorAll('.page_raised.button.text')
    ),
    ...Array.from(
        document.querySelectorAll('.dir_tree_box')
    ),
    document.querySelector('.wrapper'),
    document.body,
    // ...Array.from(
    //     document.getElementsByClassName('box')
    // )
]

function animate(time) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    trippyTargets.forEach(target => {
        const rawHueValue = target.style.getPropertyValue('--hue');

        if (!rawHueValue.trim()) {
            target.style.setProperty(
                '--hue',
                `${Math.random() * 360}deg`
            );
            return;
        }

        const currentHue = parseFloat(rawHueValue);

        if (Number.isNaN(currentHue)) {
            console.log(
                `[${target.classList}] invalid hue: ${rawHueValue}`
            );
            return;
        }

        const hue = (currentHue + speed * delta) % 360;

        target.style.setProperty('--hue', `${hue}deg`);
    });
    if(isTrippyTheme()) { 
        requestAnimationFrame(animate);
    }
}
// Also called by theme_changer.js to start visuals
function startTrippyAnimation() {
    if(isTrippyTheme()) { 
        requestAnimationFrame(animate);
    }
}
