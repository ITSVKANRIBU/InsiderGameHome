function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href") ?? "";
      const target =
        href === "#" || href === ""
          ? document.documentElement
          : document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function initPageTop(): void {
  const pageTop = document.querySelector<HTMLElement>("#page_top");
  const pageTop2 = document.querySelector<HTMLElement>("#page_top2");

  if (!pageTop) {
    return;
  }

  let appear = false;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      if (!appear) {
        appear = true;
        pageTop.style.bottom = "50px";
      }
      return;
    }

    if (appear) {
      appear = false;
      pageTop.style.bottom = "-100px";
      pageTop.style.display = "block";
      if (pageTop2) {
        pageTop2.style.display = "none";
      }
    }
  });

  pageTop.addEventListener("click", (event) => {
    event.preventDefault();
    pageTop.style.display = "none";
    if (pageTop2) {
      pageTop2.style.display = "block";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    window.setTimeout(() => {
      pageTop.style.display = "block";
      if (pageTop2) {
        pageTop2.style.display = "none";
      }
    }, 500);
  });
}

function initLateralNavigation(): void {
  const trigger = document.querySelector<HTMLAnchorElement>(".navi-trigger");
  const container = document.querySelector<HTMLElement>("#container");
  const navi = document.querySelector<HTMLElement>("#navi");
  const navigationWrapper = document.querySelector<HTMLElement>(
    ".navigation-wrapper",
  );

  if (!trigger || !container || !navi || !navigationWrapper) {
    return;
  }

  let isLateralNavAnimating = false;
  const finishAnimation = (): void => {
    isLateralNavAnimating = false;
    if (!document.body.classList.contains("navigation-is-open")) {
      container.classList.remove("navigation-main");
    }
  };

  navigationWrapper.addEventListener("transitionend", finishAnimation);

  trigger.addEventListener("click", (event) => {
    event.preventDefault();

    if (isLateralNavAnimating) {
      return;
    }

    if (trigger.closest(".csstransitions")) {
      isLateralNavAnimating = true;
    }

    container.classList.add("navigation-main");
    navi.style.opacity = "1";
    document.body.classList.toggle("navigation-is-open");

    if (!document.body.classList.contains("navigation-is-open")) {
      navi.style.transition = "opacity 650ms ease";
      navi.style.opacity = "0";
      window.setTimeout(finishAnimation, 650);
    }
  });
}

function initFadeInAnimations(): void {
  window.addEventListener("scroll", () => {
    const windowHeight = window.innerHeight;
    const topWindow = window.scrollY;

    document.querySelectorAll<HTMLElement>(".animationFadeIn").forEach((target) => {
      const targetPosition = target.getBoundingClientRect().top + topWindow;
      if (topWindow > targetPosition - windowHeight + 100) {
        target.classList.add("fadeInDown");
      }
    });
  });
}

export function initCommonPage(): void {
  if (document.documentElement.dataset.commonInitialized === "true") {
    return;
  }

  document.documentElement.dataset.commonInitialized = "true";
  initSmoothScroll();
  initPageTop();
  initLateralNavigation();
  initFadeInAnimations();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommonPage, { once: true });
  } else {
    initCommonPage();
  }
}
