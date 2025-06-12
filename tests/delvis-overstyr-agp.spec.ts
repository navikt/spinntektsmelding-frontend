import { test, expect } from '@playwright/test';
import { FormPage } from './utils/formPage';
import trengerDelvis from '../mockdata/trenger-delvis-enkel-variant.json';

test('Delvis skjema - Utfylling og innsending av skjema', async ({ page, request }) => {
  const formPage = new FormPage(page);
  // Intercept API calls
  await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) => {
    route.fulfill({
      status: 404,
      body: JSON.stringify({
        name: 'Nothing'
      })
    });
  });

  await page.route('*/**/api/hent-forespoersel/*', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(trengerDelvis)
    });
  });

  await page.route('*/**/api/innsendingInntektsmelding', (route) => {
    route.fulfill({
      status: 201,
      body: JSON.stringify({
        name: 'Nothing'
      })
    });
  });

  // Visit the page
  await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

  // Wait for the API to be loaded
  await page.waitForResponse('*/**/api/hent-forespoersel/*');

  // Simulate interaction
  await page.waitForTimeout(5000);
  await page.locator('button:has-text("Endre")').first().click();

  await page.fill('label:text("Fra")', '01.02.2023');
  await page.fill('label:text("Til")', '16.02.2023');

  const endreKnapp2 = page.locator('button:has-text("Endre")').nth(0);
  await endreKnapp2.click();

  const maanedslonn = page.locator('label:has-text("Månedslønn 05.12.2024")');
  await expect(maanedslonn).toHaveValue('36000');
  await page.fill('label:has-text("Månedslønn 05.12.2024")', '50000');

  await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

  await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

  await formPage.fillInput('Telefon innsender', '12345678');

  await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

  await formPage.clickButton('Send');

  // Assert for error
  await expect(page.locator('text="Vennligst angi årsak til endringen."').first()).toBeVisible();
  await formPage.selectOption('Velg endringsårsak', 'Bonus');

  await formPage.checkRadioButton(
    'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
    'Ja'
  );

  await formPage.fillInput('Endret beløp/måned', '45000');
  await formPage.fillInput('Dato for endring', '30.09.2025');

  const responsePromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
  await formPage.clickButton('Send');
  const response = await responsePromise;

  // Verify request body
  const requestBody = JSON.parse(response.postData()!);
  expect(requestBody).toEqual({
    forespoerselId: '12345678-3456-5678-2457-123456789012',
    agp: {
      egenmeldinger: [],
      perioder: [
        {
          fom: '2023-02-01',
          tom: '2023-02-16'
        }
      ],
      redusertLoennIAgp: null
    },
    inntekt: {
      beloep: 50000,
      inntektsdato: '2024-12-05',
      naturalytelser: [],
      endringAarsaker: [{ aarsak: 'Bonus' }]
    },
    refusjon: {
      beloepPerMaaned: 50000,
      sluttdato: null,
      endringer: [
        {
          beloep: 45000,
          startdato: '2025-09-30'
        }
      ]
    },
    avsenderTlf: '12345678'
  });

  // Check final page
  await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/05.12.2024/);
  await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  await expect(page.locator('text="12345678"')).toBeVisible();
  await expect(page.locator('text="Bonus"')).toBeVisible();
  await expect(page.locator('text="50 000,00 kr/måned"').first()).toBeVisible();
  await expect(page.locator('text="45 000,00"').first()).toBeVisible();
});
