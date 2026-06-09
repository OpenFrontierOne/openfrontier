(() => {
  "use strict";

  const audiences = [
    { id: "student", icon: "ST", label: "Student", note: "Learn, practise, build a portfolio" },
    { id: "educator", icon: "ED", label: "Educator", note: "Teach with interactive material" },
    { id: "business", icon: "SM", label: "Small business", note: "Launch, operate, and grow" },
    { id: "freelancer", icon: "FR", label: "Freelancer", note: "Look professional and get paid" },
    { id: "creator", icon: "CR", label: "Creator", note: "Write, design, publish, or make music" },
    { id: "developer", icon: "DV", label: "Developer", note: "Build software and explore systems" },
    { id: "career", icon: "NX", label: "Career changer", note: "Gain practical, visible experience" },
    { id: "researcher", icon: "RS", label: "Researcher", note: "Explore data and technical models" },
    { id: "nonprofit", icon: "NP", label: "Nonprofit or community", note: "Communicate and organize" },
    { id: "household", icon: "ME", label: "Everyday user", note: "Solve a practical personal task" },
    { id: "retired", icon: "LF", label: "Lifelong learner", note: "Explore, read, write, and create" },
    { id: "curious", icon: "?", label: "Just curious", note: "Show me something interesting" }
  ];

  const routes = [
    {
      id: "business-website",
      title: "Put your business online",
      icon: "WEB",
      audiences: ["business", "freelancer", "nonprofit", "career"],
      goals: ["website", "launch", "customers"],
      keywords: "website site online bakery restaurant studio salon portfolio local business landing page",
      summary: "FreeWebStore turns a description of your business into a tailored one-page website using 108 niche templates.",
      outcome: "A fast public site with your services, story, contact details, and calls to action.",
      steps: ["Describe the business and audience", "Choose and tailor a niche template", "Publish, then add brand and marketing"],
      primary: { label: "Build with FreeWebStore", url: "https://freewebstore.online" },
      secondary: [
        { label: "Create the brand", url: "https://freedesignstore.pages.dev" },
        { label: "Plan the launch", url: "https://freemarketingstore.pages.dev" }
      ],
      status: "Production"
    },
    {
      id: "serious-cms",
      title: "Build a structured, growing website",
      icon: "CMS",
      audiences: ["business", "nonprofit", "developer"],
      goals: ["website", "organization", "content"],
      keywords: "cms multi page structured content organization church association knowledge graph custom website",
      summary: "ProWebStore is for multi-page sites with structured entities, relationships, media, forms, and ongoing AI-assisted operation.",
      outcome: "A CMS-class site rather than a single static page.",
      steps: ["Define content types and relationships", "Evaluate current architecture and caveats", "Plan migration, ownership, and support"],
      primary: { label: "Evaluate ProWebStore", url: "https://prowebstore.online" },
      secondary: [{ label: "Read the maturity brief", url: "/stakeholders" }],
      status: "Production with caveats"
    },
    {
      id: "brand-launch",
      title: "Create a credible brand",
      icon: "BR",
      audiences: ["business", "freelancer", "creator", "nonprofit", "career"],
      goals: ["brand", "design", "launch"],
      keywords: "logo brand colors palette typography business card image social graphics professional identity",
      summary: "FreeDesignStore includes logo, color, typography, image, template, UI, accessibility, and brand-kit tools.",
      outcome: "Exportable visual assets without a mandatory account or watermark.",
      steps: ["Build a logo and palette", "Test contrast and typography", "Export a consistent brand kit"],
      primary: { label: "Open FreeDesignStore", url: "https://freedesignstore.pages.dev" },
      secondary: [{ label: "Turn it into a website", url: "https://freewebstore.online" }],
      status: "Live"
    },
    {
      id: "find-customers",
      title: "Plan how people will find you",
      icon: "MKT",
      audiences: ["business", "freelancer", "creator", "nonprofit"],
      goals: ["marketing", "customers", "launch"],
      keywords: "marketing campaign customers seo social content calendar launch audience persona headline domain",
      summary: "FreeMarketingStore helps plan campaigns, content, SEO, social posts, customer journeys, and launch checklists.",
      outcome: "A practical campaign plan and reusable content workflow; it does not automatically post or spend money.",
      steps: ["Define the audience and value proposition", "Build a campaign and content calendar", "Add tracking and test ideas"],
      primary: { label: "Open FreeMarketingStore", url: "https://freemarketingstore.pages.dev" },
      secondary: [{ label: "Create visual assets", url: "https://freedesignstore.pages.dev" }],
      status: "Live"
    },
    {
      id: "microelectronics",
      title: "Learn microelectronics and chip design",
      icon: "CHIP",
      audiences: ["student", "educator", "career", "developer", "researcher", "curious"],
      goals: ["learn", "hardware", "volunteer"],
      keywords: "microelectronics semiconductor chip cpu hardware fpga logic gates alu pipeline cache gpu isa volunteer experience internship",
      summary: "FreeChipStore lets you work from logic gates and ALUs through CPU pipelines, caches, GPUs, instruction sets, and fabrication concepts.",
      outcome: "Hands-on conceptual experience and portfolio-ready explanations without physical lab equipment.",
      steps: ["Start with gates and the ALU", "Build or inspect a CPU pipeline", "Contribute tests, explanations, or a simulation"],
      primary: { label: "Explore FreeChipStore", url: "https://freechipstore.pages.dev" },
      secondary: [
        { label: "Volunteer through open source", url: "/contribute" },
        { label: "View the GitHub organization", url: "https://github.com/freechipstore-online" }
      ],
      status: "Live",
      caveat: "OFO offers volunteer open-source contribution, not employment or semiconductor-industry placement."
    },
    {
      id: "robotics",
      title: "Practise robotics without a robot lab",
      icon: "BOT",
      audiences: ["student", "educator", "career", "developer", "researcher", "curious"],
      goals: ["learn", "robotics", "portfolio"],
      keywords: "robotics robot control slam lidar path planning sensor fusion kinematics reinforcement learning neural network",
      summary: "FreeRobotStore covers motion, sensors, SLAM, path planning, control systems, multi-robot coordination, and learning.",
      outcome: "Interactive understanding of complete robot pipelines and their tradeoffs.",
      steps: ["Explore motion and sensing", "Compare planning and control algorithms", "Explain or extend one system"],
      primary: { label: "Explore FreeRobotStore", url: "https://freerobotstore.online" },
      secondary: [{ label: "Contribute a robotics improvement", url: "/contribute" }],
      status: "Live"
    },
    {
      id: "quantum",
      title: "Get practical intuition for quantum computing",
      icon: "Q",
      audiences: ["student", "educator", "career", "developer", "researcher", "curious"],
      goals: ["learn", "quantum", "research"],
      keywords: "quantum qubit circuits gates teleportation grover vqe qft error correction qiskit",
      summary: "FreeQuantumStore provides real state-vector simulations for gates, circuits, algorithms, protocols, annealing, and error correction.",
      outcome: "A bridge from abstract quantum concepts to circuits you can manipulate and export.",
      steps: ["Manipulate a single qubit", "Build and measure circuits", "Study an algorithm or error-correction path"],
      primary: { label: "Explore FreeQuantumStore", url: "https://freequantumstore.pages.dev" },
      secondary: [{ label: "Review education guidance", url: "/faq#education" }],
      status: "Live"
    },
    {
      id: "biology",
      title: "Explore biology and biotechnology",
      icon: "BIO",
      audiences: ["student", "educator", "career", "researcher", "curious"],
      goals: ["learn", "biology", "research"],
      keywords: "biology biotech crispr genetics protein folding enzyme ecology neuroscience cells dna",
      summary: "FreeBioStore covers genetics, CRISPR, gene expression, proteins, cells, ecology, enzymes, and biological neural systems.",
      outcome: "Interactive models for understanding processes that are otherwise difficult to observe directly.",
      steps: ["Choose a biological scale", "Change parameters and form a prediction", "Compare the model with authoritative sources"],
      primary: { label: "Explore FreeBioStore", url: "https://freebiostore.pages.dev" },
      secondary: [{ label: "Contribute domain review", url: "/contribute" }],
      status: "Live"
    },
    {
      id: "space",
      title: "Design missions and understand spaceflight",
      icon: "ORB",
      audiences: ["student", "educator", "career", "researcher", "curious"],
      goals: ["learn", "space", "engineering"],
      keywords: "space orbital rocket satellite mission mars reentry propulsion gravity assist constellation aerospace",
      summary: "FreeSpaceStore includes orbital mechanics, transfers, rocket staging, reentry, Mars landing, observation, and satellite constellations.",
      outcome: "Visual intuition for mission constraints, delta-v, trajectories, and spacecraft systems.",
      steps: ["Learn orbit and transfer basics", "Design a vehicle or constellation", "Run a complete mission scenario"],
      primary: { label: "Explore FreeSpaceStore", url: "https://freespacestore.pages.dev" },
      secondary: [{ label: "Contribute a mission model", url: "/contribute" }],
      status: "Live"
    },
    {
      id: "crypto-systems",
      title: "Understand blockchain and cryptography",
      icon: "CRY",
      audiences: ["student", "educator", "developer", "researcher", "curious"],
      goals: ["learn", "crypto", "security"],
      keywords: "blockchain crypto cryptography hash merkle consensus smart contract defi zero knowledge security",
      summary: "FreeCryptoStore teaches chains, consensus, hashes, signatures, Merkle trees, smart contracts, DeFi, and common attacks.",
      outcome: "Systems understanding without buying tokens or connecting a wallet.",
      steps: ["Build and tamper with a chain", "Compare consensus mechanisms", "Explore contracts, DeFi, or attacks"],
      primary: { label: "Explore FreeCryptoStore", url: "https://freecryptostore.pages.dev" },
      secondary: [{ label: "Read safety and accuracy notes", url: "/faq#education" }],
      status: "Live",
      caveat: "Educational simulations are not investment advice and do not require cryptocurrency purchases."
    },
    {
      id: "teach-stem",
      title: "Build an interactive STEM lesson",
      icon: "LESS",
      audiences: ["educator", "student"],
      goals: ["teach", "learn", "classroom"],
      keywords: "teacher classroom lesson curriculum activity assignment stem school university simulation",
      summary: "Use direct simulation links from Robotics, Quantum, Chips, Space, Biology, or Crypto Systems to create inquiry-based lessons.",
      outcome: "A no-account activity where learners predict, manipulate, observe, and explain.",
      steps: ["Choose one learning objective", "Review the simulation and assumptions", "Ask students to predict, test, and explain"],
      primary: { label: "Browse simulation stores", url: "/#learn" },
      secondary: [
        { label: "Education FAQ", url: "/faq#education" },
        { label: "Contribute curriculum material", url: "/contribute" }
      ],
      status: "Available now"
    },
    {
      id: "career-portfolio",
      title: "Build evidence for a career change",
      icon: "PORT",
      audiences: ["student", "career", "freelancer"],
      goals: ["portfolio", "volunteer", "career"],
      keywords: "career change portfolio experience volunteer job skills open source resume proof project",
      summary: "Choose a technical or creative store, improve one real item, document the problem and evidence, then publish the contribution.",
      outcome: "A concrete portfolio story showing investigation, implementation, testing, and communication.",
      steps: ["Choose a domain you want to enter", "Fix or extend one bounded item", "Write a case study and link the contribution"],
      primary: { label: "Read the contribution guide", url: "/contribute" },
      secondary: [
        { label: "Choose a technical simulation", url: "/#learn" },
        { label: "Choose a practical tool", url: "/#create" }
      ],
      status: "Volunteer path",
      caveat: "Open-source contribution provides experience and evidence, not guaranteed employment."
    },
    {
      id: "build-app",
      title: "Turn an idea into a browser app",
      icon: "APP",
      audiences: ["developer", "student", "career", "business", "curious"],
      goals: ["build", "app", "publish"],
      keywords: "build app pwa software prototype publish web application storage auth realtime",
      summary: "FreeAppStore provides templates, publishing, hosting, auth, storage, rooms, email, proxy, roles, and other app services.",
      outcome: "A hosted, installable web app with an open-source publishing path.",
      steps: ["Define one focused user problem", "Create through the builder or CLI", "Run checks and publish"],
      primary: { label: "Explore FreeAppStore", url: "https://freeappstore.online" },
      secondary: [{ label: "Need server features?", url: "https://proappstore.online" }],
      status: "Production"
    },
    {
      id: "developer-tools",
      title: "Solve a development task quickly",
      icon: "DEV",
      audiences: ["developer", "student", "career", "researcher"],
      goals: ["code", "debug", "convert"],
      keywords: "developer code json regex api jwt uuid sql formatter converter tester cron diff",
      summary: "FreeCodeStore collects focused formatters, testers, encoders, converters, generators, and API utilities.",
      outcome: "Fast browser-based help without installing a large desktop suite.",
      steps: ["Open the focused utility", "Keep sensitive inputs local where possible", "Verify production-critical output"],
      primary: { label: "Open FreeCodeStore", url: "https://freecodestore.pages.dev" },
      secondary: [{ label: "Build a complete app", url: "https://freeappstore.online" }],
      status: "Live"
    },
    {
      id: "local-ai",
      title: "Use AI with more local control",
      icon: "AI",
      audiences: ["developer", "student", "researcher", "creator", "business", "curious"],
      goals: ["ai", "privacy", "productivity"],
      keywords: "ai artificial intelligence local private browser webgpu wasm transcription tts ocr summarize model",
      summary: "FreeAgentStore offers browser libraries, local ONNX models, and agents using local hardware, built-in browser AI, or user-authorized APIs.",
      outcome: "Useful AI workflows with a clearer choice between local and network execution.",
      steps: ["Choose a specific AI task", "Check model size and browser support", "Review whether data stays local"],
      primary: { label: "Explore FreeAgentStore", url: "https://freeagentstore.online" },
      secondary: [{ label: "Read privacy guidance", url: "/privacy#ai-features" }],
      status: "Early beta"
    },
    {
      id: "data-work",
      title: "Inspect and clean a dataset",
      icon: "DATA",
      audiences: ["researcher", "developer", "student", "business"],
      goals: ["data", "research", "analysis"],
      keywords: "data csv sql dataset clean profile validate convert explore duckdb analysis research",
      summary: "FreeDataStore provides browser-based profiling, cleaning, schema validation, conversion, exploration, and DuckDB-WASM SQL.",
      outcome: "A quick understanding of dataset shape and quality without uploading it to a conventional analytics service.",
      steps: ["Profile columns and missing values", "Clean or validate the schema", "Query and export the result"],
      primary: { label: "Open FreeDataStore", url: "https://freedatastore.pages.dev" },
      secondary: [{ label: "Developer conversion tools", url: "https://freecodestore.pages.dev" }],
      status: "Small live catalog"
    },
    {
      id: "writing",
      title: "Improve an essay, article, or story",
      icon: "WRITE",
      audiences: ["student", "creator", "career", "freelancer", "retired", "household"],
      goals: ["write", "study", "content"],
      keywords: "writing essay grammar readability citation screenplay blog story prompts character plagiarism",
      summary: "FreeWritingStore includes editors, coaching, readability, grammar, citations, prompts, characters, plots, and screenplay tools.",
      outcome: "A clearer draft and better understanding of structure; automated checks still need human judgment.",
      steps: ["Draft or paste your work", "Use analysis tools selectively", "Revise in your own voice"],
      primary: { label: "Open FreeWritingStore", url: "https://freewritingstore.pages.dev" },
      secondary: [{ label: "Publish a book", url: "https://freebookstore.pages.dev" }],
      status: "Live"
    },
    {
      id: "publish-book",
      title: "Write, format, and present a book",
      icon: "BOOK",
      audiences: ["creator", "retired", "student", "freelancer"],
      goals: ["book", "publish", "write"],
      keywords: "book author novel manuscript epub cover blurb isbn audiobook publish reading",
      summary: "FreeBookStore combines public-domain reading with book writing, outlining, cover design, manuscript formatting, blurbs, ISBN lookup, and EPUB tools.",
      outcome: "A structured manuscript and supporting publishing assets.",
      steps: ["Plan and write the manuscript", "Format and create the cover", "Prepare metadata and reader feedback"],
      primary: { label: "Open FreeBookStore", url: "https://freebookstore.pages.dev" },
      secondary: [{ label: "Improve the prose", url: "https://freewritingstore.pages.dev" }],
      status: "Live"
    },
    {
      id: "make-music",
      title: "Learn, record, or make music",
      icon: "MUS",
      audiences: ["creator", "student", "retired", "curious"],
      goals: ["music", "create", "learn"],
      keywords: "music beat synth dj record audio chord scale tuner metronome theory midi sheet music",
      summary: "FreeMusicStore includes production, mixing, recording, theory, ear training, utilities, sheet music, samples, and MIDI tools.",
      outcome: "A browser-based music workspace for practice, sketches, and exported audio.",
      steps: ["Choose theory, performance, or production", "Create or record a short piece", "Refine with mixing and utility tools"],
      primary: { label: "Open FreeMusicStore", url: "https://freemusicstore.pages.dev" },
      secondary: [{ label: "Create cover artwork", url: "https://freedesignstore.pages.dev" }],
      status: "Live"
    },
    {
      id: "personal-finance",
      title: "Understand a personal finance decision",
      icon: "$",
      audiences: ["household", "retired", "freelancer", "business", "student"],
      goals: ["money", "plan", "business"],
      keywords: "finance budget expense mortgage loan retirement compound interest tax salary invoice pricing break even",
      summary: "FreeFinanceStore provides budgets, expenses, mortgages, loans, retirement, interest, invoices, receipts, pricing, and break-even calculators.",
      outcome: "A transparent estimate or planning document you can export and verify.",
      steps: ["Choose the relevant calculator", "Check assumptions and units", "Verify consequential decisions independently"],
      primary: { label: "Open FreeFinanceStore", url: "https://freefinancestore.pages.dev" },
      secondary: [{ label: "Business planning tools", url: "https://freemarketingstore.pages.dev" }],
      status: "Live",
      caveat: "These tools support planning and education; they are not financial, tax, or investment advice."
    },
    {
      id: "freelancer-kit",
      title: "Set up a freelance practice",
      icon: "SOLO",
      audiences: ["freelancer", "career", "creator"],
      goals: ["business", "brand", "money"],
      keywords: "freelancer consulting solo self employed portfolio invoice pricing brand website clients",
      summary: "Combine OFO stores into a practical solo-business stack: identity, portfolio site, pricing, invoices, and client acquisition.",
      outcome: "A credible public presence and basic operating toolkit.",
      steps: ["Create your brand and portfolio", "Set pricing and invoice templates", "Plan a repeatable client pipeline"],
      primary: { label: "Start with your website", url: "https://freewebstore.online" },
      secondary: [
        { label: "Brand tools", url: "https://freedesignstore.pages.dev" },
        { label: "Finance tools", url: "https://freefinancestore.pages.dev" },
        { label: "Marketing tools", url: "https://freemarketingstore.pages.dev" }
      ],
      status: "Available now"
    },
    {
      id: "nonprofit-kit",
      title: "Give a community project a public home",
      icon: "COMM",
      audiences: ["nonprofit", "educator", "business"],
      goals: ["website", "community", "marketing"],
      keywords: "nonprofit charity community club association volunteer event campaign website outreach",
      summary: "Use Web, Design, and Marketing stores to explain the mission, publish activities, recruit volunteers, and create outreach material.",
      outcome: "A coherent public presence without purchasing a large software suite.",
      steps: ["Publish the mission and contact path", "Create reusable visual material", "Plan outreach and volunteer communication"],
      primary: { label: "Build the public site", url: "https://freewebstore.online" },
      secondary: [
        { label: "Design outreach assets", url: "https://freedesignstore.pages.dev" },
        { label: "Plan campaigns", url: "https://freemarketingstore.pages.dev" }
      ],
      status: "Available now"
    },
    {
      id: "three-d",
      title: "Inspect, repair, or create 3D assets",
      icon: "3D",
      audiences: ["creator", "developer", "student", "career", "curious"],
      goals: ["3d", "design", "build"],
      keywords: "3d model mesh gltf stl usdz texture normal map animation scene material viewer",
      summary: "Free3DStore includes model viewing, editing, conversion, optimization, repair, materials, textures, animation, measurement, and rendering utilities.",
      outcome: "A browser-based 3D workflow for learning, prototyping, and preparing assets.",
      steps: ["Inspect or create the model", "Repair and optimize geometry", "Prepare materials, animation, and export"],
      primary: { label: "Open Free3DStore", url: "https://free3dstore.pages.dev" },
      secondary: [{ label: "General design tools", url: "https://freedesignstore.pages.dev" }],
      status: "Live"
    },
    {
      id: "peer-to-peer",
      title: "Learn decentralized browser systems",
      icon: "P2P",
      audiences: ["developer", "student", "researcher", "curious"],
      goals: ["network", "learn", "build"],
      keywords: "p2p peer to peer webrtc crdt bittorrent dht gossip nat distributed decentralized",
      summary: "FreePeerStore demonstrates WebRTC chat and video, file sharing, CRDT collaboration, DHTs, gossip, BitTorrent, and NAT traversal.",
      outcome: "Practical intuition for distributed and peer-to-peer protocols.",
      steps: ["Start with direct peer communication", "Explore distributed state or discovery", "Build or explain a small P2P application"],
      primary: { label: "Open FreePeerStore", url: "https://freepeerstore.pages.dev" },
      secondary: [{ label: "Related crypto systems", url: "https://freecryptostore.pages.dev" }],
      status: "Beta"
    },
    {
      id: "games",
      title: "Play or build a browser game",
      icon: "GAME",
      audiences: ["student", "developer", "creator", "curious", "retired"],
      goals: ["game", "play", "build"],
      keywords: "game play build game browser canvas 3d puzzle chess multiplayer leaderboard",
      summary: "FreeGameStore offers a large browser-game catalog plus templates and publishing infrastructure for creators.",
      outcome: "Immediate play or an open-source route to publishing your own game.",
      steps: ["Play examples in the target genre", "Choose a template and build one mechanic", "Test viewports and publish"],
      primary: { label: "Open FreeGameStore", url: "https://freegamestore.online" },
      secondary: [{ label: "App creation platform", url: "https://freeappstore.online" }],
      status: "Post-beta"
    },
    {
      id: "lifelong-learning",
      title: "Explore something new at your own pace",
      icon: "OPEN",
      audiences: ["retired", "curious", "household"],
      goals: ["learn", "read", "create"],
      keywords: "retired lifelong learning hobby curious explore read classics learn science creative",
      summary: "Mix public-domain books, writing, music, games, and interactive science stores without enrolling in a course.",
      outcome: "A self-directed path from curiosity to a small creation or explanation.",
      steps: ["Pick one subject that feels surprising", "Interact rather than only reading", "Write, build, or share what you understood"],
      primary: { label: "Browse all OFO stores", url: "/" },
      secondary: [
        { label: "Read free classics", url: "https://freebookstore.pages.dev" },
        { label: "Explore simulations", url: "/#learn" }
      ],
      status: "Available now"
    }
  ];

  const goalsByAudience = {
    student: ["learn", "portfolio", "volunteer", "write", "build", "career"],
    educator: ["teach", "classroom", "learn", "community"],
    business: ["website", "brand", "marketing", "customers", "money", "ai"],
    freelancer: ["website", "brand", "customers", "money", "portfolio", "write"],
    creator: ["design", "write", "book", "music", "website", "marketing", "3d"],
    developer: ["build", "app", "code", "ai", "data", "network", "hardware"],
    career: ["portfolio", "volunteer", "learn", "website", "build", "career"],
    researcher: ["data", "research", "learn", "ai", "hardware", "network"],
    nonprofit: ["website", "community", "brand", "marketing"],
    household: ["money", "write", "learn", "productivity"],
    retired: ["learn", "read", "write", "music", "money", "create"],
    curious: ["learn", "ai", "game", "space", "robotics", "quantum"]
  };

  const goalLabels = {
    ai: "Use AI",
    app: "Build an app",
    biology: "Explore biology",
    book: "Publish a book",
    brand: "Create a brand",
    build: "Build something",
    career: "Change careers",
    classroom: "Plan a lesson",
    code: "Solve a coding task",
    community: "Support a community",
    create: "Make something",
    customers: "Find customers",
    data: "Work with data",
    design: "Create visuals",
    game: "Play or build games",
    hardware: "Learn hardware",
    learn: "Learn a subject",
    marketing: "Plan marketing",
    money: "Plan finances",
    music: "Make music",
    network: "Explore P2P systems",
    portfolio: "Build a portfolio",
    productivity: "Solve a practical task",
    quantum: "Explore quantum",
    read: "Read and explore",
    research: "Research a system",
    robotics: "Explore robotics",
    space: "Explore space",
    teach: "Teach a subject",
    volunteer: "Get volunteer experience",
    website: "Make a website",
    write: "Write better",
    "3d": "Work with 3D"
  };

  const state = { audience: "", goal: "", query: "" };
  const audienceRoot = document.querySelector("#audience-choices");
  const goalRoot = document.querySelector("#goal-choices");
  const goalStep = document.querySelector("#goal-step");
  const results = document.querySelector("#path-results");
  const routeGrid = document.querySelector("#route-grid");
  const summary = document.querySelector("#results-summary");
  const search = document.querySelector("#path-search");
  const progress = document.querySelector(".path-progress");

  if (!audienceRoot || !goalRoot || !results || !routeGrid || !search) return;

  const button = (item, type) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = type === "audience" ? "choice-card" : "goal-chip";
    el.dataset.value = item.id;
    el.setAttribute("aria-pressed", "false");
    if (type === "audience") {
      el.innerHTML = `<span class="choice-icon">${item.icon}</span><strong>${item.label}</strong><small>${item.note}</small>`;
    } else {
      el.textContent = item.label;
    }
    return el;
  };

  audiences.forEach((audience) => audienceRoot.append(button(audience, "audience")));

  const setPressed = (root, value) => {
    root.querySelectorAll("button").forEach((el) => {
      el.setAttribute("aria-pressed", String(el.dataset.value === value));
    });
  };

  const renderGoals = () => {
    goalRoot.replaceChildren();
    (goalsByAudience[state.audience] || []).forEach((id) => {
      const el = button({ id, label: goalLabels[id] || id }, "goal");
      goalRoot.append(el);
    });
    goalStep.hidden = false;
    progress.querySelectorAll("span")[1].classList.add("active");
  };

  const queryStopWords = new Set([
    "and", "are", "build", "create", "explore", "for", "get", "help", "learn", "looking",
    "make", "need", "our", "the", "tools", "use", "want", "with", "your"
  ]);
  const tokens = (value) => value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 1 && !queryStopWords.has(part));

  const queryMatch = (route) => {
    const queryTokens = tokens(state.query);
    if (!queryTokens.length) return { matches: 0, score: 0 };
    const haystack = `${route.title} ${route.summary} ${route.keywords} ${route.goals.join(" ")}`.toLowerCase();
    const matched = queryTokens.filter((token) => haystack.includes(token));
    const required = Math.max(1, Math.ceil(queryTokens.length / 2));
    return {
      matches: matched.length >= required ? matched.length : 0,
      score: matched.reduce((total, token) => total + (token.length > 5 ? 5 : 3), 0)
    };
  };

  const scoreRoute = (route) => {
    let score = 0;
    if (state.audience && route.audiences.includes(state.audience)) score += 8;
    if (state.goal && route.goals.includes(state.goal)) score += 10;
    if (state.query) score += queryMatch(route).score;
    return score;
  };

  const routeCard = (route, index, score) => {
    const article = document.createElement("article");
    article.className = "route-card";
    const links = route.secondary.map((link) => `<a href="${link.url}">${link.label}</a>`).join("");
    const caveat = route.caveat ? `<p class="route-caveat"><strong>Know this:</strong> ${route.caveat}</p>` : "";
    article.innerHTML = `
      <div class="route-rank">${index + 1}</div>
      <div class="route-top">
        <span class="route-icon">${route.icon}</span>
        <div><span class="route-status">${route.status}</span><h3>${route.title}</h3></div>
        <span class="fit-score">${score >= 18 ? "Best fit" : score >= 10 ? "Strong fit" : "Worth exploring"}</span>
      </div>
      <p>${route.summary}</p>
      <div class="route-outcome"><strong>What you can leave with</strong><span>${route.outcome}</span></div>
      <ol>${route.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      ${caveat}
      <div class="route-actions"><a class="button primary" href="${route.primary.url}">${route.primary.label}</a>${links}</div>
    `;
    return article;
  };

  const renderResults = (forceAll = false) => {
    const ranked = routes
      .map((route) => ({ route, score: scoreRoute(route) }))
      .filter((entry) => {
        if (forceAll) return true;
        if (state.goal) return entry.route.goals.includes(state.goal);
        if (state.query) return queryMatch(entry.route).matches > 0;
        if (state.audience) return entry.route.audiences.includes(state.audience);
        return false;
      })
      .sort((a, b) => b.score - a.score || a.route.title.localeCompare(b.route.title));
    const hasExactMatches = ranked.length > 0;
    const fallbackIds = ["lifelong-learning", "developer-tools", "business-website", "career-portfolio"];
    const fallback = fallbackIds.map((id) => ({
      route: routes.find((route) => route.id === id),
      score: 0,
    }));
    const selected = (hasExactMatches ? ranked : fallback).slice(0, 4);
    routeGrid.replaceChildren();
    selected.forEach(({ route, score }, index) => routeGrid.append(routeCard(route, index, score)));
    const audience = audiences.find((item) => item.id === state.audience);
    const pieces = [];
    if (audience) pieces.push(`for “${audience.label}”`);
    if (state.goal) pieces.push(`focused on “${goalLabels[state.goal] || state.goal}”`);
    if (state.query) pieces.push(`matching “${state.query}”`);
    summary.textContent = hasExactMatches
      ? `These are the strongest supported OFO routes ${pieces.join(" ")}. Start with the first, then use the companion links if your project grows.`
      : "OFO does not have an exact supported match for that request yet. These broad starting points can help you explore what is available without overstating the fit.";
    results.hidden = false;
    progress.querySelectorAll("span")[2].classList.add("active");
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  audienceRoot.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    state.audience = target.dataset.value;
    state.goal = "";
    setPressed(audienceRoot, state.audience);
    renderGoals();
  });

  goalRoot.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    state.goal = target.dataset.value;
    setPressed(goalRoot, state.goal);
    renderResults();
  });

  document.querySelector("#path-search-button").addEventListener("click", () => {
    state.query = search.value.trim();
    if (state.query) {
      state.goal = "";
      setPressed(goalRoot, "");
      renderResults();
    }
    else search.focus();
  });

  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector("#path-search-button").click();
    }
  });

  document.querySelector("#surprise-button").addEventListener("click", () => {
    const route = routes[Math.floor(Math.random() * routes.length)];
    state.audience = "";
    state.goal = "";
    state.query = route.title;
    search.value = route.title;
    renderResults();
  });

  document.querySelector("#reset-path").addEventListener("click", () => {
    state.audience = "";
    state.goal = "";
    state.query = "";
    search.value = "";
    setPressed(audienceRoot, "");
    goalRoot.replaceChildren();
    goalStep.hidden = true;
    results.hidden = true;
    progress.querySelectorAll("span").forEach((item, index) => item.classList.toggle("active", index === 0));
    document.querySelector("#pathfinder-title").scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
