const rightbar = document.getElementById("rightbar");

async function init() {
  if (!rightbar) return;

  try {
    const response = await fetch("./components/rightbar.html");
    if (!response.ok) throw new Error("HTTP " + response.status);
    rightbar.innerHTML = await response.text();
  } catch (error) {
    console.error("Rightbar load failed:", error);
    rightbar.innerHTML = "";
  }

  buildToc();
}

function buildToc() {
  // Only h2 inside <main>, ignore rightbar's own headings
  const headings = document.querySelectorAll("main section > h2");

  if (headings.length === 0) {
    rightbar.hidden = true;
    return;
  }

  rightbar.hidden = false;

  let list = document.getElementById("rb-list");
  if (!list) {
    // No rightbar.html loaded — build a minimal TOC
    if (!rightbar.querySelector(".rb-title")) {
      const title = document.createElement("p");
      title.className = "rb-title";
      title.textContent = "On this page";
      rightbar.prepend(title);
    }
    list = document.createElement("ul");
    list.id = "rb-list";
    rightbar.prepend(list);
  }

  list.innerHTML = "";
  const links = new Map();

  headings.forEach((heading, i) => {
    if (!heading.id) heading.id = "section-" + (i + 1);

    const link = document.createElement("a");
    link.href = "#" + heading.id;
    // Strip "Chapter N" prefix from display text
    link.textContent = heading.textContent.trim().replace(/^Chapter\s+\d+\s*/i, "");

    const item = document.createElement("li");
    item.appendChild(link);
    list.appendChild(item);
    links.set(heading.id, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove("active"));
        const active = links.get(entry.target.id);
        if (active) active.classList.add("active");
      });
    },
    { rootMargin: "0px 0px -70% 0px", threshold: 0 }
  );

  headings.forEach((h) => observer.observe(h));
}

init();