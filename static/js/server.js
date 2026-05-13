const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const RECIPES_FILE = path.join(__dirname, 'recipes.json');
const PORT = 3000;


const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mpeg': 'audio/mpeg',
  '.mp3': 'audio/mpeg',
};

function readRecipes() {
  try {
    return JSON.parse(fs.readFileSync(RECIPES_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeRecipes(recipes) {
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS headers (for development)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API: GET /api/recipes
  if (req.method === 'GET' && pathname === '/api/recipes') {
    const recipes = readRecipes();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(recipes));
    return;
  }

  // ── API: GET /api/chefs 
  if (req.method === 'GET' && pathname === '/api/chefs') {
    try {
      const chefs = JSON.parse(fs.readFileSync(path.join(__dirname, 'chefs.json'), 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(chefs));
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
    }
    return;
  }

  // ── API: POST /api/recipes 
  if (req.method === 'POST' && pathname === '/api/recipes') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const recipe = JSON.parse(body);

        
        if (!recipe.name || !recipe.course) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'name and course are required' }));
          return;
        }

        // Generate ID if not provided
        if (!recipe.id) {
          recipe.id = 'RCP-' + Date.now();
        }

        const recipes = readRecipes();

        
        const existingIndex = recipes.findIndex(r => r.id === recipe.id);
        if (existingIndex !== -1) {
          recipes[existingIndex] = recipe;
        } else {
          recipes.push(recipe);
        }

        writeRecipes(recipes);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, recipe }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // ── API: DELETE /api/recipes/:id 
  if (req.method === 'DELETE' && pathname.startsWith('/api/recipes/')) {
    const id = pathname.replace('/api/recipes/', '');
    const recipes = readRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    writeRecipes(filtered);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // ── STATIC FILE SERVING 
  let filePath = path.join(__dirname, pathname === '/' ? 'homepage.html' : pathname);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`✅ FCAI-Sofra server running at http://localhost:${PORT}`);
  console.log(`   Recipes file: ${RECIPES_FILE}`);
});
