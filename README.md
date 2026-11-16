# spinntektsmelding-frontend

[![Bygg og deploy main](https://github.com/navikt/spinntektsmelding-frontend/actions/workflows/main.yml/badge.svg)](https://github.com/navikt/spinntektsmelding-frontend/actions/workflows/main.yml)

Frontend for arbeidsgiveres innsending og endring av inntektsmeldinger for sykepenger til Nav.
Applikasjonen er utviklet med Next.js, React og TypeScript og bruker [Aksel](https://aksel.nav.no/) som designsystem.

Applikasjonen eies og vedlikeholdes av team Helsearbeidsgiver.

## Kom i gang

### Forutsetninger

- Node.js 24, som brukes i CI.
- pnpm i versjonen angitt i `packageManager` i [package.json](./package.json).
- Tilgang til Nav-pakker i GitHub Packages. Se registeroppsettet i [.npmrc](./.npmrc).

Ved autentiseringsfeil under installasjon må du konfigurere tilgang til
[GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).
Ikke legg tilgangstoken eller andre hemmeligheter i versjonskontrollerte filer.

### Lokal utvikling

```bash
pnpm install
pnpm dev
```

Applikasjonen kjører på [http://localhost:3000/im-dialog](http://localhost:3000/im-dialog).
Ruten du åpner, må passe flyten du vil teste, for eksempel
[initiering](http://localhost:3000/im-dialog/initiering).

Standardkommandoen starter uten Nav-dekoratøren. For å kjøre med dekoratøren:

```bash
pnpm dev:decorator
```

Miljøkonfigurasjon ligger i [.env](./.env), [development.env](./development.env) og
[production.env](./production.env). URL-er og miljøvariabler som brukes av applikasjonen, er samlet i
[config/environment.ts](./config/environment.ts). Flyter som krever innlogging og backend, trenger tilgang til
de aktuelle tjenestene; utviklingsserveren alene erstatter ikke disse.

Bruk bare syntetiske testdata ved lokal utvikling og testing.

## Test og kvalitetssjekker

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Testene kjøres med Vitest. Bruk `pnpm test:watch` for å kjøre dem kontinuerlig under utvikling.

## Deploy

Applikasjonen bygges som et containerimage og deployes til [Nais](https://nais.io/) via GitHub Actions:

- Push til `main` eller `dev` deployer til `dev-gcp`.
- Publisering av en GitHub-release starter produksjonsflyten.

Oppsettet ligger i [.github/workflows](./.github/workflows), [naiserator.yaml](./naiserator.yaml) og [nais](./nais).

## Bidra

Opprett en pull request med en beskrivelse av endringen. Kjør relevante tester og kvalitetssjekker før du ber om review.
Ikke legg personopplysninger eller hemmeligheter i kode, logger, issues eller pull requests.

## Kode delvis generert med kunstig intelligens

Deler av koden i dette repoet kan være generert med kunstig intelligens.
All kode skal gjennomgås av teamet før den merges, uavhengig av om den er skrevet manuelt eller generert med KI.

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som
[issues på GitHub](https://github.com/navikt/spinntektsmelding-frontend/issues).

### For Nav-ansatte

Interne henvendelser kan rettes til team Helsearbeidsgiver på Slack.
