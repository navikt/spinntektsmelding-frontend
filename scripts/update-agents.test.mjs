import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { syncAgents } from './update-agents.mjs';

vi.mock('node:child_process', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    execFileSync: (command, args, options) =>
      original.execFileSync(
        command,
        args.map((arg) => (arg === 'https://github.com/navikt/copilot.git' ? pathToFileURL(upstream).href : arg)),
        options
      )
  };
});

const agents = ['aksel', 'nav-pilot', 'code-review', 'security-champion'];
const original = '---\nname: test-agent\n---\nOriginal\n';
const updated = '---\nname: test-agent\n---\nUpdated\n';
const originalInstruction = '---\napplyTo: "**/*.tsx"\n---\nOriginal instruction\n';
const updatedInstruction = '---\napplyTo: "**/*.tsx"\n---\nUpdated instruction\n';
let workspace;
let root;
let upstream;

const agentPath = (agent) => join(root, '.github', 'agents', `${agent}.agent.md`);
const skillPath = (...parts) => join(root, '.github', 'skills', 'aksel-builder', ...parts);
const sourceSkill = (...parts) => join(upstream, 'skills', 'aksel-builder', ...parts);
const instructionPath = () => join(root, '.github', 'instructions', 'nextjs-aksel.instructions.md');
const sourceInstruction = () => join(upstream, 'instructions', 'nextjs-aksel.instructions.md');
const git = (cwd, ...args) =>
  execFileSync('/usr/bin/git', args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
    env: { ...process.env, PATH: '/usr/bin:/bin' }
  });
const commit = (cwd) => {
  git(cwd, 'add', '.');
  git(
    cwd,
    '-c',
    'user.name=Test',
    '-c',
    'user.email=test@example.invalid',
    '-c',
    'core.hooksPath=/dev/null',
    'commit',
    '--no-gpg-sign',
    '-m',
    'Test fixture'
  );
};

beforeEach(async () => {
  workspace = await mkdtemp(join(tmpdir(), 'copilot-agents-test-'));
  root = join(workspace, 'project');
  upstream = join(workspace, 'upstream');
  await mkdir(join(root, '.github', 'agents'), { recursive: true });
  await mkdir(join(upstream, 'agents'), { recursive: true });
  await mkdir(skillPath('references'), { recursive: true });
  await mkdir(sourceSkill('references'), { recursive: true });
  await mkdir(join(root, '.github', 'instructions'), { recursive: true });
  await mkdir(join(upstream, 'instructions'), { recursive: true });
  await writeFile(instructionPath(), originalInstruction);
  await writeFile(sourceInstruction(), originalInstruction);
  for (const agent of agents) {
    await writeFile(agentPath(agent), original);
    await writeFile(join(upstream, 'agents', `${agent}.agent.md`), agent === 'aksel' ? updated : original);
  }
  for (const directory of [skillPath(), sourceSkill()]) {
    await writeFile(join(directory, 'SKILL.md'), original);
    await writeFile(join(directory, 'references', 'existing.md'), 'Original reference\n');
  }
  git(root, 'init', '--initial-branch=main');
  git(upstream, 'init', '--initial-branch=main');
  git(upstream, 'config', 'uploadpack.allowFilter', 'true');
  commit(root);
  commit(upstream);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  await rm(workspace, { recursive: true, force: true });
});

it('rejects an invalid mode before running git', async () => {
  const exec = vi.spyOn(await import('node:child_process'), 'execFileSync');

  await expect(syncAgents('invalid', { root })).rejects.toThrow('Usage: node scripts/update-agents.mjs <check|update>');
  expect(exec).not.toHaveBeenCalled();
});

it.each(['', 'abc123', 'g'.repeat(40)])('rejects an invalid remote commit SHA: %j', async (sha) => {
  const exec = vi
    .spyOn(await import('node:child_process'), 'execFileSync')
    .mockReturnValueOnce(`${sha}\trefs/heads/main\n`);

  await expect(syncAgents('update', { root })).rejects.toThrow('GitHub returned an invalid commit SHA.');
  expect(exec).toHaveBeenCalledTimes(1);
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
});

it('checks without writing and pins the download to the resolved commit', async () => {
  const exec = vi.spyOn(await import('node:child_process'), 'execFileSync');
  expect(await syncAgents('check', { root })).toBe(1);
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
  expect(exec.mock.calls).toContainEqual([
    '/usr/bin/git',
    [
      'fetch',
      '--quiet',
      '--depth=1',
      '--filter=blob:none',
      'https://github.com/navikt/copilot.git',
      git(upstream, 'rev-parse', 'HEAD').trim()
    ],
    expect.objectContaining({ timeout: 60_000 })
  ]);
});

it('checks and updates without relying on the inherited PATH', async () => {
  vi.stubEnv('PATH', '/nonexistent');
  expect(await syncAgents('check', { root })).toBe(1);
  expect(await syncAgents('update', { root })).toBe(1);
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(updated);
});

it('does not write or check local git status when everything is up to date', async () => {
  await writeFile(join(upstream, 'agents', 'aksel.agent.md'), original);
  commit(upstream);
  const exec = vi.spyOn(await import('node:child_process'), 'execFileSync');

  expect(await syncAgents('update', { root })).toBe(0);
  expect(exec.mock.calls.some(([, args]) => args[0] === 'status')).toBe(false);
  expect(git(root, 'status', '--porcelain')).toBe('');
});

