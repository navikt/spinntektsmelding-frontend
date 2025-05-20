import fs from 'fs';
import path from 'path';
import { replaceInFile } from 'replace-in-file';
import { fileURLToPath } from 'url';

async function run() {
  const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
  const __dirname = path.dirname(__filename); // get the name of the directory
  const root = path.resolve(__dirname, '..');
  const schemaDir = path.join(root, 'schema');

  // 1) Read all .ts files in schema/
  const files = fs.readdirSync(schemaDir).filter((f) => f.endsWith('.ts'));

  // 2) Build mapping oldName -> newName
  const mappings = files.map((file) => {
    const base = path.basename(file, '.ts');
    // strip existing 'Schema' suffix, uppercase first letter
    const clean = base.replace(/Schema$/i, '');
    const pascal = clean[0].toUpperCase() + clean.slice(1);
    const newName = pascal.endsWith('Schema') ? pascal : pascal + 'Schema';
    return { oldBase: base, newBase: newName, file };
  });

  // 3) Replace identifiers in all .ts/.tsx except node_modules/
  const patterns = mappings.map((m) => new RegExp(`\\b${m.oldBase}\\b`, 'g'));
  const replacements = mappings.map((m) => m.newBase);

  await replaceInFile({
    files: ['**/*.{ts,tsx}'],
    ignore: ['**/node_modules/**'],
    from: patterns,
    to: replacements
  });

  // 4) Rename schema files on disk
  mappings.forEach(({ oldBase, newBase, file }) => {
    const oldPath = path.join(schemaDir, file);
    const newPath = path.join(schemaDir, `${newBase}.ts`);
    if (!fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${file} → ${newBase}.ts`);
    }
  });

  console.log('✅ All schema identifiers and filenames updated to PascalCase + Schema suffix');
}

run().catch((err) => {
  console.error('❌ Schema rename failed:', err);
  process.exit(1);
});
