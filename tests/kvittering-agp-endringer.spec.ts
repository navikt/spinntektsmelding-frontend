import { test, expect } from '@playwright/test';

const uuid = '52ce04ad-0919-49ee-86f0-40c0e040dc0e';
const kvitteringUrl = `http://localhost:3000/im-dialog/kvittering/${uuid}`;

test.describe('Kvittering med AGP-endringer', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/collect', (r) => r.fulfill({ status: 202, body: 'OK' }));
    await page.goto(kvitteringUrl);
  });

  test('viser alle feltene korrekt for kvittering-agp-endringer', async ({ page }) => {
    await test.step('Verifiser tittel og overskrift', async () => {
      await expect(page).toHaveTitle('Kvittering for innsendt inntektsmelding - nav.no');
      await expect(page.locator('text="Kvittering - innsendt inntektsmelding"').first()).toBeVisible();
    });

    await test.step('Verifiser persondata - den ansatte', async () => {
      await expect(page.locator('[data-cy="navn"]')).toHaveText('UROLIG ESKE');
      await expect(page.locator('[data-cy="identitetsnummer"]')).toHaveText('08907299776');
    });

    await test.step('Verifiser arbeidsgiverdata', async () => {
      await expect(page.locator('[data-cy="virksomhetsnavn"]')).toHaveText('UKJENT ARBEIDSGIVER');
      await expect(page.locator('[data-cy="orgnummer"]')).toHaveText('315609267');
      await expect(page.locator('[data-cy="innsendernavn"]')).toHaveText('FRYKTSOM RADIOSTASJON');
      await expect(page.locator('text="95039233"')).toBeVisible();
    });

    await test.step('Verifiser bestemmende fraværsdag', async () => {
      await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/30.09.2025/);
    });

    await test.step('Verifiser arbeidsgiverperiode', async () => {
      await expect(page.getByRole('heading', { name: 'Arbeidsgiverperiode' })).toBeVisible();
      await expect(page.locator('text="30.09.2025"').first()).toBeVisible();
      await expect(page.locator('text="15.10.2025"').first()).toBeVisible();
    });

    await test.step('Verifiser beregnet månedslønn', async () => {
      await expect(page.getByRole('heading', { name: 'Beregnet månedslønn' })).toBeVisible();
      await expect(page.locator('text="Registrert inntekt"')).toBeVisible();
      await expect(page.locator('text="16 000,00 kr/måned"')).toBeVisible();
      await expect(page.locator('text="Nyansatt"')).toBeVisible();
    });

    await test.step('Verifiser refusjon - full lønn i arbeidsgiverperioden', async () => {
      await expect(page.getByRole('heading', { name: 'Refusjon' })).toBeVisible();
      await expect(
        page.locator('text="Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?"')
      ).toBeVisible();
      await expect(page.locator('text="Nei"').first()).toBeVisible();
      await expect(page.locator('text="Utbetalt under arbeidsgiverperiode"')).toBeVisible();
      await expect(page.locator('text="0 kr"')).toBeVisible();
      await expect(page.locator('text="Begrunnelse for ingen eller redusert utbetaling"')).toBeVisible();
      await expect(page.locator('text="Arbeidsforholdet er avsluttet"')).toBeVisible();
    });

    await test.step('Verifiser refusjon under sykefraværet', async () => {
      await expect(
        page.locator('text="Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?"')
      ).toBeVisible();
      await expect(page.locator('text="Ja"').first()).toBeVisible();
      await expect(page.locator('text=/Refusjonsbeløp per måned/')).toBeVisible();
      await expect(page.locator('text="8 000,00 kr/måned"')).toBeVisible();
    });

    await test.step('Verifiser refusjonsendringer', async () => {
      await expect(page.locator('text="Dato for endring"')).toBeVisible();
      await expect(page.locator('text="Endret refusjonsbeløp"')).toBeVisible();
      await expect(page.locator('text="10.12.2025"')).toBeVisible();
      await expect(page.locator('text="12.12.2025"')).toBeVisible();
      await expect(page.locator('text="14.12.2025"')).toBeVisible();
      await expect(page.locator('text="11 234,00"')).toBeVisible();
    });

    await test.step('Verifiser naturalytelser', async () => {
      await expect(page.getByRole('heading', { name: 'Naturalytelser' })).toBeVisible();
      await expect(page.locator('text="Type ytelse"')).toBeVisible();
      await expect(page.locator('text="Bortfallsdato"')).toBeVisible();

      await expect(page.locator('text="Fri transport"')).toBeVisible();
      await expect(page.locator('text="2 000,00 kr"')).toBeVisible();

      await expect(page.locator('text="Kostbesparelse i hjemmet"')).toBeVisible();
      await expect(page.locator('text="1 000,00 kr"')).toBeVisible();

      await expect(page.locator('text="Bolig"')).toBeVisible();
      await expect(page.locator('text="5 000,00 kr"')).toBeVisible();

      await expect(page.locator('text="Losji"')).toBeVisible();
      await expect(page.locator('text="1 234,00 kr"')).toBeVisible();

      await expect(page.locator('text="Kost (dager)"')).toBeVisible();
      await expect(page.locator('text="1 500,00 kr"')).toBeVisible();

      const bortfallsdatoer = page.locator('text="01.11.2025"');
      await expect(bortfallsdatoer).toHaveCount(5);
    });

    await test.step('Verifiser kvitteringstekst vises', async () => {
      const kvitteringsTekst = page.locator('text=/Kvittering - innsendt inntektsmelding/').last();
      await expect(kvitteringsTekst).toBeVisible();
    });

    await test.step('Verifiser knapper', async () => {
      await expect(page.getByRole('button', { name: 'Endre' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Lukk' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Skriv ut' })).toBeVisible();
    });
  });
});
