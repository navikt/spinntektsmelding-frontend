const replace = require('replace-in-file');

async function run() {
  await replace({
    files: 'schema/*.ts',
    from: [/\bapiPeriodeSchema\b/g, /\btidPeriode\b/g],
    to: (match) => {
      // simply uppercase first letter:
      return match[0].toUpperCase() + match.slice(1);
    }
  });
  console.log('Schemas renamed to PascalCase + Schema suffix');
}

run().catch(console.error);
