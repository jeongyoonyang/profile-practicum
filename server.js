const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const publicDirectory = __dirname;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400);
    response.end("Bad Request");
    return;
  }

  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(publicDirectory, `.${requestedPath}`);
  if (filePath !== publicDirectory && !filePath.startsWith(`${publicDirectory}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT" || error.code === "EISDIR") {
        response.writeHead(404);
        response.end("Not Found");
        return;
      }

      console.error(`Failed to read ${filePath}:`, error);
      response.writeHead(500);
      response.end("Internal Server Error");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  });
});

server.on("error", (error) => {
  console.error("Server failed to start:", error);
  process.exitCode = 1;
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Profile website is available at http://localhost:3000");
});
