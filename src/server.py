import http.server
import socketserver
import webbrowser
import os
import threading
import time

PORT = 8000
FOLDER = os.path.dirname(os.path.abspath(__file__))

# ---- File watcher ----
last_mtime = 0
def watch_files():
    global last_mtime
    while True:
        latest = 0
        for root, _, files in os.walk(FOLDER):
            for f in files:
                if f.endswith((".html", ".css", ".js")):
                    p = os.path.join(root, f)
                    latest = max(latest, os.path.getmtime(p))
        last_mtime = latest
        time.sleep(0.5)

# ---- HTML me inject karne wala script ----
RELOAD_SNIPPET = b"""
<script>
(function() {
  let last = 0;
  setInterval(async () => {
    try {
      const r = await fetch('/__mtime');
      const t = await r.text();
      if (last && last !== t) location.reload();
      last = t;
    } catch(e) {}
  }, 800);
})();
</script>
</body>
"""

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FOLDER, **kwargs)

    def do_GET(self):
        if self.path == "/__mtime":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(str(last_mtime).encode())
            return

        if self.path.endswith(".html") or self.path == "/":
            path = self.translate_path(self.path)
            if os.path.isdir(path):
                path = os.path.join(path, "index.html")
            try:
                with open(path, "rb") as f:
                    content = f.read()
                content = content.replace(b"</body>", RELOAD_SNIPPET, 1)
                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return
            except FileNotFoundError:
                pass

        super().do_GET()

def open_browser():
    webbrowser.open(f"http://localhost:{PORT}/index.html")

if __name__ == "__main__":
    os.chdir(FOLDER)
    threading.Thread(target=watch_files, daemon=True).start()
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"✅ Server: http://localhost:{PORT}")
        threading.Timer(1.0, open_browser).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n⏹️ Band.")