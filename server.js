const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const STATIC_DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function getLocalIPs() {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = path.join(STATIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

  // Security
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch {
    // SPA fallback: serve index.html for unknown paths
    try {
      const html = fs.readFileSync(path.join(STATIC_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('  🍳  家庭菜单 (本地开发服务器)');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('  💻 本机: http://localhost:' + PORT);
  console.log('');
  const ips = getLocalIPs();
  if (ips.length > 0) {
    console.log('  📱 局域网:');
    ips.forEach(ip => console.log('     http://' + ip + ':' + PORT));
    console.log('');
  }
  console.log('  🌐 生产环境: 部署到 GitHub Pages');
  console.log('  🛑 Ctrl+C 停止');
  console.log('═══════════════════════════════════════');
});
