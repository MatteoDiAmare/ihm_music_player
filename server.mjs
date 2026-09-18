import { createServer } from 'node:http';
import { readFile, readdir, mkdir, writeFile, appendFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { extname, basename, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const musicDirectory = join(root, 'music');
const uploadDirectory = join(root, 'data', 'uploads');
const eventsFile = join(root, 'data', 'events.jsonl');
const publicDirectory = join(root, 'public');
const maxMp3Bytes = 20 * 1024 * 1024;
const port = Number(process.env.PORT || 3000);

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

function trackId(source, filename) {
  return createHash('sha256').update(`${source}/${filename}`).digest('hex').slice(0, 16);
}

function titleFromFilename(filename, uploaded) {
  return basename(uploaded ? filename.replace(/^[a-f0-9-]{36}-/, '') : filename, '.mp3').replace(/[_-]+/g, ' ');
}

async function catalog() {
  const tracks = [];
  for (const [source, directory] of [['music', musicDirectory], ['uploads', uploadDirectory]]) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isFile() || extname(entry.name).toLowerCase() !== '.mp3') continue;
      const id = trackId(source, entry.name);
      tracks.push({
        id,
        title: titleFromFilename(entry.name, source === 'uploads'),
        artist: source === 'uploads' ? 'Min musik' : 'Musikbiblioteket',
        audioUrl: `/api/tracks/${id}/audio`,
        source
      });
    }
  }
  return tracks.sort((a, b) => a.title.localeCompare(b.title, 'sv'));
}

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error('Filen är för stor');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function looksLikeMp3(bytes) {
  return bytes.length >= 4 && (
    bytes.subarray(0, 3).toString('ascii') === 'ID3' ||
    (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0 && (bytes[1] & 0x06) !== 0)
  );
}

async function serveTrack(req, res, id) {
  const track = (await catalog()).find(item => item.id === id);
  if (!track) return json(res, 404, { error: 'Låten hittades inte' });
  const directory = track.source === 'music' ? musicDirectory : uploadDirectory;
  const filenames = await readdir(directory);
  const filename = filenames.find(name => trackId(track.source, name) === id);
  if (!filename) return json(res, 404, { error: 'Låten hittades inte' });
  const bytes = await readFile(join(directory, filename));
  const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (req.headers.range && !match) {
    res.writeHead(416, { 'Content-Range': `bytes */${bytes.length}` });
    return res.end();
  }
  let start = 0, end = bytes.length - 1;
  if (match) {
    if (!match[1] && !match[2]) return json(res, 416, { error: 'Ogiltigt intervall' });
    if (!match[1]) start = Math.max(0, bytes.length - Number(match[2]));
    else start = Number(match[1]);
    if (match[1] && match[2]) end = Math.min(end, Number(match[2]));
    if (start > end || start >= bytes.length) {
      res.writeHead(416, { 'Content-Range': `bytes */${bytes.length}` });
      return res.end();
    }
  }
  res.writeHead(match ? 206 : 200, {
    'Content-Type': 'audio/mpeg',
    'Content-Length': end - start + 1,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
    ...(match ? { 'Content-Range': `bytes ${start}-${end}/${bytes.length}` } : {})
  });
  res.end(bytes.subarray(start, end + 1));
}

async function servePublic(res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filename = resolve(publicDirectory, `.${decodeURIComponent(requested)}`);
  if (!filename.startsWith(publicDirectory + sep)) return json(res, 403, { error: 'Ogiltig sökväg' });
  const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[extname(filename)];
  if (!type) return json(res, 404, { error: 'Sidan hittades inte' });
  try {
    const bytes = await readFile(filename);
    res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
    res.end(bytes);
  } catch (error) {
    if (error.code === 'ENOENT') return json(res, 404, { error: 'Klienten är inte byggd än. Se SERVER_API.md.' });
    throw error;
  }
}

await mkdir(musicDirectory, { recursive: true });
await mkdir(uploadDirectory, { recursive: true });

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/api/health')
      return json(res, 200, { status: 'ok', tracks: (await catalog()).length });

    if (req.method === 'GET' && url.pathname === '/api/tracks')
      return json(res, 200, await catalog());

    if (req.method === 'POST' && url.pathname === '/api/tracks') {
      const original = basename(String(req.headers['x-filename'] || ''));
      if (!original || extname(original).toLowerCase() !== '.mp3')
        return json(res, 400, { error: 'Ange ett .mp3-filnamn i headern X-Filename' });
      if (Number(req.headers['content-length']) > maxMp3Bytes)
        return json(res, 413, { error: 'Max 20 MB per fil' });
      const bytes = await readBody(req, maxMp3Bytes);
      if (!looksLikeMp3(bytes)) return json(res, 415, { error: 'Filen ser inte ut att vara en MP3' });
      const safeName = original.replace(/[^a-zA-Z0-9åäöÅÄÖ._ -]/g, '_').slice(0, 100);
      const filename = `${randomUUID()}-${safeName}`;
      await writeFile(join(uploadDirectory, filename), bytes, { flag: 'wx' });
      const id = trackId('uploads', filename);
      return json(res, 201, { id, title: titleFromFilename(filename, true), artist: 'Min musik', audioUrl: `/api/tracks/${id}/audio`, source: 'uploads' });
    }

    const audioMatch = /^\/api\/tracks\/([a-f0-9]{16})\/audio$/.exec(url.pathname);
    if (req.method === 'GET' && audioMatch) return serveTrack(req, res, audioMatch[1]);

    if (req.method === 'POST' && url.pathname === '/api/events') {
      const event = JSON.parse((await readBody(req, 2048)).toString('utf8'));
      if (event.type !== 'play' || !(await catalog()).some(track => track.id === event.trackId))
        return json(res, 400, { error: 'Eventet behöver type: play och ett giltigt trackId' });
      const record = {
        type: 'play', trackId: event.trackId,
        visitorId: String(event.visitorId || '').slice(0, 80),
        at: new Date().toISOString()
      };
      await appendFile(eventsFile, JSON.stringify(record) + '\n');
      return json(res, 201, { received: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/events') {
      const lines = await readFile(eventsFile, 'utf8').catch(error => {
        if (error.code === 'ENOENT') return '';
        throw error;
      });
      return json(res, 200, lines.trim().split('\n').filter(Boolean).slice(-30).map(JSON.parse));
    }

    if (req.method === 'GET' && !url.pathname.startsWith('/api/')) return servePublic(res, url.pathname);
    return json(res, 404, { error: 'Okänd adress' });
  } catch (error) {
    console.error(error);
    return json(res, error.status || 400, { error: error instanceof SyntaxError ? 'Ogiltig JSON' : 'Begäran kunde inte behandlas' });
  }
}).listen(port, '0.0.0.0', () => console.log(`Music API listening on http://localhost:${port}`));
