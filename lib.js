#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

const DB_DIR = path.join(os.homedir(), '.lib-local');
const DB_FILE = path.join(DB_DIR, 'catalog.json');

function loadDB() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ nextId: 1, items: [] }, null, 2));
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function makeSerial(id) {
  return 'LIB-' + String(id).padStart(6, '0');
}

function cmdAdd(args) {
  const [name, version, ...rest] = args;
  if (!name) return console.log('Usage: lib add <name> [version] [notes...]');
  const db = loadDB();
  const serial = makeSerial(db.nextId);
  const item = {
    serial,
    name,
    version: version || 'unspecified',
    notes: rest.join(' ') || '',
    added: new Date().toISOString()
  };
  db.items.push(item);
  db.nextId++;
  saveDB(db);
  console.log(`Added: ${serial}  ${name}@${item.version}`);
}

function cmdList() {
  const db = loadDB();
  if (db.items.length === 0) return console.log('No libraries catalogued yet.');
  db.items.forEach(i => {
    console.log(`${i.serial}  ${i.name}@${i.version}${i.notes ? '  — ' + i.notes : ''}`);
  });
}

function cmdSearch(args) {
  const q = (args[0] || '').toLowerCase();
  const db = loadDB();
  const results = db.items.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.serial.toLowerCase().includes(q) ||
    i.notes.toLowerCase().includes(q)
  );
  if (results.length === 0) return console.log('No matches.');
  results.forEach(i => console.log(`${i.serial}  ${i.name}@${i.version}${i.notes ? '  — ' + i.notes : ''}`));
}

function cmdRemove(args) {
  const serial = args[0];
  if (!serial) return console.log('Usage: lib remove <serial>');
  const db = loadDB();
  const before = db.items.length;
  db.items = db.items.filter(i => i.serial !== serial);
  saveDB(db);
  console.log(before !== db.items.length ? `Removed ${serial}` : `No entry found for ${serial}`);
}

function cmdInfo(args) {
  const serial = args[0];
  const db = loadDB();
  const item = db.items.find(i => i.serial === serial);
  if (!item) return console.log('Not found.');
  console.log(JSON.stringify(item, null, 2));
}

const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case 'add': cmdAdd(args); break;
  case 'list': cmdList(); break;
  case 'search': cmdSearch(args); break;
  case 'remove': cmdRemove(args); break;
  case 'info': cmdInfo(args); break;
  default:
    console.log(`lib-local — local software library catalog

Usage:
  lib add <name> [version] [notes...]
  lib list
  lib search <query>
  lib info <serial>
  lib remove <serial>`);
}
