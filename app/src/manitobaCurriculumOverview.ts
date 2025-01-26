import 'beercss';
import 'material-dynamic-colors';
import '../static/css/style.css';
import '../static/css/manitoba-theme.css';

function setTheme(theme: string) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);

    const themeIcon = document.getElementById("theme-icon") as HTMLElement;
    themeIcon.innerText = theme === "light" ? "dark_mode" : "light_mode";

    const icons = document.querySelectorAll('.icon') as NodeListOf<HTMLElement>;

    if (theme === 'light') {
        icons.forEach(icon => {
            icon.style.filter = 'invert(1)';
        });
    } else {
        icons.forEach(icon => {
            icon.style.filter = 'invert(0)';
        });
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById("theme-toggle") as HTMLInputElement;
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.classList.contains("dark") ?
            "dark" :
            "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    });

    themeToggle.checked = localStorage.getItem("theme") === "dark";

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
});
