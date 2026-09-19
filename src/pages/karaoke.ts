import "./common";

const LAST_SLIDE = 4;

function setDisabled(control: HTMLAnchorElement, disabled: boolean): void {
  control.classList.toggle("disabled", disabled);
  control.classList.toggle("pointer-events-none", disabled);
  control.classList.toggle("opacity-50", disabled);
  control.setAttribute("aria-disabled", String(disabled));

  if (disabled) {
    control.tabIndex = -1;
  } else {
    control.removeAttribute("tabindex");
  }
}

function setAnimation(direction: "forward" | "next"): void {
  const animationName =
    direction === "next" ? "fadeInAnimeright" : "fadeInAnime";
  document.querySelectorAll<HTMLElement>(".fadeInAnime").forEach((element) => {
    element.style.setProperty("-webkit-animation-name", animationName);
    element.style.animationName = animationName;
  });
}

function initKaraoke(): void {
  const forward = document.querySelector<HTMLAnchorElement>(".forward");
  const next = document.querySelector<HTMLAnchorElement>(".next");
  const number = document.querySelector<HTMLElement>("#num");
  const slides = [...document.querySelectorAll<HTMLElement>(".imageView")];

  if (!forward || !next || !number || slides.length === 0) {
    return;
  }

  let count = 0;

  const render = (): void => {
    slides.forEach((slide) => {
      slide.classList.toggle("hidden", slide.id !== String(count));
    });
    number.textContent = String(count);
    setDisabled(forward, count <= 0);
    setDisabled(next, count >= LAST_SLIDE);
  };

  forward.addEventListener("click", (event) => {
    event.preventDefault();
    if (count <= 0) {
      return;
    }

    count -= 1;
    setAnimation("forward");
    render();
  });

  next.addEventListener("click", (event) => {
    event.preventDefault();
    if (count >= LAST_SLIDE) {
      return;
    }

    count += 1;
    setAnimation("next");
    render();
  });

  render();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initKaraoke, { once: true });
  } else {
    initKaraoke();
  }
}
