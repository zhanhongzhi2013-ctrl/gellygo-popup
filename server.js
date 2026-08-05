/* ============================================================
   GellyGo Popup — Railway 托管服务
   ▸ GET  /popup.js            嵌入脚本(店铺加一行 <script>)
   ▸ GET  /api/config          当前生效配置(公开,CORS)
   ▸ POST /api/subscribe       订阅入库(公开,CORS)
   ▸ GET  /admin               管理后台(Basic Auth,密码=ADMIN_PASSWORD)
   ▸ GET/PUT /api/admin/config 读写全部配置
   ▸ GET  /api/admin/subscribers[.csv]  订阅数据 / 导出
   ▸ GET  /preview?t=<id>      单模板即时预览
   数据:有 DATABASE_URL 用 Postgres,否则内存+/tmp 文件(仅本地测试)
   ============================================================ */
'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const SHOP_DOMAIN = process.env.SHOP_DOMAIN || '';

/* ---------------- 默认配置(首次启动写入库) ---------------- */
const DEFAULT_COLORS = { bg: '#0d0d0d', ink: '#f2efe9', vis: '#c8ff00', visInk: '#0a0a0a', tag: '#0a0a0a', accent: '#0a0a0a', accent2: '#c8ff00', field: '#161616', fieldBd: '#3a3a3a', cta: '#c8ff00', ctaInk: '#0a0a0a' };
const DEFAULT_CONFIG = {
  settings: { activeTemplate: 'drop', delay: 4, exitIntent: true, frequencyDays: 7, collectPhone: true, shopDomain: SHOP_DOMAIN },
  templates: [
    { id: 'drop', name: '01 街头默认 Drop', tag: '// GELLYGO — DROP LIST', big: 'FIRST<br>DIBS.<br><em>10% OFF.</em>', kicker: 'JOIN THE UNIT', title: 'Early access to every drop', sub: 'Restock alerts, numbered drops before anyone else, and 10% off your first cop. Free shipping is already on us.', cta: 'UNLOCK 10% OFF', no: 'Nah, I pay full price', code: 'JOINTHEUNIT10', cd: false, cdEnd: '', deco: '01', colors: { ...DEFAULT_COLORS } },
    { id: 'hallo', name: '02 万圣节 Halloween', tag: '// NIGHT OPS — OCT 31', big: 'NIGHT<br>OPS<br><em>DROP.</em>', kicker: 'HALLOWEEN EXCLUSIVE', title: 'Trick, treat, 15% off', sub: 'Glow-in-the-dark gels, blackout colorways, one night only. Sign up for the Night Ops drop list before it vanishes.', cta: 'CLAIM THE TREAT', no: 'Too spooky for me', code: 'NIGHTOPS15', cd: false, cdEnd: '', deco: '🎃', colors: { bg: '#120a18', ink: '#f4ead9', vis: 'linear-gradient(160deg,#1a0f24,#2d1038)', visInk: '#ff7a1a', tag: '#b98aff', accent: '#b98aff', accent2: '#ff7a1a', field: '#1c1226', fieldBd: '#41305a', cta: '#ff7a1a', ctaInk: '#120a18' } },
    { id: 'bf', name: '03 黑五 Black Friday', tag: '// BLACKOUT — BFCM', big: 'BLACK<br>OUT<br><em>SALE.</em>', kicker: 'BLACK FRIDAY EARLY ACCESS', title: 'Up to 30% off — list gets in first', sub: 'Doors open early for the list. Biggest cuts of the year, limited stock, no restocks. Timer is real.', cta: 'GET EARLY ACCESS', no: 'I like paying more', code: 'BLACKOUT30', cd: true, cdEnd: '2026-11-30 23:59', deco: '-30%', colors: { bg: '#000000', ink: '#ffffff', vis: 'repeating-linear-gradient(-45deg,#000,#000 14px,#111 14px,#111 28px)', visInk: '#ffd400', tag: '#ffd400', accent: '#ffffff', accent2: '#ffd400', field: '#111111', fieldBd: '#333333', cta: '#ffd400', ctaInk: '#000000' } },
    { id: 'xmas', name: '04 圣诞 Christmas', tag: '// HOLIDAY DROP — DEC', big: 'COP IT<br>BEFORE<br><em>SANTA.</em>', kicker: 'HOLIDAY DROP', title: '15% off + free gift wrap', sub: 'The only drop that ships in time for the tree. Order-by dates, gift guides and 15% off — straight to your inbox.', cta: 'UNWRAP 15% OFF', no: 'No gifts for me', code: 'HOLIDAY15', cd: false, cdEnd: '', deco: '🎄❄', colors: { bg: '#0b2418', ink: '#f6f1e3', vis: 'linear-gradient(165deg,#0e2f1f,#123a26)', visInk: '#f6f1e3', tag: '#e8b64c', accent: '#d94f3d', accent2: '#e8b64c', field: '#0e2c1d', fieldBd: '#2d5a41', cta: '#d94f3d', ctaInk: '#ffffff' } },
    { id: 'ny', name: '05 新年 New Year', tag: '// SEASON 02 — JAN 01', big: 'NEW<br>YEAR.<br><em>NEW GEAR.</em>', kicker: 'SEASON 02 PREVIEW', title: 'First look at next season', sub: 'Season 01 is history. Join the list for the Season 02 reveal, launch-day access and 10% off your first cop of the year.', cta: 'START SEASON 02', no: 'Stuck in last year', code: 'SEASON02', cd: false, cdEnd: '', deco: '02 ✦', colors: { bg: '#0a0a0f', ink: '#f2efe9', vis: 'linear-gradient(150deg,#101018,#1a1424)', visInk: '#e8c766', tag: '#e8c766', accent: '#ffffff', accent2: '#e8c766', field: '#14141c', fieldBd: '#34344a', cta: '#e8c766', ctaInk: '#0a0a0f' } },
    { id: 'summer', name: '06 夏季 Summer', tag: '// SUMMER SKIRMISH', big: 'BACK<br>YARD<br><em>SEASON.</em>', kicker: 'SUMMER SKIRMISH', title: '10% off squad loadouts', sub: 'Longest days, biggest games. Squad bundles and 10% off while the sun is out.', cta: 'GEAR UP FOR SUMMER', no: 'Staying indoors', code: 'SUMMER10', cd: false, cdEnd: '', deco: '☀', colors: { bg: '#fff6e8', ink: '#1c1c1c', vis: 'linear-gradient(160deg,#ff9a3d,#ff5e62)', visInk: '#ffffff', tag: '#ffffff', accent: '#ffe25a', accent2: '#ff5e62', field: '#ffffff', fieldBd: '#e0cdb2', cta: '#1c1c1c', ctaInk: '#ffe25a' } }
  ]
};

