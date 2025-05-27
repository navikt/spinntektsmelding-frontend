import { test, expect } from '@playwright/test';
import originalData from '../mockdata/trenger-originalen.json';
import { FormPage } from './utils/formPage';

const uuid = '12345678-3456-5678-2457-123456789012';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema – endre månedsinntekt', () => {
  test.beforeEach(async ({ page }) => {
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (r) =>
      r.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );
    // stub forespørsel
    await page.route('*/**/api/hent-forespoersel', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(originalData) })
    );
    // navigate to form
    await page.goto(baseUrl);
  });

  test('kan endre bruttoinntekt og refusjon', async ({ page }) => {
    const formPage = new FormPage(page);
    await page.waitForResponse('*/**/api/hent-forespoersel');

    // velg full lønn og refusjon
    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    // klikk for å endre inntekt
    await page.locator('[data-cy="endre-beloep"]').click();
    // bekreft opplysninger
    await page.locator('#bekreft-opplysninger').check();

    // skriv ugyldig beløp
    const incomeInput = page.locator('[data-cy="inntekt-beloep-input"]');
    await incomeInput.fill('70000kroner');

    // send for validering
    await page.getByRole('button', { name: 'Send' }).click();

    // feilmeldinger vises
    await expect(page.getByText('Vennligst angi bruttoinntekt på formatet 1234,50').first()).toBeVisible();
    await expect(page.getByText('Vennligst angi årsak til endringen.').first()).toBeVisible();

    // skriv gyldig beløp
    await incomeInput.fill('70000');
    await expect(page.getByText('Vennligst angi bruttoinntekt på formatet 1234,50')).toHaveCount(0);

    // sjekk at refusjon beløp oppdateres
    const text = await page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]').textContent();
    expect(text).toMatch(/70\s000,00\skr\/måned/);

    // endre refusjonsbeløp
    await page.locator('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();
    await incomeInput.fill('75000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep-input"]')).toHaveValue('75000');
  });
});
