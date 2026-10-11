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
    return;
  }

  // Home page pe TOC nahi chahiye — sirf ads dikhao
  const tocTitle = rightbar.querySelector(".rb-title");
  const tocList = document.getElementById("rb-list");
  if (tocTitle) tocTitle.hidden = true;
  if (tocList) tocList.hidden = true;

  rightbar.hidden = false;
}

init();