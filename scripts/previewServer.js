const fs = require('fs');
const http = require('http');
const path = require('path');

require('dotenv').config();

const baseDir = path.resolve(__dirname, '../public');
const requestedPort = Number(process.env.PREVIEW_PORT || 4173);
const maxPortAttempts = 10;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function resolveFilePath(requestUrl) {
  const pathname = (requestUrl || '/').split('?')[0];
  let safePath = pathname.replace(/\.\./g, '');

  if (safePath === '/') {
    safePath = '/index.html';
  } else if (!path.extname(safePath)) {
    safePath = `${safePath.replace(/\/?$/, '')}/index.html`;
  }

  return path.join(baseDir, safePath);
}

function handleRequest(request, response) {
  const filePath = resolveFilePath(request.url || '/');

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.statusCode = 404;
      response.end('Not found');
      return;
    }

    response.setHeader(
      'Content-Type',
      contentTypes[path.extname(filePath)] || 'application/octet-stream'
    );
    response.end(data);
  });
}

function listenOnPort(port, attempts = 0) {
  const server = http.createServer(handleRequest);

  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && attempts < maxPortAttempts) {
      listenOnPort(port + 1, attempts + 1);
      return;
    }

    throw error;
  });

  server.listen(port, () => {
    const suffix = port === requestedPort ? '' : ` (fallback from ${requestedPort})`;
    console.log(`Preview server running at http://localhost:${port}${suffix}`);
  });
}

listenOnPort(requestedPort);
