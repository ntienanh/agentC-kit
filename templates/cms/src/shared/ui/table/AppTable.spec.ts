import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { expect, test } from 'vitest';

const projectRoot = process.cwd();
const sourceRoots = ['src/app', 'src/features', 'src/shared'];
const allowedDirectTableFile = 'src/shared/ui/table/AppTable.tsx';

async function collectTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await (await import('node:fs/promises')).readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(entry => {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) return collectTypeScriptFiles(entryPath);
      if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) return Promise.resolve([entryPath]);
      return Promise.resolve([]);
    }),
  );

  return nestedFiles.flat();
}

test('all CMS data tables use the shared AppTable shell', async () => {
  const files = (await Promise.all(sourceRoots.map(root => collectTypeScriptFiles(join(projectRoot, root))))).flat();
  const violations: string[] = [];
  const directAntTableImport = /import\s*\{[^}]*\bTable\b[^}]*\}\s*from\s*['"]antd['"]\s*/;
  const directAntTableElement = /<Table(?:\s|<|\/)/;

  for (const file of files) {
    if (relative(projectRoot, file) === allowedDirectTableFile || /\.(spec|test)\.(ts|tsx)$/.test(file)) continue;

    const source = await readFile(file, 'utf8');
    if (directAntTableImport.test(source) || directAntTableElement.test(source)) {
      violations.push(relative(projectRoot, file));
    }
  }

  expect(
    violations,
    `The following files contain direct AntD Table usage instead of AppTable:\n${violations.join('\n')}`,
  ).toEqual([]);
}, 30000);

test('AppTable exposes the shared responsive and accessible shell contract', async () => {
  const source = await readFile(join(projectRoot, allowedDirectTableFile), 'utf8');

  expect(source).toContain("data-cms-table='true'");
  expect(source).toContain('overflow-x-auto');
  expect(source).toContain('rounded-md');
  expect(source).not.toContain('rounded-xl');
  expect(source).toContain("role={ariaLabel ? 'region' : undefined}");
  expect(source).toContain("position: ['topRight', 'bottomRight']");
  expect(source).toContain('bulkActions');
  expect(source).toContain('selectedKeys');
});
