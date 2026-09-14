#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = fs.existsSync(path.join(KIT_ROOT, 'agents', 'index.yaml'))
  ? path.join(KIT_ROOT, 'agents', 'index.yaml')
  : path.join(KIT_ROOT, 'skills', 'index.yaml');

const { values } = parseArgs({
  options: {
    prompt:   { type: 'string',  short: 'p', default: '' },
    gate:     { type: 'string',  short: 'g', default: '' },
    'top-n':  { type: 'string',  short: 'n', default: '3' },
    json:     { type: 'boolean', short: 'j', default: false },
    help:     { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
});

if (values.help || !values.prompt) {
  console.log('Usage: node tools/skill-matcher.mjs --prompt "<task description>" [--gate N] [--top-n 3] [--json]');
  console.log('');
  console.log('Options:');
  console.log('  --prompt, -p   Task description to match skills for (required)');
  console.log('  --gate,   -g   Current gate number to filter skills (0-4)');
  console.log('  --top-n,  -n   Number of top results to return (default: 3)');
  console.log('  --json,   -j   Output as JSON');
  console.log('');
  console.log('Examples:');
  console.log('  node tools/skill-matcher.mjs --prompt "build backend api for player" --gate 2');
  console.log('  node tools/skill-matcher.mjs --prompt "test e2e verification" --gate 2 --top-n 5');
  process.exit(values.help ? 0 : 1);
}

function parseYamlSkillIndex(content) {
  const skills = [];
  const lines = content.split('\n');
  let current = null;
  let inSkills = false;

  for (const line of lines) {
    if (line.trim() === 'skills:') { inSkills = true; continue; }
    if (!inSkills) continue;
    if (/^  - name:/.test(line)) {
      if (current) skills.push(current);
      current = { name: line.replace(/^  - name:\s*/, '').trim(), gates: [], keywords: [], path: '' };
      continue;
    }
    if (!current) continue;
    if (/^\s+gates:/.test(line)) {
      const m = line.match(/\[([^\]]+)\]/);
      if (m) current.gates = m[1].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
      continue;
    }
    if (/^\s+keywords:/.test(line)) {
      const m = line.match(/\[([^\]]+)\]/);
      if (m) current.keywords = m[1].split(',').map(k => k.trim().replace(/['"]/g, '').toLowerCase());
      continue;
    }
    if (/^\s+path:/.test(line)) {
      current.path = line.replace(/^\s+path:\s*/, '').trim();
      continue;
    }
  }
  if (current) skills.push(current);
  return skills;
}

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\p{L}\p{N}\s\-_]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2);
}

function bm25Score(queryTokens, docKeywords, k1 = 1.5, b = 0.75) {
  const avgDocLen = 15;
  const docLen = docKeywords.length;
  let score = 0;
  for (const qt of queryTokens) {
    const tf = docKeywords.filter(k => k === qt || k.includes(qt) || qt.includes(k)).length;
    if (tf === 0) continue;
    const idf = Math.log(1 + (20 / (0.5 + 1)));
    const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgDocLen)));
    score += idf * tfNorm;
  }
  return score;
}

if (!fs.existsSync(INDEX_PATH)) {
  console.error(`Error: Skill index not found at ${INDEX_PATH}`);
  console.error('Run from agentc-v2 root or ensure skills/index.yaml exists.');
  process.exit(1);
}

const indexContent = fs.readFileSync(INDEX_PATH, 'utf8');
const skills = parseYamlSkillIndex(indexContent);

const gateFilter = values.gate !== '' ? parseInt(values.gate, 10) : null;
const queryTokens = tokenize(values.prompt);
const topN = parseInt(values['top-n'] || '3', 10);

const scored = skills
  .filter(s => gateFilter === null || s.gates.includes(gateFilter) || s.gates.length === 0)
  .map(s => {
    const score = bm25Score(queryTokens, s.keywords);
    const matchedKeywords = s.keywords.filter(k =>
      queryTokens.some(qt => k.includes(qt) || qt.includes(k))
    );
    return { ...s, score, matchedKeywords };
  })
  .filter(s => s.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, topN);

if (values.json) {
  console.log(JSON.stringify(scored.map(s => ({
    name: s.name,
    path: s.path,
    score: Math.round(s.score * 100) / 100,
    gates: s.gates,
    matched_keywords: s.matchedKeywords,
  })), null, 2));
  process.exit(0);
}

if (scored.length === 0) {
  console.log(`No matching skills found for: "${values.prompt}"${gateFilter !== null ? ` at Gate ${gateFilter}` : ''}`);
  console.log('Try broadening your prompt or removing the gate filter.');
  process.exit(0);
}

const gateLabel = gateFilter !== null ? ` (Gate ${gateFilter})` : '';
console.log(`\nSkill Matcher Results for: "${values.prompt}"${gateLabel}`);
console.log('='.repeat(60));

scored.forEach((s, i) => {
  const skillPath = path.join(KIT_ROOT, s.path);
  const exists = fs.existsSync(skillPath);
  const existsIcon = exists ? '✓' : '✗';
  console.log(`\n${i + 1}. ${s.name}  (score: ${(s.score).toFixed(2)})`);
  console.log(`   Path     : ${s.path} ${existsIcon}`);
  console.log(`   Gates    : ${s.gates.join(', ')}`);
  console.log(`   Matched  : [${s.matchedKeywords.slice(0, 6).join(', ')}]`);
  if (exists) {
    console.log(`   Load cmd : view_file("${s.path}")`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Load the top skill: view_file("${scored[0]?.path}")`);
