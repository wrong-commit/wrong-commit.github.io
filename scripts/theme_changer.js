const allThemes = ["blue", "teal", "hacker", "yellow", "purple", "evil", "white", "trippy"]
function startThemeAnimations(theme) { 
    switch (theme) {
        case "trippy": {
            startTrippyAnimation()
            break;
        }
        case "evil": {
            startFireAnimation()
            break;
        }
        default: {
            break
        }
    }
}
function switchTheme() {
    const currentTheme = document.getElementById("theme").href.split("/").pop().split("_").pop().split(".")[0];
    const themeIndex = allThemes.indexOf(currentTheme);
    const nextTheme = allThemes[(themeIndex + 1) % allThemes.length];
    localStorage.setItem("theme", nextTheme);
    document.getElementById("theme").href = "/styles/colors_" + nextTheme + ".css";
    startThemeAnimations(nextTheme)
    
}
const startingTheme = localStorage.getItem("theme") ?? "blue"
    document.getElementById("theme").href = "/styles/colors_" + startingTheme + ".css";

document.getElementById("theme").addEventListener('load', e => {
    document.body.style.display = "block";
})
