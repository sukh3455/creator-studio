import http.server

PORT = 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        self.send_header("Connection", "close")
        super().end_headers()

class ThreadedServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    server_address = ("127.0.0.1", PORT)
    httpd = ThreadedServer(server_address, Handler)
    print(f"Serving at 127.0.0.1:{PORT} with Connection: close and COOP/COEP")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
