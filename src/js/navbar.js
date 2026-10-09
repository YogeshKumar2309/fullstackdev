fetch("./components/navbar.html")
  .then((response) => {
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.text();
  })
  .then((html) => {
    document.getElementById("navbar").innerHTML = html;
    setActiveLink();
  })
  .catch((error) => console.error("Navbar load failed:", error));

function setActiveLink() {
  let current = location.pathname;
  if (current.endsWith("/")) current += "index.html";

  document.querySelectorAll("#navbar nav a").forEach((link) => {
    if (new URL(link.href).pathname === current) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}