from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class GitHubPagesLikeHandler(SimpleHTTPRequestHandler):
    """Serve 404.html for missing files, matching GitHub Pages behavior."""

    def send_error(self, code: int, message: str | None = None, explain: str | None = None) -> None:
        if code == 404:
            web_root = Path(getattr(self, "directory", "."))
            custom_404 = web_root / "404.html"

            if custom_404.exists():
                body = custom_404.read_bytes()
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(body)
                return

        super().send_error(code, message, explain)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Serve this repo locally with GitHub Pages-like 404 handling."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to. Default: 127.0.0.1")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to. Default: 8000")
    parser.add_argument(
        "--dir",
        default=".",
        help="Directory to serve. Default: current working directory",
    )
    args = parser.parse_args()

    handler_cls = partial(GitHubPagesLikeHandler, directory=args.dir)
    server = ThreadingHTTPServer((args.host, args.port), handler_cls)

    print(f"Serving on http://{args.host}:{args.port} (root: {Path(args.dir).resolve()})")
    server.serve_forever()


if __name__ == "__main__":
    main()
