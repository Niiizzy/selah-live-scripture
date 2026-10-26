const { app, BrowserWindow, session, shell, safeStorage } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = app.getAppPath();
let server;
let serverUrl;
const apiKeyFile = path.join(app.getPath('userData'), 'apibible-key.bin');
const apiEditionsFile = path.join(app.getPath('userData'), 'apibible-editions.json');

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm', '.md': 'text/markdown; charset=utf-8',
  '.ico': 'image/x-icon', '.png': 'image/png'
};


function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 20000) { reject(new Error('Request too large.')); req.destroy(); }
    });
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid request data.')); } });
    req.on('error', reject);
  });
}
function readStoredApiKey() {
  if (!fs.existsSync(apiKeyFile)) return '';
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure key storage is unavailable on this computer.');
  return safeStorage.decryptString(fs.readFileSync(apiKeyFile));
}
async function apiBibleRequest(endpoint, key) {
  const response = await fetch(`https://rest.api.bible/v1${endpoint}`, { headers: { 'api-key': key } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `API.Bible returned ${response.status}.`);
  return data;
}
function savedApiEditions() {
  try { return JSON.parse(fs.readFileSync(apiEditionsFile, 'utf8')); } catch { return {}; }
}
async function handleApiBible(req, res, pathname) {
  try {
    if (pathname === '/api/apibible/connect' && req.method === 'POST') {
      const { key } = await readJson(req);
      const apiKey = String(key || '').trim();
      if (apiKey.length < 8 || apiKey.length > 500) throw new Error('Enter the API key from your API.Bible account.');
      if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure key storage is unavailable on this computer.');
      const results = await Promise.all(['NLT', 'MSG'].map(async code => {
        try {
          const data = await apiBibleRequest(`/bibles?abbreviation=${code}&include-full-details=true`, apiKey);
          return (data.data || []).filter(b => String(b.abbreviation || b.abbreviationLocal || '').toUpperCase() === code || (code === 'MSG' && /the message/i.test(b.name || ''))).map(b => ({ code, id: b.id, name: b.name, copyright: b.copyright || '' }));
        } catch { return []; }
      }));
      const editions = Object.assign({}, ...results.flat().map(b => ({ [b.code]: b })));
      if (!Object.keys(editions).length) throw new Error('The key did not return licensed NLT or MSG editions. Check your API.Bible plan and selected Bible licenses.');
      fs.mkdirSync(path.dirname(apiKeyFile), { recursive: true });
      fs.writeFileSync(apiKeyFile, safeStorage.encryptString(apiKey));
      fs.writeFileSync(apiEditionsFile, JSON.stringify(editions), 'utf8');
      sendJson(res, 200, { editions });
      return;
    }
    if (pathname === '/api/apibible/editions' && req.method === 'GET') { sendJson(res, 200, { editions: savedApiEditions() }); return; }
    if (pathname === '/api/apibible/disconnect' && req.method === 'POST') {
      for (const file of [apiKeyFile, apiEditionsFile]) if (fs.existsSync(file)) fs.unlinkSync(file);
      sendJson(res, 200, { editions: {} });
      return;
    }
    if (pathname === '/api/apibible/search' && req.method === 'POST') {
      const { code, query } = await readJson(req);
      const edition = savedApiEditions()[String(code || '').toUpperCase()];
      const search = String(query || '').trim().slice(0, 240);
      if (!edition || !search) throw new Error('Connect an authorized edition and enter a passage or sermon phrase.');
      const key = readStoredApiKey();
      if (!key) throw new Error('Connect API.Bible in Bible Library first.');
      const result = await apiBibleRequest(`/bibles/${encodeURIComponent(edition.id)}/search?query=${encodeURIComponent(search)}&limit=3&sort=relevance`, key);
      sendJson(res, 200, { result, edition });
      return;
    }
    sendJson(res, 405, { error: 'Unsupported API.Bible request.' });
  } catch (error) { sendJson(res, 400, { error: error.message || 'API.Bible could not complete the request.' }); }
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      let pathname;
      try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
      catch { res.writeHead(400).end(); return; }
      if (pathname.startsWith('/api/apibible/')) { handleApiBible(req, res, pathname); return; }
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
      if (pathname === '/') pathname = '/index.html';
      const file = path.resolve(root, `.${pathname}`);
      const relative = path.relative(root, file);
      if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403).end(); return; }
      fs.stat(file, (err, stat) => {
        if (err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
        res.writeHead(200, {
          'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
          'Content-Length': stat.size, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache'
        });
        if (req.method === 'HEAD') { res.end(); return; }
        fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
      });
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      serverUrl = `http://127.0.0.1:${server.address().port}/`;
      resolve();
    });
  });
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 960, minWidth: 1050, minHeight: 720,
    show: false, autoHideMenuBar: true, backgroundColor: '#f7f8f6',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.setMenuBarVisibility(false);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url === `${serverUrl}projector.html`) {
      return { action: 'allow', overrideBrowserWindowOptions: {
        width: 1280, height: 800, autoHideMenuBar: true, backgroundColor: '#101923',
        webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
      } };
    }
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('did-create-window', child => {
    child.setMenuBarVisibility(false);
    child.on('page-title-updated', event => event.preventDefault());
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(serverUrl)) {
      event.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });
  win.loadURL(serverUrl);
  win.once('ready-to-show', () => win.show());
}

app.whenReady().then(async () => {
  app.setAppUserModelId('org.selah.live-scripture');
  session.defaultSession.setPermissionRequestHandler((_contents, permission, callback, details) => {
    callback((permission === 'media' && details?.mediaTypes?.includes('audio')) || permission === 'microphone');
  });
  session.defaultSession.setPermissionCheckHandler((_contents, permission, _origin, details) =>
    (permission === 'media' && details?.mediaTypes?.includes('audio')) || permission === 'microphone'
  );
  await startLocalServer();
  createMainWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createMainWindow(); });
}).catch(error => { console.error('Selah could not start:', error); app.quit(); });

app.on('before-quit', () => { if (server) server.close(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
