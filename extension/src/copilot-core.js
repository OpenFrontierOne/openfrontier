globalThis.OFO_COPILOT_CORE = (() => {
  function normalizeProfile(profile = {}) {
    return {
      goal: profile.goal || "No saved goal yet.",
      skillLevel: profile.skillLevel || "unknown",
      interests: profile.interests || "",
      communityVisible: Boolean(profile.communityVisible)
    };
  }

  function getHeadingsText(context = {}) {
    return context.headings?.length ? context.headings.join("; ") : "No headings captured.";
  }

  function buildCrashCoursePlan(context = {}, profile = {}) {
    const normalized = normalizeProfile(profile);
    const goal = normalized.goal === "No saved goal yet." ? "Learn the current topic" : normalized.goal;
    const store = context.store?.label || "the current OFO store";
    const topic = normalized.interests || context.store?.category || context.title || "this topic";

    return [
      `Crash course starter plan: ${goal}`,
      "",
      `Context: ${store}`,
      `Starting level: ${normalized.skillLevel}`,
      `Topic focus: ${topic}`,
      "",
      "1. Calibrate",
      "- Ask what the user already knows.",
      "- Identify vocabulary gaps.",
      "- Pick one concrete outcome for this session.",
      "",
      "2. Explain the core idea",
      `- Give a beginner-safe explanation tied to ${store}.`,
      "- Define 5-8 key terms.",
      "- Show one small example before using a tool.",
      "",
      "3. Practice in OFO",
      "- Open the most relevant simulation or tool.",
      "- Try one guided input.",
      "- Ask the user to predict the result before running it.",
      "",
      "4. Check understanding",
      "- Ask 3 short questions.",
      "- If the user misses one, explain that concept again with a simpler example.",
      "",
      "5. Connect",
      "- Recommend the relevant OFO community.",
      "- If profile visibility is not enabled, keep this as private recommendations only."
    ].join("\n");
  }

  function buildCommunityRecommendations(context = {}, profile = {}) {
    const normalized = normalizeProfile(profile);
    const store = context.store || {};
    const community = store.community || "OFO users";
    const category = store.category || "OFO";
    const visibility = normalized.communityVisible
      ? "Profile visibility: opted in for matching."
      : "Profile visibility: private. Show recommendations only; do not expose the user.";

    return [
      `Community recommendations for ${store.label || context.hostname || "OFO"}`,
      "",
      visibility,
      `Goal: ${normalized.goal}`,
      `Level: ${normalized.skillLevel}`,
      `Interests: ${normalized.interests || "Not specified"}`,
      "",
      "Recommended paths:",
      `- Join or browse the ${community} community for this store.`,
      `- Find peers working at a similar ${category} level.`,
      "- Find someone one level ahead for practical guidance.",
      "- Ask for a review only after removing private data from the prompt/context.",
      "- If contributor matching is enabled later, match by goal, topic, availability, and reputation.",
      "",
      "Consent rule:",
      normalized.communityVisible
        ? "- The user opted in locally; still require confirmation before posting, messaging, or exposing activity."
        : "- Keep this private. Do not post, message, or make the user discoverable."
    ].join("\n");
  }

  function buildPrompt(action, context = {}, profile = {}) {
    const normalized = normalizeProfile(profile);
    const headings = getHeadingsText(context);
    const communityVisibility = normalized.communityVisible
      ? "User opted into community matching for this local profile."
      : "User has not opted into profile visibility. Recommend communities only; do not expose the user or draft outbound messages as if consent exists.";

    if (!context.active) {
      return "OFO Copilot is inactive on this site. Open an OFO-owned store or platform first.";
    }

    if (action === "explain") {
      return [
        "Explain this OFO page to the user.",
        `User goal: ${normalized.goal}`,
        `User level: ${normalized.skillLevel}`,
        `User interests: ${normalized.interests || "No saved interests."}`,
        `Page: ${context.title}`,
        `URL: ${context.url}`,
        `Description: ${context.description || "None"}`,
        `Canonical: ${context.canonical || "None"}`,
        `Selected text: ${context.selectedText || "None"}`,
        `Headings: ${headings}`,
        "Answer with: what this is, why it matters, and the next useful action."
      ].join("\n");
    }

    if (action === "course") {
      return [
        buildCrashCoursePlan(context, normalized),
        "",
        "Prompt for AI expansion:",
        "Create a tailored crash course for the user.",
        `User goal: ${normalized.goal}`,
        `User level: ${normalized.skillLevel}`,
        `User interests: ${normalized.interests || "No saved interests."}`,
        `Current OFO context: ${context.title} (${context.url})`,
        "Include: calibration questions, beginner path, glossary, exercises, OFO tools to use, and progress checks."
      ].join("\n");
    }

    if (action === "communities") {
      return [
        buildCommunityRecommendations(context, normalized),
        "",
        "Prompt for AI expansion:",
        "Recommend OFO communities and people-matching paths.",
        `Visibility: ${communityVisibility}`,
        `Current OFO context: ${context.title} (${context.url})`,
        "Include: peer groups, mentors, contributors, reviewers, professionals, and what the user must opt into before being visible."
      ].join("\n");
    }

    return "Choose an action.";
  }

  function buildNextActions(context = {}, profile = {}) {
    const normalized = normalizeProfile(profile);
    const store = context.store?.label || "this OFO store";
    const goal = normalized.goal === "No saved goal yet." ? "set a concrete goal" : normalized.goal;

    return [
      `Next actions for ${store}`,
      "",
      `1. Clarify the goal: ${goal}`,
      "2. Use Explain this page to understand the current tool.",
      "3. Create a crash course if the topic is unfamiliar.",
      "4. Try one small action in the current OFO tool.",
      "5. Review the result, then ask for community recommendations if help or collaboration is useful."
    ].join("\n");
  }

  return {
    buildCommunityRecommendations,
    buildCrashCoursePlan,
    buildNextActions,
    buildPrompt,
    normalizeProfile
  };
})();
