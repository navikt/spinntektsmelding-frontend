import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const agents = ['aksel', 'nav-pilot', 'code-review', 'security-champion'];
const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function syncAgents(mode, { root = defaultRoot, fetchImpl = globalThis.fetch } = {}) {
  if (!['check', 'update'].includes(mode)) {
    throw new Error('Usage: node scripts/update-agents.mjs <check|update>');
  }

  async function download(url) {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
      throw new Error(`Download failed (${response.status}): ${url}`);
    }
    return response;
  }

  const revision = execFileSync(
    'git',
    ['ls-remote', '--exit-code', 'https://github.com/navikt/copilot.git', 'refs/heads/main'],
    { encoding: 'utf8', timeout: 30_000 }
  );
  const sha = revision.split('\t')[0];
  if (!/^[a-f0-9]{40}$/.test(sha)) {
    throw new Error('GitHub returned an invalid commit SHA.');
  }
  console.log(`Source: navikt/copilot@${sha}`);

  const changes = [];
  for (const agent of agents) {
    const path = `.github/agents/${agent}.agent.md`;
    const local = await readFile(resolve(root, path), 'utf8');
    const remote = await (
      await download(`https://raw.githubusercontent.com/navikt/copilot/${sha}/agents/${agent}.agent.md`)
    ).text();
    if (!/^---\r?\n/.test(remote) || !/^name: .+/m.test(remote)) {
      throw new Error(`Invalid agent definition: ${agent}`);
    }
    const changed = local !== remote;
    console.log(`${agent}: ${changed ? 'update available' : 'up to date'}`);
    if (changed) {
      changes.push({ path, remote });
    }
  }

  if (mode === 'update' && changes.length > 0) {
    const status = execFileSync('git', ['status', '--porcelain', '--', ...changes.map(({ path }) => path)], {
      cwd: root,
      encoding: 'utf8'
    });
    if (status.trim()) {
      throw new Error(`Refusing to overwrite local changes. Commit or preserve these files first:\n${status}`);
    }
    for (const { path, remote } of changes) {
      await writeFile(resolve(root, path), remote);
      console.log(`Updated: ${path}`);
    }
  }

  return changes.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const mode = process.argv[2];
  try {
    if (process.argv.length !== 3) {
      throw new Error('Usage: node scripts/update-agents.mjs <check|update>');
    }
    const changes = await syncAgents(mode);
    process.exitCode = mode === 'check' && changes > 0 ? 1 : 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  }
}
