window.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
        e.preventDefault();
    }
});

window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
    }
});

window.addEventListener("keydown", function (e) {
    if (e.key === "F12") {
        e.preventDefault();
    }
});

function detectConsole() {
    if (window.console && (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200)) {
        window.location.href = "/block";
    }
}

detectConsole();