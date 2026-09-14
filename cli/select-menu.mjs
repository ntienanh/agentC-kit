#!/usr/bin/env node
import readline from 'readline';

const options = [
  'NestJS Enterprise Backend (be)',
  'Next.js CMS Admin (cms)',
  'Front Office Client Portal (fo)',
  'None (Pure Governance & Engine Only)'
];

const optionKeys = ['be', 'cms', 'fo', ''];

let selected = 0;

function render() {
  // Clear lines
  readline.cursorTo(process.stdout, 0);
  console.log('\n📦 Select a Starter Boilerplate Template (Use ↑/↓ Arrow Keys & Enter):');
  options.forEach((opt, idx) => {
    if (idx === selected) {
      console.log(`  \x1b[1;\x1b[36m❯ ${opt}\x1b[0m`);
    } else {
      console.log(`    ${opt}`);
    }
  });
}

function clearMenu() {
  const linesToClear = options.length + 2;
  for (let i = 0; i < linesToClear; i++) {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);
  }
}

if (!process.stdin.isTTY) {
  process.stdout.write('');
  process.exit(0);
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

render();

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'up') {
    clearMenu();
    selected = selected > 0 ? selected - 1 : options.length - 1;
    render();
  } else if (key.name === 'down') {
    clearMenu();
    selected = selected < options.length - 1 ? selected + 1 : 0;
    render();
  } else if (key.name === 'return') {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    clearMenu();
    process.stdout.write(optionKeys[selected]);
    process.exit(0);
  } else if (key.ctrl && key.name === 'c') {
    process.stdin.setRawMode(false);
    process.exit(1);
  }
});