/* ---------------- 存储层:Postgres 或 内存+文件 ---------------- */
let db = null;
const MEM_FILE = '/tmp/ggp-data.json';
let mem = { config: null, subscribers: [] };

async function initStore() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : undefined });
    await db.query(`CREATE TABLE IF NOT EXISTS ggp_config (id INT PRIMARY KEY, data JSONB NOT NULL)`);
    await db.query(`CREATE TABLE IF NOT EXISTS ggp_subscribers (
      id SERIAL PRIMARY KEY, email TEXT NOT NULL, phone TEXT DEFAULT '',
      template TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT now())`);
    const r = await db.query('SELECT data FROM ggp_config WHERE id=1');
    if (!r.rows.length) await db.query('INSERT INTO ggp_config (id, data) VALUES (1, $1)', [JSON.stringify(DEFAULT_CONFIG)]);
    console.log('[store] Postgres ready');
  } else {
    try { mem = JSON.parse(fs.readFileSync(MEM_FILE, 'utf8')); } catch (e) {}
    if (!mem.config) mem.config = DEFAULT_CONFIG;
    console.warn('[store] 未检测到 DATABASE_URL — 使用内存存储(重启丢失,仅供本地测试)。Railway 上请添加 Postgres。');
  }
}
function memSave() { try { fs.writeFileSync(MEM_FILE, JSON.stringify(mem)); } catch (e) {} }
async function getConfig() {
  if (db) { const r = await db.query('SELECT data FROM ggp_config WHERE id=1'); return r.rows[0].data; }
  return mem.config;
}
async function setConfig(cfg) {
  if (db) await db.query('UPDATE ggp_config SET data=$1 WHERE id=1', [JSON.stringify(cfg)]);
  else { mem.config = cfg; memSave(); }
}
async function addSubscriber(email, phone, template) {
  if (db) await db.query('INSERT INTO ggp_subscribers (email, phone, template) VALUES ($1,$2,$3)', [email, phone, template]);
  else { mem.subscribers.push({ id: mem.subscribers.length + 1, email, phone, template, created_at: new Date().toISOString() }); memSave(); }
}
async function listSubscribers() {
  if (db) { const r = await db.query('SELECT * FROM ggp_subscribers ORDER BY created_at DESC LIMIT 5000'); return r.rows; }
  return [...mem.subscribers].reverse();
}

