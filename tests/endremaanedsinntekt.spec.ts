import { test, expect } from '@playwright/test';
// import originalData from '../mockdata/trenger-originalen.json';
import { FormPage } from './utils/formPage';

const uuid = '588e055c-5d72-449b-b88f-56aa43457668';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema – endre månedsinntekt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('kan endre bruttoinntekt og refusjon', async ({ page }) => {
    const formPage = new FormPage(page);

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

    await formPage.fillInput('Månedslønn 15.03.2023', '70000kroner');

    // send for validering
    await formPage.clickButton('Send');

    // feilmeldinger vises
    await Promise.all([
      // formPage.assertVisibleTextAtLeastOnce('Vennligst angi bruttoinntekt på formatet 1234,50'),
      formPage.assertVisibleTextAtLeastOnce('Vennligst angi årsak til endringen.')
    ]);

    // skriv gyldig beløp
    await formPage.fillInput('Månedslønn 15.03.2023', '70000');
    await expect(page.getByText('Vennligst angi bruttoinntekt på formatet 1234,50')).toHaveCount(0);

    // sjekk at refusjon beløp oppdateres
    const text = await page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]').textContent();
    expect(text).toMatch(/70\s000,00\skr\/måned/);

    // endre refusjonsbeløp
    await page.locator('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();
    await formPage.fillInput('Månedslønn 15.03.2023', '75000');
    await expect(page.getByLabel('Oppgi refusjonsbeløpet per måned')).toHaveValue('70000');
  });
});