it('updates agents and all skill files, adds nested files and removes obsolete files', async () => {
  await writeFile(sourceSkill('SKILL.md'), updated);
  await writeFile(sourceSkill('references', 'existing.md'), 'Updated reference\n');
  await mkdir(sourceSkill('references', 'nested'));
  await writeFile(sourceSkill('references', 'nested', 'new.md'), 'New reference\n');
  await writeFile(skillPath('obsolete.md'), 'Old reference\n');
  commit(root);
  commit(upstream);

  expect(await syncAgents('check', { root })).toBe(5);
  expect(await readFile(skillPath('obsolete.md'), 'utf8')).toBe('Old reference\n');
  expect(await syncAgents('update', { root })).toBe(5);
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(updated);
  expect(await readFile(agentPath('nav-pilot'), 'utf8')).toBe(original);
  expect(await readFile(skillPath('SKILL.md'), 'utf8')).toBe(updated);
  expect(await readFile(skillPath('references', 'existing.md'), 'utf8')).toBe('Updated reference\n');
  expect(await readFile(skillPath('references', 'nested', 'new.md'), 'utf8')).toBe('New reference\n');
  await expect(readFile(skillPath('obsolete.md'))).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await syncAgents('check', { root })).toBe(0);
});

it.each([false, true])('preserves local agent changes (staged: %s)', async (staged) => {
  await writeFile(agentPath('aksel'), `${original}Local customization\n`);
  if (staged) git(root, 'add', '.github/agents/aksel.agent.md');
  await expect(syncAgents('update', { root })).rejects.toThrow('Refusing to overwrite local changes');
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(`${original}Local customization\n`);
});

it.each(['modified', 'staged', 'deleted', 'untracked', 'ignored'])(
  'preserves local skill changes: %s',
  async (kind) => {
    const path = skillPath('references', 'existing.md');
    if (kind === 'deleted') {
      await rm(path);
    } else if (kind === 'untracked' || kind === 'ignored') {
      await writeFile(skillPath('local.md'), 'Local reference\n');
      if (kind === 'ignored') await writeFile(join(root, '.git', 'info', 'exclude'), 'local.md\n');
    } else {
      await writeFile(path, 'Local reference\n');
      if (kind === 'staged') git(root, 'add', '.github/skills');
    }
    await expect(syncAgents('update', { root })).rejects.toThrow('Refusing to overwrite local changes');
    expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
    if (kind === 'untracked' || kind === 'ignored') {
      expect(await readFile(skillPath('local.md'), 'utf8')).toBe('Local reference\n');
    }
  }
);

it.each(['missing', 'invalid'])('does not write any files when a skill definition is %s', async (failure) => {
  if (failure === 'missing') await rm(sourceSkill('SKILL.md'));
  else await writeFile(sourceSkill('SKILL.md'), '<html>Error</html>');
  commit(upstream);
  await expect(syncAgents('update', { root })).rejects.toThrow();
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
  expect(await readFile(skillPath('SKILL.md'), 'utf8')).toBe(original);
});

it.each(['missing', 'invalid'])('does not write any files when an agent definition is %s', async (failure) => {
  const path = join(upstream, 'agents', 'nav-pilot.agent.md');
  if (failure === 'missing') await rm(path);
  else await writeFile(path, '---\ndescription: Missing name\n---\n');
  commit(upstream);

  await expect(syncAgents('update', { root })).rejects.toThrow(
    failure === 'missing' ? /ENOENT/ : 'Invalid definition: agents/nav-pilot.agent.md'
  );
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
  expect(await readFile(agentPath('nav-pilot'), 'utf8')).toBe(original);
});

it('checks and updates configured instructions without touching other instruction files', async () => {
  const customPath = join(root, '.github', 'instructions', 'custom.instructions.md');
  await writeFile(customPath, 'Local project rules\n');
  await writeFile(sourceInstruction(), updatedInstruction);
  await writeFile(join(upstream, 'instructions', 'other.instructions.md'), originalInstruction);
  commit(root);
  commit(upstream);

  expect(await syncAgents('check', { root })).toBe(2);
  expect(await readFile(instructionPath(), 'utf8')).toBe(originalInstruction);
  expect(await syncAgents('update', { root })).toBe(2);
  expect(await readFile(instructionPath(), 'utf8')).toBe(updatedInstruction);
  expect(await readFile(customPath, 'utf8')).toBe('Local project rules\n');
  await expect(readFile(join(root, '.github', 'instructions', 'other.instructions.md'))).rejects.toMatchObject({
    code: 'ENOENT'
  });
  expect(await syncAgents('check', { root })).toBe(0);
});

it.each([false, true])('preserves local instruction changes (staged: %s)', async (staged) => {
  await writeFile(instructionPath(), `${originalInstruction}Local customization\n`);
  if (staged) git(root, 'add', '.github/instructions');
  await expect(syncAgents('update', { root })).rejects.toThrow('Refusing to overwrite local changes');
  expect(await readFile(instructionPath(), 'utf8')).toBe(`${originalInstruction}Local customization\n`);
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
});

it('does not write any files when an instruction lacks applyTo', async () => {
  await writeFile(sourceInstruction(), original);
  commit(upstream);
  await expect(syncAgents('update', { root })).rejects.toThrow(
    'Invalid definition: instructions/nextjs-aksel.instructions.md'
  );
  expect(await readFile(agentPath('aksel'), 'utf8')).toBe(original);
  expect(await readFile(instructionPath(), 'utf8')).toBe(originalInstruction);
});