/* ---------------- App ---------------- */
const app = express();
app.use(express.json({ limit: '256kb' }));

function cors(res) {
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}
app.options(/^\/api\/(config|subscribe)$/, (req, res) => { cors(res); res.sendStatus(204); });

/* Basic Auth 保护后台 */
function adminAuth(req, res, next) {
  if (!ADMIN_PASSWORD) return res.status(500).send('请先在环境变量设置 ADMIN_PASSWORD');
  const h = req.headers.authorization || '';
  const pass = h.startsWith('Basic ') ? Buffer.from(h.slice(6), 'base64').toString().split(':').slice(1).join(':') : '';
  if (pass === ADMIN_PASSWORD) return next();
  res.set('WWW-Authenticate', 'Basic realm="GellyGo Popup Admin"');
  res.status(401).send('Auth required');
}

/* ---- 公开接口 ---- */
app.get('/api/config', async (req, res) => {
  cors(res);
  const cfg = await getConfig();
  const t = cfg.templates.find(x => x.id === (req.query.t || cfg.settings.activeTemplate)) || cfg.templates[0];
  res.json({ settings: cfg.settings, template: t });
});

app.post('/api/subscribe', async (req, res) => {
  cors(res);
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const template = String(req.body.template || '').slice(0, 50);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'invalid email' });
  if (phone && !/^\+?[\d\s()-]{7,15}$/.test(phone)) return res.status(400).json({ error: 'invalid phone' });
  await addSubscriber(email, phone, template);
  res.json({ ok: true });
});

app.get('/popup.js', (req, res) => {
  res.type('application/javascript');
  res.set('Cache-Control', 'public, max-age=300');
  res.sendFile(path.join(__dirname, 'public', 'popup.js'));
});

/* 单模板预览(即时弹出、不受频次限制) */
app.get('/preview', async (req, res) => {
  const t = String(req.query.t || '').replace(/[^\w-]/g, '');
  res.type('html').send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview</title></head>
<body style="background:#333;min-height:100vh;margin:0">
<script>window.GGP_PREVIEW=${JSON.stringify(t)};</script>
<script src="/popup.js" defer></script>
</body></html>`);
});

/* ---- 管理接口 ---- */
app.get('/admin', adminAuth, (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/api/admin/config', adminAuth, async (req, res) => res.json(await getConfig()));
app.put('/api/admin/config', adminAuth, async (req, res) => {
  const cfg = req.body;
  if (!cfg || !Array.isArray(cfg.templates) || !cfg.settings || !cfg.templates.length) return res.status(400).json({ error: 'bad config' });
  if (!cfg.templates.find(t => t.id === cfg.settings.activeTemplate)) cfg.settings.activeTemplate = cfg.templates[0].id;
  await setConfig(cfg);
  res.json({ ok: true });
});
app.get('/api/admin/subscribers', adminAuth, async (req, res) => res.json(await listSubscribers()));
app.get('/api/admin/subscribers.csv', adminAuth, async (req, res) => {
  const rows = await listSubscribers();
  const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const csv = 'email,phone,template,created_at\n' + rows.map(r => [r.email, r.phone, r.template, r.created_at].map(esc).join(',')).join('\n');
  res.type('text/csv').set('Content-Disposition', 'attachment; filename=subscribers.csv').send('﻿' + csv);
});

app.get('/', (req, res) => res.send('GellyGo Popup service is running. Admin: /admin'));

initStore().then(() => app.listen(PORT, () => console.log('GellyGo Popup listening on :' + PORT)));
