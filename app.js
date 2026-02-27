const DOCS = [
  { slug: "consensus", file: "consensus.md", title: "MWEB Consensus" },
  { slug: "serialization", file: "serialization.md", title: "MWEB Serialization" },
  { slug: "kernels", file: "kernels.md", title: "Kernels" },
  { slug: "stealth-addresses", file: "stealth-addresses.md", title: "Stealth Addresses" },
  { slug: "weight", file: "weight.md", title: "MWEB Weights & Sizes" }
];
const DOCS_DIR = "docs";
const THEME_KEY = "mweb-docs-theme";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";

const docList = document.getElementById("doc-list");
const docContent = document.getElementById("doc-content");
const pager = document.getElementById("pager");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleText = document.getElementById("theme-toggle-text");
const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false
});

function currentSlug() {
  const value = window.location.hash.replace(/^#\/?/, "").trim();
  return value || DOCS[0].slug;
}

function findDocBySlug(slug) {
  return DOCS.find((doc) => doc.slug === slug) || DOCS[0];
}

function storedTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === THEME_LIGHT || value === THEME_DARK ? value : null;
  } catch (_error) {
    return null;
  }
}

function resolvedTheme() {
  const saved = storedTheme();
  if (saved) {
    return saved;
  }
  return themeMediaQuery.matches ? THEME_DARK : THEME_LIGHT;
}

function updateThemeButton(theme) {
  if (!themeToggle) {
    return;
  }

  const nextTheme = theme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
  themeToggle.setAttribute("aria-pressed", String(theme === THEME_DARK));
  if (themeToggleText) {
    themeToggleText.textContent = `Switch to ${nextTheme} theme`;
  }
}

function applyTheme(theme, persist = false) {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeButton(theme);

  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_error) {
      // Ignore write failures (private mode / policy).
    }
  }
}

function closeSidebar() {
  sidebar.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function renderNav(activeSlug) {
  docList.innerHTML = DOCS.map((doc) => {
    const current = doc.slug === activeSlug ? ' aria-current="page"' : "";
    return `<li><a href="#/${doc.slug}"${current}>${doc.title}</a></li>`;
  }).join("");
}

function renderPager(activeDoc) {
  const index = DOCS.findIndex((doc) => doc.slug === activeDoc.slug);
  const previous = index > 0 ? DOCS[index - 1] : null;
  const next = index < DOCS.length - 1 ? DOCS[index + 1] : null;

  const previousLink = previous
    ? `<a class="prev" href="#/${previous.slug}">&larr; ${previous.title}</a>`
    : "<span></span>";
  const nextLink = next
    ? `<a class="next" href="#/${next.slug}">${next.title} &rarr;</a>`
    : "<span></span>";

  pager.innerHTML = `${previousLink}${nextLink}`;
}

async function renderDoc() {
  const activeDoc = findDocBySlug(currentSlug());
  renderNav(activeDoc.slug);
  renderPager(activeDoc);
  docContent.innerHTML = '<p class="loading">Loading documentation...</p>';

  try {
    const response = await fetch(`./${DOCS_DIR}/${activeDoc.file}`, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Could not load "${activeDoc.file}" (${response.status}).`);
    }

    const rawMarkdown = await response.text();
    const html = marked.parse(rawMarkdown);
    docContent.innerHTML = html;
    document.title = `${activeDoc.title} | Litecoin MWEB Docs`;
  } catch (error) {
    docContent.innerHTML = `
      <p class="error">Failed to load this document.</p>
      <pre>${error.message}</pre>
    `;
  }
}

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  sidebar.classList.toggle("open");
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === THEME_DARK
      ? THEME_DARK
      : THEME_LIGHT;
    const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    applyTheme(next, true);
  });
}

if (typeof themeMediaQuery.addEventListener === "function") {
  themeMediaQuery.addEventListener("change", (event) => {
    if (storedTheme()) {
      return;
    }

    applyTheme(event.matches ? THEME_DARK : THEME_LIGHT);
  });
}

window.addEventListener("hashchange", () => {
  closeSidebar();
  renderDoc();
});

window.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (window.innerWidth <= 960 && target.closest(".doc-list a")) {
    closeSidebar();
  }
});

applyTheme(resolvedTheme());
renderDoc();
