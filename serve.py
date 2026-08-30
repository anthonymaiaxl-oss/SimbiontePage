"""Servidor local do simbionte-lp. Só para olhar a página no PC.

Existe por DOIS motivos, os dois descobertos na marra:

1. O http.server padrão não conhece .avif/.woff2 e entrega como
   octet-stream.

2. **Ele não implementa HTTP Range.** Sem range o navegador reporta
   `video.seekable = [0, 0]` e o `currentTime` simplesmente não anda:
   o vídeo toca, mas não rebobina. Como o hero inteiro é rebobinar o
   vídeo pela rolagem, sem isto aqui não dá para testar nada.
   Hospedagem de verdade (Vercel, Netlify, nginx) já faz range sozinha.
"""
import functools
import http.server
import os
import re
import socketserver

PORT = 5622
ROOT = r"C:\dev\simbionte-lp"

http.server.SimpleHTTPRequestHandler.extensions_map.update({
    ".avif": "image/avif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".js": "text/javascript",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
})

RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)")


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # avisa o navegador que dá para pedir pedaço
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        rng = self.headers.get("Range")
        if not rng:
            return super().send_head()

        m = RANGE_RE.match(rng.strip())
        if not m:
            return super().send_head()

        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        size = os.fstat(f.fileno()).st_size
        ini, fim = m.group(1), m.group(2)
        if ini == "":                       # bytes=-500 -> últimos 500
            comeco = max(0, size - int(fim))
            final = size - 1
        else:
            comeco = int(ini)
            final = int(fim) if fim else size - 1
        final = min(final, size - 1)

        if comeco > final or comeco >= size:
            f.close()
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return None

        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {comeco}-{final}/{size}")
        self.send_header("Content-Length", str(final - comeco + 1))
        self.end_headers()
        f.seek(comeco)
        return _Pedaco(f, final - comeco + 1)


class _Pedaco:
    """Arquivo limitado a N bytes, para o copyfile parar na hora certa."""

    def __init__(self, f, restam):
        self.f, self.restam = f, restam

    def read(self, n=-1):
        if self.restam <= 0:
            return b""
        if n < 0 or n > self.restam:
            n = self.restam
        dados = self.f.read(n)
        self.restam -= len(dados)
        return dados

    def close(self):
        self.f.close()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    handler = functools.partial(Handler, directory=ROOT)
    with Server(("127.0.0.1", PORT), handler) as httpd:
        print(f"simbionte-lp em http://localhost:{PORT} (com HTTP Range)")
        httpd.serve_forever()
