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
    role: [["Evaluate role fit", "pmo-portfolio-governance-leader.html"], ["Open case studies", "operating-history.html"]],
    proof: [["Case studies", "operating-history.html#entries"], ["Evidence boundaries", "proof.html"]],
    ai: [["AI proof boundaries", "proof.html"], ["Workflow systems", "modules.html"]],
    contact: [["Send role inquiry", "#role-inquiry"], ["Connect on LinkedIn", linkedinUrl], ["Open email draft", "#email"]],
    resume: [["Open LinkedIn", linkedinUrl], ["Role fit", "pmo-portfolio-governance-leader.html"]],
    systems: [["Workflow systems", "modules.html"], ["How I work", "artifacts.html"]],
    resources: [["Resources", "resources.html"], ["Portfolio map", "portfolio.html"]]
  };

  const quickPrompts = [
    "Would Marco fit this role?",
    "Give me the recruiter screen",
    "Show proof points",
    "Explain the AI angle",
    "Send role inquiry"
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
        title: "Yes. For a role-specific conversation, use LinkedIn or the email draft.",
        paragraphs: [
          "This looks like a recruiting or hiring-manager contact question tied to role fit, so the best path is: check the Role Fit page, skim the strongest case studies, then contact Marco with the role scope.",
          "The site keeps direct contact details off the rendered page for privacy; the email button opens a prefilled draft from your own mail client."
        ],
        bullets: [
          "Best fit: Director / Principal PMO, portfolio governance, program operations, executive operations, and AI workflow governance.",
          "Include the role title, reporting line, operating problem, and whether the need is portfolio signal, governance cadence, readiness, or decision support."
        ],
        actions: [["Send role inquiry", "#role-inquiry"], ["Role fit", "pmo-portfolio-governance-leader.html"], ["LinkedIn", linkedinUrl]],
        followups: ["Give me the recruiter screen", "Show proof points"]
      };
    }

    const answers = {
      contact: {
        title: "Best contact path",
        paragraphs: [
          "LinkedIn is the preferred first channel because it gives recruiters and hiring teams the full work-history context without publishing private contact details on this page.",
          "If email is better, use the role-inquiry path. It builds a cleaner draft with the role details a recruiter or hiring manager would normally send."
        ],
        bullets: ["Mention the role, company, scope, location/remote expectations, and the main operating problem."],
        actions: actions.contact,
        followups: ["Would Marco fit this role?", "Give me the recruiter screen"]
      },
      recruiter: {
        title: "Recruiter screen",
        paragraphs: [
          "Screen Marco for Director / Principal operating-leadership roles where the work is PMO, portfolio governance, program operations, executive cadence, readiness, and decision support.",
          "The clean recruiter summary is: senior operator who makes complex portfolios legible, governable, and actionable. If there is a live role, use the role-inquiry button so the first message carries the useful details."
        ],
        bullets: [
          "Strong signals: PMO / EPMO / PPMO, portfolio governance, delivery readiness, executive reporting, value realization, AI workflow governance.",
          "Use LinkedIn for the full resume; use this site for proof, case studies, and public-safe work samples.",
          "Avoid routing him as software engineering, ML/data science, or product-owner talent."
        ],
        actions: [["Send role inquiry", "#role-inquiry"], ["Open LinkedIn", linkedinUrl], ["Role fit", "pmo-portfolio-governance-leader.html"]],
        followups: ["Show proof points", "Is this the wrong lane?"]
      },
      hiringManager: {
        title: "Hiring-manager read",
        paragraphs: [
          "Marco is useful when leaders do not trust the portfolio signal: demand is scattered, readiness is overclaimed, tradeoffs are hidden, and follow-through depends too much on informal memory.",
          "He is less a feature owner and more the operating layer that turns executive intent into inspectable decisions, cadence, and delivery discipline."
        ],
        bullets: profile.targetLanes.slice(0, 4),
        actions: actions.role,
        followups: ["Show proof points", "Explain the AI angle"]
      },
      nonTarget: {
        title: "Probably not the right lane",
        paragraphs: [
          "If the role is primarily software engineering, ML/data science, product ownership, GM, or VP-level business ownership, this site is not trying to make that case.",
          "The stronger lane is operating leadership: PMO, portfolio governance, program operations, executive cadence, readiness, decision support, and AI workflow governance."
        ],
        bullets: profile.nonTargets,
        actions: actions.role,
        followups: ["What roles are best?", "Give me the recruiter screen"]
      },
      roleFit: {
        title: signals.hasDirector || signals.hasPMO ? "Strong potential fit" : "Best-fit role lanes",
        paragraphs: [
          "The strongest match is a Director / Principal-level role where the problem is not just delivery, but the operating system around delivery.",
          "Look for language around portfolio visibility, PMO maturity, governance cadence, executive reporting, delivery readiness, cross-functional ownership, and decision support."
        ],
        bullets: profile.targetLanes,
        actions: actions.role,
        followups: ["Show proof points", "Is this the wrong lane?"]
      },
      proof: {
        title: "Proof points to inspect",
        paragraphs: [
          "The best evidence is in the case studies and workflow systems. The site separates real operating-history claims from public-safe proof-of-concept modules.",
          "For a hiring conversation, use the cases for credibility and the modules to inspect how Marco thinks."
        ],
        bullets: profile.proofPoints,
        actions: actions.proof,
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
        actions: actions.ai,
        followups: ["Show workflow systems", "Show proof points"]
      },
      systems: {
        title: "Workflow systems",
        paragraphs: [
          "The modules are public-safe examples of the operating mechanics behind the work: intake, prioritization, charters, readiness, value realization, proof review, and AI governance.",
          "They are useful when someone wants to inspect work style instead of only reading claims."
        ],
        bullets: ["Start with Workflow Systems for the library.", "Use How I Work for end-to-end operating routes."],
        actions: actions.systems,
        followups: ["Explain the AI angle", "Show proof points"]
      },
      compensation: {
        title: "Level and scope",
        paragraphs: [
          "The intended level is Director / Principal operating leadership. Scope should include portfolio visibility, governance rhythm, readiness discipline, executive decision support, or program operations.",
          "A senior individual-contributor title can still fit if the mandate is enterprise operating leverage rather than narrow task execution."
        ],
        bullets: profile.targetLanes.slice(0, 3),
        actions: actions.role,
        followups: ["Give me the recruiter screen", "How do I contact Marco?"]
      },
      resources: {
        title: "Resources lane",
        paragraphs: [
          "The Resources page is the community/tooling side of the site: career helpers, job-search utilities, writing tools, and demos.",
          "For hiring evaluation, use Role Fit, Case Studies, Evidence, and Workflow Systems first."
        ],
        bullets: ["Resources are useful supporting context.", "They are not the primary executive-portfolio proof path."],
        actions: actions.resources,
        followups: ["Would Marco fit this role?", "Show proof points"]
      },
      summary: {
        title: "Short answer",
        paragraphs: [
          "Marco builds the operating layer between executive intent and delivery reality: portfolio signal, governance cadence, readiness discipline, decision support, and accountable execution.",
          state.visitorType ? `Since you look like a ${state.visitorType}, the fastest path is Role Fit, then Case Studies, then LinkedIn.` : "The fastest path is Role Fit, then Case Studies, then LinkedIn."
        ],
        bullets: ["Best lanes: PMO, portfolio governance, program operations, executive operations, and AI workflow governance."],
        actions: [["Evaluate role fit", "pmo-portfolio-governance-leader.html"], ["Send role inquiry", "#role-inquiry"]],
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
      createElement("strong", "", "Role inquiry draft"),
      createElement("span", "", "Add what you know. Nothing is sent or stored here; submitting opens your email client with a draft."),
      buildField("Role title", "role", "Director PMO, Portfolio Governance Lead, etc."),
      buildField("Company", "company", "Company or recruiting firm"),
      buildField("Remote / hybrid / location", "location", "Remote, Seattle hybrid, etc."),
      buildField("Posting URL", "posting", "https://..."),
      buildField("Hiring need", "note", "What operating problem does the role need to solve?", true)
    );
    const submit = createElement("button", "", "Open email draft");
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
        const button = createElement("button", "", label);
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
      createElement("span", "", "Static answer guide. No API, tracking, or transcript.")
    );
    const closeButton = createElement("button", "concierge-close", "Close");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close concierge");
    header.append(headingWrap, closeButton);

    const messages = createElement("div", "concierge-messages");
    messages.setAttribute("aria-live", "polite");
    addMessage(messages, "bot", "Ask me like a recruiter or hiring manager. I can screen role fit, proof, AI governance, work style, contact path, and wrong-lane questions.");

    const promptWrap = createElement("div", "concierge-prompts");
    const input = createElement("input", "");

    function ask(question, overrideIntent) {
      addMessage(messages, "user", question);
      const answer = answerFor(question, overrideIntent);
      addMessage(messages, "bot", buildReply(answer, ask, startInquiry));
      input.placeholder = examples[Math.floor(Math.random() * examples.length)];
    }

    function startInquiry() {
      addMessage(messages, "bot", buildInquiryForm());
    }

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
    teaser.innerHTML = "<strong>Need the fastest path?</strong><span>Ask role fit, proof, AI, or contact.</span>";

    const toggle = createElement("button", "concierge-toggle", "");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "site-concierge-panel");
    toggle.innerHTML = '<span class="concierge-icon" aria-hidden="true"></span><span>Ask Marco</span>';

    panel.id = "site-concierge-panel";
    widget.append(panel, teaser, toggle);
    document.body.append(widget);

    function setOpen(isOpen) {
      panel.hidden = !isOpen;
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        teaser.classList.add("hidden");
        window.setTimeout(() => input.focus(), 50);
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
