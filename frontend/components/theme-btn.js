import { sunIcon, moonIcon } from "../js/utils/icons.js";

function getInitialTheme() {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) return storedTheme;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme); 
  localStorage.setItem("theme", theme);
}

export function ThemeBtn() {
  const btn = document.createElement('button');
  btn.className = "theme-toggle"; 
  btn.title = "Cambiar tema";
  btn.innerHTML = moonIcon;
  document.body.appendChild(btn);

  const currentTheme = getInitialTheme();
  applyTheme(currentTheme);
  updateIcon(btn, currentTheme); 
  
  btn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme"); 
    const newTheme = currentTheme === "dark" ? "light" : "dark"; 
    applyTheme(newTheme);
    updateIcon(btn, newTheme);
  });
}

function updateIcon(btn, theme) {
  if (theme === "dark") {
    btn.innerHTML = sunIcon; 
    btn.title = "Cambiar a tema claro";
  } else {
    btn.innerHTML = moonIcon; 
    btn.title = "Cambiar a tema oscuro";
  }
}