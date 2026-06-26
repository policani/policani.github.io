(function () {
  const linkedinUrl = "https://www.linkedin.com/in/marcpolicani";
  const emailParts = ["policani", "outlook", "com"];
  const emailAddress = `${emailParts[0]}@${emailParts[1]}.${emailParts[2]}`;

  const state = {
    lastIntent: "summary",
    visitorType: ""
  };

  const profile = {
    targetLanes: [
      "Director / Principal PMO, EPMO, or PPMO leadership",
      "Portfolio governance and operating-model roles",
      "Program operations, delivery readiness, and executive cadence",
      "Chief of Staff-style roles when the work is operating rhythm, visibility, and decision support",
      "AI workflow governance roles focused on human review, evidence, and reliance boundaries"
    ],
    proofPoints: [
      "65% faster delivery cycles across a revenue-technology portfolio",
      "$1.8B in influenced renewals through global platform governance",
      "~$125M sequenced under constrained utility-scale delivery conditions",
      "Public-safe workflow systems for intake, prioritization, readiness, value realization, and proof review"
    ],
    nonTargets: [
      "software engineering",
      "ML/data-science ownership",
      "product owner / feature backlog ownership",
      "VP, GM, or CEO positioning",
      "production SaaS ownership"
    ]
  };

  const actions = {
    role: [["Send role inquiry", "#role-inquiry"], ["Check role fit", "pmo-portfolio-governance-leader.html"]],
    proof: [["Send role inquiry", "#role-inquiry"], ["Proof points", "operating-history.html#entries"]],
    ai: [["Send role inquiry", "#role-inquiry"], ["AI proof", "proof.html"]],
    contact: [["Send role inquiry", "#role-inquiry"], ["LinkedIn", linkedinUrl]],
    resume: [["Send role inquiry", "#role-inquiry"], ["LinkedIn", linkedinUrl]],
    systems: [["Send role inquiry", "#role-inquiry"], ["Workflow systems", "modules.html"]],
    resources: [["Send role inquiry", "#role-inquiry"], ["Resources", "resources.html"]]
  };

  const quickPrompts = [
    "Send role inquiry",
    "Would Marco fit this role?",
    "Give me the recruiter screen",
    "Show proof points",
    "Explain the AI angle"
  ];

  const examples = [
    "Is Marco a fit for Director PMO?",
    "What proof should I show a hiring manager?",
    "Is this a software engineering profile?",
    "How does the AI portfolio relate to operations?",
    "Can I email Marco about an interview?"
  ];

  const intentRules = {
    contact: [
      [/contact|email|mail|reach|message|phone|connect|interview|talk|schedule|calendar|availability|inquiry|opportunity/i, 8],
      [/linkedin|linked in/i, 4]
    ],
    recruiter: [
      [/recruit|sourc|screen|talent|resume|cv|work history|ats|candidate/i, 8],
      [/shortlist|pipeline|submission|submit|profile/i, 4]
    ],
    hiringManager: [
      [/hiring manager|leader|executive|vp|cio|cto|coo|cfo|stakeholder|team fit/i, 8],
      [/why should|why hire|business problem|operating problem/i, 5]
    ],
    nonTarget: [
      [/software engineer|developer|programmer|full stack|frontend|backend|ml engineer|data scientist|product owner|product manager|ceo|gm|vp role/i, 10],
      [/not a fit|bad fit|wrong fit|too technical/i, 3]
    ],
    roleFit: [
      [/role|fit|hire|hiring|level|director|principal|pmo|epmo|ppmo|portfolio|chief of staff|program operations|executive operations|governance/i, 7],
      [/cadence|visibility|decision support|delivery readiness|operating model|follow-through|operating rhythm/i, 5]
    ],
    proof: [
      [/proof|case|evidence|example|outcome|impact|result|scale|metric|experience|case stud/i, 7],
      [/65%|1.8b|125m|renewal|delivery cycle|portfolio signal|capital/i, 6]
    ],
    ai: [
      [/ai|artificial|llm|agent|automation|workflow governance|human review|reliance|artifact/i, 8],
      [/prompt|model|chatgpt|claude|codex/i, 4]
    ],
    systems: [
      [/module|tool|template|workflow system|artifact|route|how i work|operating route|download/i, 7],
      [/intake|prioritization|charter|readiness|value realization|uat|business case/i, 5]
    ],
    compensation: [
      [/salary|comp|level|seniority|title|scope|director|principal|senior/i, 5]
    ],
    summary: [
      [/summary|overview|quick|who is|about|what does|positioning|headline/i, 5]
    ],
    resources: [
      [/resource|job search|writing|career|community|helper|scanner|interview/i, 5]
    ]
  };

  const intentPriority = [
    "contact",
    "nonTarget",
    "recruiter",
    "hiringManager",
    "ai",
    "proof",
    "systems",
    "roleFit",
    "compensation",
    "resources",
    "summary"
  ];

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function getMailtoHref(details) {
    const role = details?.role || "";
    const company = details?.company || "";
    const location = details?.location || "";
    const posting = details?.posting || "";
    const note = details?.note || "";
    const subjectText = role ? `Role inquiry: ${role}` : "Policani.net inquiry";
    const bodyLines = role || company || location || posting || note ? [
      "Hi Marco,",
      "",
      "I found policani.net and may have a role that could fit your portfolio / PMO / operating-governance background.",
      "",
      `Role or opportunity: ${role}`,
      `Company: ${company}`,
      `Remote/hybrid/location: ${location}`,
      `Job posting URL: ${posting}`,
      "",
      "Context or hiring need:",
      note,
      "",
      "Best contact path:",
      "",
      "Thanks,"
    ] : [
      "Hi Marco,",
      "",
      "I found policani.net and would like to connect about:",
      "",
      "Role or opportunity:",
      "Company:",
      "Best contact path:",
      "",
      "Thanks,"
    ];
    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(bodyLines.join("\n"));
    return `mailto:${emailAddress}?subject=${subject}&body=${body}`;
  }

  function scoreIntent(text) {
    const scores = {};
    Object.entries(intentRules).forEach(([intent, rules]) => {
      scores[intent] = rules.reduce((total, [pattern, weight]) => total + (pattern.test(text) ? weight : 0), 0);
    });

    const ranked = intentPriority
      .map((intent) => ({ intent, score: scores[intent] || 0 }))
      .sort((a, b) => b.score - a.score || intentPriority.indexOf(a.intent) - intentPriority.indexOf(b.intent));

    return ranked[0].score > 0 ? ranked[0].intent : "summary";
  }

  function detectSignals(text) {
    return {
      asksContact: intentRules.contact.some(([pattern]) => pattern.test(text)),
      asksRole: intentRules.roleFit.some(([pattern]) => pattern.test(text)),
      asksProof: intentRules.proof.some(([pattern]) => pattern.test(text)),
      hasDirector: /director|principal|senior/i.test(text),
      hasPMO: /pmo|epmo|ppmo|portfolio|governance|program operations/i.test(text),
      hasAI: /ai|llm|agent|automation|workflow/i.test(text)
    };
  }

  function rememberAudience(intent) {
    if (intent === "recruiter") state.visitorType = "recruiter";
    if (intent === "hiringManager") state.visitorType = "hiring manager";
  }

  function answerFor(text, overrideIntent) {
    const intent = overrideIntent || scoreIntent(text);
    const signals = detectSignals(text);
    rememberAudience(intent);
    state.lastIntent = intent;

    if (signals.asksContact && signals.asksRole) {
      return {
        title: "Yes. Send the role details.",
        paragraphs: [
          "This sounds like a real recruiting or hiring-manager question. The fastest useful next step is an email with the role title, company, work model, posting URL, and the operating problem the role needs to solve.",
          "The form here does not send or store anything. It opens a prefilled email draft so the recruiter can send the role directly to Marco."
        ],
        bullets: [
          "Strong fit: Director / Principal PMO, portfolio governance, program operations, executive operations, and AI workflow governance.",
          "Useful context: reporting line, portfolio size, governance maturity, delivery-readiness problem, and decision-support need."
        ],
        actions: [["Send role inquiry", "#role-inquiry"], ["LinkedIn", linkedinUrl]],
        followups: ["Give me the recruiter screen", "Show proof points"]
      };
    }

    const answers = {
      contact: {
        title: "Send Marco the role",
        paragraphs: [
          "For a possible role, email is useful if it includes enough context to evaluate fit quickly.",
          "Use the role-inquiry form to open a clean draft. LinkedIn is still available, but the email draft is the most direct path for a live opportunity."
        ],
        bullets: ["Include title, company, remote/hybrid/location, posting URL, and the main operating problem."],
        actions: actions.contact,
        followups: ["Would Marco fit this role?", "Give me the recruiter screen"]
      },
      recruiter: {
        title: "Recruiter screen, then send the role",
        paragraphs: [
          "Screen Marco for Director / Principal operating-leadership roles where the work is PMO, portfolio governance, program operations, executive cadence, readiness, and decision support.",
          "If that sounds close to the role, send it. The role-inquiry draft is designed to get the useful details into Marco's inbox without making the recruiter hunt through the site."
        ],
        bullets: [
          "Strong signals: PMO / EPMO / PPMO, portfolio governance, delivery readiness, executive reporting, value realization, AI workflow governance.",
          "Use LinkedIn for the full resume; use this site for proof, case studies, and public-safe work samples.",
          "Avoid routing him as software engineering, ML/data science, or product-owner talent."
        ],
        actions: [["Send role inquiry", "#role-inquiry"], ["LinkedIn", linkedinUrl]],
        followups: ["Show proof points", "Is this the wrong lane?"]
      },
      hiringManager: {
        title: "Hiring-manager read",
        paragraphs: [
          "Marco is useful when leaders do not trust the portfolio signal: demand is scattered, readiness is overclaimed, tradeoffs are hidden, and follow-through depends too much on informal memory.",
          "He is less a feature owner and more the operating layer that turns executive intent into inspectable decisions, cadence, and delivery discipline."
        ],
        bullets: profile.targetLanes.slice(0, 4),
        actions: [["Send role inquiry", "#role-inquiry"], ["Proof points", "operating-history.html#entries"]],
        followups: ["Show proof points", "Explain the AI angle"]
      },
      nonTarget: {
        title: "Probably not the right lane",
        paragraphs: [
          "If the role is primarily software engineering, ML/data science, product ownership, GM, or VP-level business ownership, this site is not trying to make that case.",
          "The stronger lane is operating leadership: PMO, portfolio governance, program operations, executive cadence, readiness, decision support, and AI workflow governance."
        ],
        bullets: profile.nonTargets,
        actions: [["Send role inquiry", "#role-inquiry"], ["Check role fit", "pmo-portfolio-governance-leader.html"]],
        followups: ["What roles are best?", "Give me the recruiter screen"]
      },
      roleFit: {
        title: signals.hasDirector || signals.hasPMO ? "Strong potential fit" : "Best-fit role lanes",
        paragraphs: [
          "The strongest match is a Director / Principal-level role where the problem is not just delivery, but the operating system around delivery.",
          "Look for language around portfolio visibility, PMO maturity, governance cadence, executive reporting, delivery readiness, cross-functional ownership, and decision support."
        ],
        bullets: profile.targetLanes,
        actions: [["Send role inquiry", "#role-inquiry"], ["Proof points", "operating-history.html#entries"]],
        followups: ["Show proof points", "Is this the wrong lane?"]
      },
      proof: {
        title: "Proof points to inspect",
        paragraphs: [
          "The best evidence is in the case studies and workflow systems. The site separates real operating-history claims from public-safe proof-of-concept modules.",
          "For a hiring conversation, use the cases for credibility and the modules to inspect how Marco thinks."
        ],
        bullets: profile.proofPoints,
        actions: [["Send role inquiry", "#role-inquiry"], ["Case studies", "operating-history.html#entries"]],
        followups: ["Give me the recruiter screen", "Explain proof boundaries"]
      },
      ai: {
        title: "AI angle",
        paragraphs: [
          "The AI portfolio is not positioned as model ownership or production SaaS. It is positioned as operating governance: how AI-enabled work gets scoped, reviewed, bounded, and turned into usable workflow.",
          "That makes it most relevant for organizations trying to adopt AI without losing evidence, accountability, human review, or decision quality."
        ],
        bullets: [
          "Best fit: AI workflow governance, artifact lifecycle, review gates, reliance boundaries, and value logic.",
          "Not claimed: autonomous approvals, ML/data-science ownership, or measured enterprise AI savings unless separately evidenced."
        ],
        actions: [["Send role inquiry", "#role-inquiry"], ["AI proof", "proof.html"]],
        followups: ["Show workflow systems", "Show proof points"]
      },
      systems: {
        title: "Workflow systems",
        paragraphs: [
          "The modules are public-safe examples of the operating mechanics behind the work: intake, prioritization, charters, readiness, value realization, proof review, and AI governance.",
          "They are useful when someone wants to inspect work style instead of only reading claims."
        ],
        bullets: ["Start with Workflow Systems for the library.", "Use How I Work for end-to-end operating routes."],
        actions: [["Send role inquiry", "#role-inquiry"], ["Workflow systems", "modules.html"]],
        followups: ["Explain the AI angle", "Show proof points"]
      },
      compensation: {
        title: "Level and scope",
        paragraphs: [
          "The intended level is Director / Principal operating leadership. Scope should include portfolio visibility, governance rhythm, readiness discipline, executive decision support, or program operations.",
          "A senior individual-contributor title can still fit if the mandate is enterprise operating leverage rather than narrow task execution."
        ],
        bullets: profile.targetLanes.slice(0, 3),
        actions: [["Send role inquiry", "#role-inquiry"], ["Check role fit", "pmo-portfolio-governance-leader.html"]],
        followups: ["Give me the recruiter screen", "How do I contact Marco?"]
      },
      resources: {
        title: "Resources lane",
        paragraphs: [
          "The Resources page is the community/tooling side of the site: career helpers, job-search utilities, writing tools, and demos.",
          "For hiring evaluation, use Role Fit, Case Studies, Evidence, and Workflow Systems first."
        ],
        bullets: ["Resources are useful supporting context.", "They are not the primary executive-portfolio proof path."],
        actions: [["Send role inquiry", "#role-inquiry"], ["Resources", "resources.html"]],
        followups: ["Would Marco fit this role?", "Show proof points"]
      },
      summary: {
        title: "Have a role? Send it first.",
        paragraphs: [
          "Marco builds the operating layer between executive intent and delivery reality: portfolio signal, governance cadence, readiness discipline, decision support, and accountable execution.",
          state.visitorType ? `Since you look like a ${state.visitorType}, the fastest path is to send the role inquiry, then use proof links only if you need backup.` : "If you have a possible role, the fastest path is to send the role inquiry. Use the other answers only to check fit."
        ],
        bullets: ["Best lanes: PMO, portfolio governance, program operations, executive operations, and AI workflow governance."],
        actions: [["Send role inquiry", "#role-inquiry"], ["Check role fit", "pmo-portfolio-governance-leader.html"]],
        followups: ["Give me the recruiter screen", "Show proof points"]
      }
    };

    return answers[intent] || answers.summary;
  }

  function actionHref(href) {
    if (href === "#email") return getMailtoHref();
    return href;
  }

  function buildField(labelText, name, placeholder, multiline) {
    const label = createElement("label", "inquiry-field");
    const labelSpan = createElement("span", "", labelText);
    const field = createElement(multiline ? "textarea" : "input", "");
    field.name = name;
    field.placeholder = placeholder;
    if (!multiline) field.type = "text";
    label.append(labelSpan, field);
    return label;
  }

  function buildInquiryForm() {
    const form = createElement("form", "concierge-inquiry");
    form.append(
      createElement("strong", "", "Send Marco a role inquiry"),
      createElement("span", "", "Add what you know. Nothing is sent or stored here; this opens a prefilled email draft."),
      buildField("Role title", "role", "Director PMO, Portfolio Governance Lead, etc."),
      buildField("Company", "company", "Company or recruiting firm"),
      buildField("Remote / hybrid / location", "location", "Remote, Seattle hybrid, etc."),
      buildField("Posting URL", "posting", "https://..."),
      buildField("Hiring need", "note", "What operating problem does the role need to solve?", true)
    );
    const submit = createElement("button", "", "Open email to Marco");
    submit.type = "submit";
    form.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      window.location.href = getMailtoHref({
        role: String(data.get("role") || "").trim(),
        company: String(data.get("company") || "").trim(),
        location: String(data.get("location") || "").trim(),
        posting: String(data.get("posting") || "").trim(),
        note: String(data.get("note") || "").trim()
      });
    });
    return form;
  }

  function addMessage(messages, role, content) {
    const message = createElement("div", `concierge-message ${role}`);
    if (typeof content === "string") {
      message.textContent = content;
    } else {
      message.append(content);
    }
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function buildReply(answer, askFollowup, startInquiry) {
    const fragment = document.createDocumentFragment();
    const title = createElement("strong", "", answer.title);
    fragment.append(title);

    answer.paragraphs.forEach((paragraph) => {
      fragment.append(createElement("span", "", paragraph));
    });

    if (answer.bullets && answer.bullets.length) {
      const list = createElement("ul", "concierge-list");
      answer.bullets.forEach((item) => {
        list.append(createElement("li", "", item));
      });
      fragment.append(list);
    }

    const actionWrap = createElement("div", "concierge-actions");
    answer.actions.forEach(([label, href]) => {
      if (href === "#role-inquiry") {
        const button = createElement("button", "primary-action", label);
        button.type = "button";
        button.addEventListener("click", startInquiry);
        actionWrap.append(button);
        return;
      }
      const link = createElement("a", "", label);
      link.href = actionHref(href);
      if (href.startsWith("http")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      actionWrap.append(link);
    });
    fragment.append(actionWrap);

    if (answer.followups && answer.followups.length) {
      const followupWrap = createElement("div", "concierge-followups");
      answer.followups.forEach((followup) => {
        const button = createElement("button", "", followup);
        button.type = "button";
        button.addEventListener("click", () => askFollowup(followup));
        followupWrap.append(button);
      });
      fragment.append(followupWrap);
    }

    return fragment;
  }

  function initConcierge() {
    if (document.querySelector("[data-site-concierge]")) return;

    const widget = createElement("section", "site-concierge");
    widget.setAttribute("data-site-concierge", "");
    widget.setAttribute("aria-label", "Site concierge");

    const panel = createElement("div", "concierge-panel");
    panel.hidden = true;

    const header = createElement("div", "concierge-header");
    const headingWrap = createElement("div", "");
    headingWrap.append(
      createElement("strong", "", "Site concierge"),
      createElement("span", "", "Send a role inquiry. No API, tracking, or transcript.")
    );
    const closeButton = createElement("button", "concierge-close", "Close");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close concierge");
    header.append(headingWrap, closeButton);

    const messages = createElement("div", "concierge-messages");
    messages.setAttribute("aria-live", "polite");
    addMessage(messages, "bot", "Have a role that may fit Marco? Send the details here. You can also ask a quick fit question first.");

    const promptWrap = createElement("div", "concierge-prompts");
    const input = createElement("input", "");

    function ask(question, overrideIntent) {
      addMessage(messages, "user", question);
      const answer = answerFor(question, overrideIntent);
      addMessage(messages, "bot", buildReply(answer, ask, startInquiry));
      input.placeholder = examples[Math.floor(Math.random() * examples.length)];
    }

    function startInquiry() {
      const existingForm = messages.querySelector(".concierge-inquiry");
      if (existingForm) {
        existingForm.scrollIntoView({ block: "nearest" });
        const firstField = existingForm.querySelector("input, textarea");
        if (firstField) firstField.focus();
        return;
      }
      addMessage(messages, "bot", buildInquiryForm());
    }

    startInquiry();

    quickPrompts.forEach((prompt) => {
      const button = createElement("button", "", prompt);
      button.type = "button";
      button.addEventListener("click", () => {
        if (prompt === "Send role inquiry") {
          startInquiry();
          return;
        }
        ask(prompt);
      });
      promptWrap.append(button);
    });

    const form = createElement("form", "concierge-form");
    const label = createElement("label", "visually-hidden", "Ask a question");
    label.htmlFor = "concierge-question";
    input.id = "concierge-question";
    input.type = "text";
    input.name = "question";
    input.autocomplete = "off";
    input.placeholder = "Ask like: Is Marco a fit for Director PMO?";
    const send = createElement("button", "", "Send");
    send.type = "submit";
    form.append(label, input, send);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      input.value = "";
      ask(question);
    });

    const note = createElement("p", "concierge-note", "Static helper only; no visitor data is stored or sent by this widget. Email opens only when you choose it.");
    panel.append(header, messages, promptWrap, form, note);

    const teaser = createElement("button", "concierge-teaser", "");
    teaser.type = "button";
    teaser.setAttribute("aria-controls", "site-concierge-panel");
    teaser.innerHTML = "<strong>Have a role for Marco?</strong><span>Open a role-inquiry email draft.</span>";

    const toggle = createElement("button", "concierge-toggle", "");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "site-concierge-panel");
    toggle.innerHTML = '<span class="concierge-icon" aria-hidden="true"></span><span>Send Role</span>';

    panel.id = "site-concierge-panel";
    widget.append(panel, teaser, toggle);
    document.body.append(widget);

    function setOpen(isOpen) {
      panel.hidden = !isOpen;
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        teaser.classList.add("hidden");
        window.setTimeout(() => {
          const inquiryField = panel.querySelector(".concierge-inquiry input");
          if (inquiryField) {
            inquiryField.focus();
            inquiryField.scrollIntoView({ block: "nearest" });
            return;
          }
          input.focus();
        }, 50);
      }
    }

    toggle.addEventListener("click", () => setOpen(panel.hidden));
    teaser.addEventListener("click", () => setOpen(true));
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
