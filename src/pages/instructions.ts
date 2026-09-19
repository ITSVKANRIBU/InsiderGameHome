import "./common";
import "../styles/instructions.css";

// Deep links to optional features also reveal their instructions.
function revealSection(): void {
  const target = document.getElementById(
    decodeURIComponent(location.hash.slice(1)),
  );
  if (target instanceof HTMLDetailsElement) target.open = true;
}
revealSection();
window.addEventListener("hashchange", revealSection);
document
  .querySelectorAll<HTMLAnchorElement>('.guide-page a[href^="#"]')
  .forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.hash.slice(1);
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) target.open = true;
      if (target) history.replaceState(null, "", link.hash);
    });
  });

const sectionLinks = [
  ...document.querySelectorAll<HTMLAnchorElement>(".guide-sidebar nav a"),
];
const sections = [...document.querySelectorAll<HTMLElement>(".guide-section")];
let framePending = false;
function updateCurrentSection(): void {
  const current =
    [...sections]
      .reverse()
      .find((section) => section.getBoundingClientRect().top <= 160) ??
    sections[0];
  for (const link of sectionLinks) {
    if (link.hash === `#${current?.id}`)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
  framePending = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!framePending) {
      framePending = true;
      requestAnimationFrame(updateCurrentSection);
    }
  },
  { passive: true },
);
updateCurrentSection();
