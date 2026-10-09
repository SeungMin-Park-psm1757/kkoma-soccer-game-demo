import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const assets = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name !== '.gitkeep') assets.push(path.relative(root, file).split(path.sep).join('/'));
  }
}
await walk(path.join(root, 'assets'));
const byLowercase = new Map(assets.map(file => [file.toLowerCase(), file]));

async function checkAsset(file, label) {
  const actual = byLowercase.get(file.toLowerCase());
  assert.ok(actual, `${label}: missing asset ${file}`);
  assert.equal(actual, file, `${label}: filename case mismatch ${file} -> ${actual}`);
  assert.ok((await stat(path.join(root, actual))).size > 0, `${label}: empty asset ${file}`);
}

const manifestPath = 'assets/players/manifest.json';
await checkAsset(manifestPath, 'player manifest');
const manifest = JSON.parse(await readFile(path.join(root, manifestPath), 'utf8'));
async function checkManifest(value, label = 'player manifest') {
  if (typeof value === 'string' && /\.(?:png|webp|jpe?g|mp3|ogg|wav)$/i.test(value)) {
    await checkAsset(`assets/players/${value}`, label);
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) await checkManifest(child, `${label}.${key}`);
  }
}
await checkManifest(manifest);

const game = await readFile(path.join(root, 'game.js'), 'utf8');
const referenced = new Set([...game.matchAll(/['"](assets\/(?:audio|players|ending|ui)\/[^'"]+)['"]/g)].map(match => match[1]));
for (const file of referenced) await checkAsset(file, 'game.js');

const endingContext = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'ending-content.js'), 'utf8'), endingContext);
const ending = endingContext.window.KKOMA_ENDING_CONTENT;
assert.ok(ending && Object.keys(ending.countryStories).length === 48, 'ending data must cover all 48 countries');
const stories = new Set(), facts = new Map(ending.facts.map(fact => [fact.id, fact]));
assert.equal(facts.size, ending.facts.length, 'ending fact IDs must be unique');
for (let id = 0; id < 48; id++) assert.ok(ending.countryStories[id], `missing ending country ${id}`);
for (const [countryId, entries] of Object.entries(ending.countryStories)) {
  assert.equal(entries.length, 3, `country ${countryId} must have three stories`);
  for (const story of entries) {
    assert.ok(!stories.has(story.id), `duplicate story ID ${story.id}`);
    stories.add(story.id);
    if (story.factId) assert.ok(facts.has(story.factId), `${story.id} references missing fact ${story.factId}`);
    if (story.image) await checkAsset(story.image, `${story.id}.image`);
  }
}
for (const fact of ending.facts) {
  assert.ok(Number.isInteger(fact.countryId) && fact.countryId >= 0 && fact.countryId < 48, `${fact.id} has an invalid country ID`);
  assert.ok(fact.sourceUrl?.startsWith('https://') && fact.eventYear && fact.verifiedAt, `${fact.id} needs source metadata`);
  if (fact.image) await checkAsset(fact.image, `${fact.id}.image`);
}

const hashes = new Map();
for (const file of assets) {
  const hash = createHash('sha256').update(await readFile(path.join(root, file))).digest('hex');
  assert.ok(!hashes.has(hash), `duplicate asset contents: ${hashes.get(hash)} and ${file}`);
  hashes.set(hash, file);
}
console.log(`PASS: ${assets.length} assets, player manifest, and ${stories.size} ending stories`);
