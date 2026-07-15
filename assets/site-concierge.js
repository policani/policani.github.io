(function () {
  const linkedinUrl = "https://www.linkedin.com/in/marcpolicani";
  const emailParts = ["policani", "outlook", "com"];
  const emailAddress = `${emailParts[0]}@${emailParts[1]}.${emailParts[2]}`;

  const links = [
    ["Role fit", "pmo-portfolio-governance-leader.html"],
    ["Case studies", "operating-history.html#entries"],
    ["Methods", "artifacts.html"]
  ];

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function getMailtoHref() {
    const subject = encodeURIComponent("Role inquiry from policani.net");
    return `mailto:${emailAddress}?subject=${subject}`;
  }

  function buildLink(label, href, className) {
    const link = createElement("a", className || "", label);
    link.href = href;
    if (href.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  function initConcierge() {
    if (document.querySelector("[data-site-concierge]")) return;

    const widget = createElement("section", "site-concierge");
    widget.setAttribute("data-site-concierge", "");
    widget.setAttribute("aria-label", "Contact Marco");

    const panel = createElement("div", "concierge-panel");
    panel.id = "site-concierge-panel";
    panel.hidden = true;

    const header = createElement("div", "concierge-header");
    const headingWrap = createElement("div", "");
    headingWrap.append(
      createElement("strong", "", "Contact Marco"),
      createElement("span", "", "For recruiters and hiring leaders")
    );
    const closeButton = createElement("button", "concierge-close", "Close");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close contact panel");
    header.append(headingWrap, closeButton);

    const body = createElement("div", "concierge-body");
    body.append(
      createElement("p", "", "Have a role, interview request, or useful connection? Open an email draft and write it your way."),
      createElement("p", "", "Helpful context: role title, company, posting link, work model, and what the role needs to solve.")
    );

    const primaryActions = createElement("div", "concierge-actions");
    primaryActions.append(
      buildLink("Open email draft", getMailtoHref(), "primary-action"),
      buildLink("LinkedIn", linkedinUrl)
    );
    body.append(primaryActions);

    const linkList = createElement("nav", "concierge-link-list");
    linkList.setAttribute("aria-label", "Helpful portfolio links");
    links.forEach(([label, href]) => {
      linkList.append(buildLink(label, href));
    });
    body.append(linkList);

    const note = createElement("p", "concierge-note", "Static helper only. Nothing is sent until you choose your email app.");
    panel.append(header, body, note);

    const toggle = createElement("button", "concierge-toggle", "");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "site-concierge-panel");
    toggle.innerHTML = '<span class="concierge-icon" aria-hidden="true"></span><span>Contact Marco</span>';

    widget.append(panel, toggle);
    document.body.append(widget);

    function setOpen(isOpen) {
      panel.hidden = !isOpen;
      toggle.classList.toggle("hidden", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        window.setTimeout(() => {
          const firstLink = panel.querySelector(".primary-action");
          if (firstLink) firstLink.focus();
        }, 50);
      }
    }

    toggle.addEventListener("click", () => setOpen(panel.hidden));
    closeButton.addEventListener("click", () => setOpen(false));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initConcierge);
  } else {
    initConcierge();
  }
})();
