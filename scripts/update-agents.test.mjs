import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { syncAgents } from './update-agents.mjs';

vi.mock('node:child_process', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    execFileSync: (command, args, options) =>
      command === 'git' && args[0] === 'ls-remote'
        ? `${'a'.repeat(40)}\trefs/heads/main\n`
        : original.execFileSync(command, args, options)
  };
});

const agents = ['aksel', 'nav-pilot', 'code-review', 'security-champion'];
const sha = 'a'.repeat(40);
const original = '---\nname: test-agent\n---\nOriginal\n';
const updated = '---\nname: test-agent\n---\nUpdated\n';
let root;
let fetchImpl;

const agentPath = (agent) => join(root, '.github', 'agents', `${agent}.agent.md`);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'copilot-agents-test-'));
  await mkdir(join(root, '.github', 'agents'), { recursive: true });
  for (const agent of agents) {
    await writeFile(agentPath(agent), original);
  }
  git('init');
  git('add', '.github/agents');
  git(
    '-c',
    'user.name=Test',
    '-c',
    'user.email=test@example.invalid',
    '-c',
    'core.hooksPath=/dev/null',
    'commit',
    '--no-gpg-sign',
    '-m',
    'Initial'
  );
  fetchImpl = vi.fn(async (url) => ({
    ok: true,
    text: async () => (url.endsWith('/aksel.agent.md') ? updated : original)
  }));
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(root, { recursive: true, force: true });
});

it('checks without writing and pins all downloads to the resolved commit', async () => {
  expect(await syncAgents('check', { root, fetchImpl })).toBe(1);
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
  expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual(
    agents.map((agent) => `https://raw.githubusercontent.com/navikt/copilot/${sha}/agents/${agent}.agent.md`)
  );
});

it('updates only changed agents and reports no changes on the next check', async () => {
  expect(await syncAgents('update', { root, fetchImpl })).toBe(1);
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(updated);
  expect(await readFile(agentPath('nav-pilot'), 'utf8')).toBe(original);
  expect(await syncAgents('check', { root, fetchImpl })).toBe(0);
});

it.each([false, true])('preserves local changes (staged: %s)', async (staged) => {
  await writeFile(agentPath('aksel'), `${original}Local customization\n`);
  if (staged) git('add', '.github/agents/aksel.agent.md');
  await expect(syncAgents('update', { root, fetchImpl })).rejects.toThrow('Refusing to overwrite local changes');
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(`${original}Local customization\n`);
});

it.each(['http', 'content'])('does not write any files when a later download fails: %s', async (failure) => {
  fetchImpl.mockImplementation(async (url) => ({
    ok: !(failure === 'http' && url.endsWith('/security-champion.agent.md')),
    status: 404,
    text: async () => (url.endsWith('/security-champion.agent.md') ? '<html>Error</html>' : updated)
  }));
  await expect(syncAgents('update', { root, fetchImpl })).rejects.toThrow(
    failure === 'http' ? 'Download failed (404)' : 'Invalid agent definition'
  );
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
});
