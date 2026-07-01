(() => {
  "use strict";

  const carousels = Array.from(document.querySelectorAll("[data-resource-carousel]"));
  if (!carousels.length) return;

  for (const carousel of carousels) {
    const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    const controls = carousel.querySelector("[data-carousel-controls]");
    if (!slides.length || !controls) continue;

    let active = 0;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      Array.from(controls.querySelectorAll("button")).forEach((button, buttonIndex) => {
        button.setAttribute("aria-pressed", String(buttonIndex === active));
      });
    };

    slides.forEach((slide, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Show preview ${index + 1}`);
      button.addEventListener("click", () => show(index));
      controls.appendChild(button);
    });

    show(0);
  }
})();
