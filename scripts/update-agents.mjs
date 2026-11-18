import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const agents = ['aksel', 'nav-pilot', 'code-review', 'security-champion'];
const skills = ['aksel-builder'];
const source = 'https://github.com/navikt/copilot.git';
const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function readFiles(directory) {
  const files = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      for (const [child, content] of await readFiles(path)) {
        files.set(`${entry.name}/${child}`, content);
      }
    } else if (entry.isFile()) {
      files.set(entry.name, await readFile(path));
    } else {
      throw new Error(`Unsupported file type: ${path}`);
    }
  }
  return files;
}

export async function syncAgents(mode, { root = defaultRoot } = {}) {
  if (!['check', 'update'].includes(mode)) {
    throw new Error('Usage: node scripts/update-agents.mjs <check|update>');
  }

  const revision = execFileSync('git', ['ls-remote', '--exit-code', source, 'refs/heads/main'], {
    encoding: 'utf8',
    timeout: 30_000
  });
  const sha = revision.split('\t')[0];
  if (!/^[a-f0-9]{40}$/.test(sha)) {
    throw new Error('GitHub returned an invalid commit SHA.');
  }
  console.log(`Source: navikt/copilot@${sha}`);

  const snapshot = await mkdtemp(resolve(tmpdir(), 'copilot-sync-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: snapshot, encoding: 'utf8', timeout: 60_000 });
    git('init', '--quiet');
    git('sparse-checkout', 'set', 'agents', ...skills.map((skill) => `skills/${skill}`));
    git('fetch', '--quiet', '--depth=1', '--filter=blob:none', source, sha);
    git('-c', 'advice.detachedHead=false', 'checkout', '--quiet', '--detach', 'FETCH_HEAD');

    const changes = [];
    const paths = [...agents.map((agent) => `agents/${agent}.agent.md`), ...skills.map((skill) => `skills/${skill}`)];
    for (const path of paths) {
      const isSkill = path.startsWith('skills/');
      const definition = await readFile(resolve(snapshot, path, ...(isSkill ? ['SKILL.md'] : [])), 'utf8');
      if (!/^---\r?\n/.test(definition) || !/^name: .+/m.test(definition)) {
        throw new Error(`Invalid definition: ${path}`);
      }
      const remoteFiles = isSkill ? await readFiles(resolve(snapshot, path)) : new Map([['', Buffer.from(definition)]]);
      const localFiles = isSkill
        ? await readFiles(resolve(root, '.github', path))
        : new Map([['', await readFile(resolve(root, '.github', path))]]);
      const count = changes.length;
      for (const name of new Set([...remoteFiles.keys(), ...localFiles.keys()])) {
        const remote = remoteFiles.get(name);
        const local = localFiles.get(name);
        if (!remote || !local || !remote.equals(local)) {
          changes.push({ path: `.github/${path}${name ? `/${name}` : ''}`, remote });
        }
      }
      console.log(`${path}: ${changes.length > count ? 'update available' : 'up to date'}`);
    }

    if (mode === 'update' && changes.length > 0) {
      const status = execFileSync(
        'git',
        [
          'status',
          '--porcelain',
          '--untracked-files=all',
          '--ignored',
          '--',
          ...paths.map((path) => `.github/${path}`)
        ],
        { cwd: root, encoding: 'utf8' }
      );
      if (status.trim()) {
        throw new Error(`Refusing to overwrite local changes. Commit or preserve these files first:\n${status}`);
      }
      for (const { path, remote } of changes) {
        if (remote) {
          await mkdir(dirname(resolve(root, path)), { recursive: true });
          await writeFile(resolve(root, path), remote);
        } else {
          await rm(resolve(root, path));
        }
        console.log(`${remote ? 'Updated' : 'Removed'}: ${path}`);
      }
    }

    return changes.length;
  } finally {
    await rm(snapshot, { recursive: true, force: true });
  }
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
