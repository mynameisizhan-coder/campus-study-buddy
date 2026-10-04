// Campus Study Buddy - front end logic.
// Sends the question to API Gateway and shows the answer + sources.

// Your API Gateway endpoint (Phase 5). Change this if you rebuild the API.
const API_URL = "https://8lqn5fo1gb.execute-api.us-east-1.amazonaws.com/ask";

const form = document.getElementById("ask-form");
const questionBox = document.getElementById("question");
const askButton = document.getElementById("ask-button");
const samples = document.getElementById("samples");
const result = document.getElementById("result");
const resultQuestion = document.getElementById("result-question");
const answerBox = document.getElementById("answer");
const sourcesList = document.getElementById("sources");
const sourcesHeading = document.getElementById("sources-heading");
const otherSources = document.getElementById("other-sources");
const otherSummary = document.getElementById("other-summary");
const otherList = document.getElementById("other-list");
const statusLine = document.getElementById("status");

// Turn untrusted text into safe HTML (prevents injected <script> tags).
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Format the model's answer: paragraphs, "- " bullet lists, **bold**,
// and [1]-style citations as clickable highlighter marks.
function formatAnswer(text) {
  const lines = escapeHtml(text).split("\n");
  let html = "";
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    const isBullet = /^[-*•]\s+/.test(line);
    if (isBullet && !inList) { html += "<ul>"; inList = true; }
    if (!isBullet && inList) { html += "</ul>"; inList = false; }
    if (!line) continue;
    const content = isBullet ? line.replace(/^[-*•]\s+/, "") : line;
    html += isBullet ? `<li>${content}</li>` : `<p>${content}</p>`;
  }
  if (inList) html += "</ul>";

  return html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(\d+)\]/g, '<button type="button" class="cite" data-source="$1" aria-label="Show source $1">$1</button>');
}

// The parser describes images with tags like <analysis> or <title>; hide them.
function cleanExcerpt(text) {
  return text.replace(/<\/?[a-z_]+>/gi, " ").replace(/\s+/g, " ").trim();
}

function makeSourceItem(source) {
  const item = document.createElement("li");
  item.id = `source-${source.id}`;
  const page = source.page ? `, page ${source.page}` : "";
  item.innerHTML = `
    <span class="source-num">${source.id}</span>
    <span class="source-file">${escapeHtml(source.file)}<span class="source-page">${page}</span></span>
    <p class="source-excerpt">${escapeHtml(cleanExcerpt(source.excerpt).slice(0, 180))}…</p>`;
  return item;
}

// Cited sources are listed first; the other passages the search found
// are tucked under "Show other passages" so they don't distract.
function showSources(sources, answerText) {
  const cited = new Set([...answerText.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  sourcesList.innerHTML = "";
  otherList.innerHTML = "";
  for (const source of sources) {
    const target = cited.has(source.id) ? sourcesList : otherList;
    target.appendChild(makeSourceItem(source));
  }
  // No citations (e.g. "I couldn't find that"): hide the sources heading.
  sourcesHeading.hidden = cited.size === 0;
  const otherCount = otherList.children.length;
  otherSources.hidden = otherCount === 0;
  otherSources.open = false;
  otherSummary.textContent = `Show ${otherCount} other passage${otherCount === 1 ? "" : "s"} the search found`;
}

// Clicking a citation scrolls to its source and highlights it briefly.
answerBox.addEventListener("click", (event) => {
  const cite = event.target.closest(".cite");
  if (!cite) return;
  const item = document.getElementById(`source-${cite.dataset.source}`);
  if (!item) return;
  item.scrollIntoView({ behavior: "smooth", block: "center" });
  item.classList.add("is-highlighted");
  setTimeout(() => item.classList.remove("is-highlighted"), 2000);
});

async function ask(question) {
  askButton.disabled = true;
  askButton.textContent = "Asking…";
  statusLine.className = "status";
  statusLine.textContent = "Searching your notes…";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();

    if (response.status === 429) {
      throw new Error("Too many questions at once. Wait a few seconds and ask again.");
    }
    if (!response.ok) {
      throw new Error(data.error || data.message || `The server returned ${response.status}.`);
    }

    resultQuestion.textContent = question;
    answerBox.innerHTML = formatAnswer(data.answer);
    showSources(data.sources || [], data.answer);
    result.hidden = false;
    samples.hidden = true;
    statusLine.textContent = "";
  } catch (error) {
    statusLine.className = "status is-error";
    statusLine.textContent = error instanceof TypeError
      ? "Couldn't reach the server. Check your internet connection and try again."
      : error.message;
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Ask";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = questionBox.value.trim();
  if (question) ask(question);
});

// Enter sends the question; Shift+Enter adds a new line.
questionBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

// Sample question buttons fill the box and ask straight away.
samples.addEventListener("click", (event) => {
  const button = event.target.closest(".sample");
  if (!button) return;
  questionBox.value = button.textContent;
  ask(button.textContent);
});
