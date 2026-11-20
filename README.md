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

## Tracing og logger

Nais aktiverer OpenTelemetry automatisk for Node.js via [naiserator.yaml](./naiserator.yaml).
Serverlogger skal bruke `logger` fra `@navikt/next-logger`, også ved API- og proxy-feil.
Loggeren legger automatisk til `trace_id`, `span_id` og `trace_flags` fra aktiv span,
slik at logger og traces kan kobles sammen i Grafana. Uten aktiv span utelates feltene.
Ikke registrer en ekstra OpenTelemetry-SDK ved siden av Nais-agenten.
Ikke logg tokens, request-/response-body eller personopplysninger.

Begge innsendingsflytene oppretter Faro-spannen `send_inntektsmelding` i
[utils/postInnsending.ts](./utils/postInnsending.ts). Den dekker POST-kallet og behandling
av resultatet, inkludert navigering ved suksess, men ikke lokal skjemavalidering.
Spannen er aktiv når HTTP-kallet starter, slik at nettverkskallet kan arve trace-konteksten.
Kun HTTP-status registreres som attributt; feil markeres uten responsinnhold eller feilmelding.
Innsending fungerer også når Faro er deaktivert.

## Deploy

Applikasjonen bygges som et containerimage og deployes til [Nais](https://nais.io/) via GitHub Actions:

- Push til `main` eller `dev` deployer til `dev-gcp`.
- Publisering av en GitHub-release starter produksjonsflyten.

Oppsettet ligger i [.github/workflows](./.github/workflows), [naiserator.yaml](./naiserator.yaml) og [nais](./nais).

## Bidra

Opprett en pull request med en beskrivelse av endringen. Kjør relevante tester og kvalitetssjekker før du ber om review.
Ikke legg personopplysninger eller hemmeligheter i kode, logger, issues eller pull requests.

### Oppdatere Copilot-agenter, skills og instructions

De fire prosjektagentene i [.github/agents](./.github/agents), `aksel-builder` i
[.github/skills](./.github/skills) og `nextjs-aksel.instructions.md` i
[.github/instructions](./.github/instructions) kan synkroniseres med
[navikt/copilot](https://github.com/navikt/copilot):

```bash
pnpm agents:check
pnpm agents:update
```

Kommandoene krever nettilgang, Node.js og Git på `/usr/bin/git` (macOS/Linux), men ingen ekstra pakker.
Git kjøres med fast `PATH` satt til `/usr/bin:/bin`, uavhengig av skallets `PATH`.
Sjekken endrer ingenting og avslutter med kode 0 når alt er oppdatert, 1 når oppdateringer finnes og 2 ved feil.
Oppdateringen erstatter endrede filer med originalene fra samme commit på kildens `main`-gren.
Hele skill-mappen synkroniseres, inkludert referanser, nye filer og sletting av utgåtte filer.
Andre skills installeres ikke automatisk; utvalget styres av `skills` i [skriptet](./scripts/update-agents.mjs).
Instructions velges tilsvarende i `instructions`; andre instruksjonsfiler blir ikke endret.
Alle nedlastinger kontrolleres før filer skrives. Lokale Git-endringer i de valgte agentene,
instruksjonsfilene eller skill-mappene, inkludert usporede og ignorerte filer, stopper oppdateringen;
commit eller bevar endringene først. Committede tilpasninger blir erstattet ved oppdatering.
Gjennomgå diffen før du committer. Personlige agenter utenfor prosjektet blir ikke endret.

## Kode delvis generert med kunstig intelligens

Deler av koden i dette repoet kan være generert med kunstig intelligens.
All kode skal gjennomgås av teamet før den merges, uavhengig av om den er skrevet manuelt eller generert med KI.

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som
[issues på GitHub](https://github.com/navikt/spinntektsmelding-frontend/issues).

### For Nav-ansatte

Interne henvendelser kan rettes til team Helsearbeidsgiver (#helse-arbeidsgiver) på Slack.
