import { test, expect, Page } from '@playwright/test';
import { FormPage } from './utils/formPage';

async function answerFullLonnIfVisible(page: Page) {
  const fullLonnGroup = page.getByRole('radiogroup', { name: /Betaler arbeidsgiver ut full lønn/i });
  if (await fullLonnGroup.count()) {
    await fullLonnGroup.getByLabel('Ja').check();
  }
}

async function openArbeidsgiverperiodeIfNeeded(page: Page) {
  const fraInput = page.getByRole('textbox', { name: 'Fra' }).first();

  if (await fraInput.isVisible().catch(() => false)) {
    return;
  }

  const endreButton = page.getByRole('button', { name: 'Endre' }).first();
  await expect(endreButton).toBeVisible();
  await endreButton.click();
  await expect(fraInput).toBeVisible();
}

async function openInntektEditingIfNeeded(page: Page) {
  const inntektInput = page.getByLabel(/Månedslønn \d{2}\.\d{2}\.\d{4}/).first();

  if (await inntektInput.isVisible().catch(() => false)) {
    return;
  }

  const endreButtons = page.getByRole('button', { name: 'Endre' });
  await expect(endreButtons.first()).toBeVisible();
  await endreButtons.last().click();
  await expect(inntektInput).toBeVisible();
}

const uuid = 'ac33a4ae-e1bd-4cab-9170-b8a01a13471e';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test('Delvis skjema - Utfylling og innsending av skjema', async ({ page, request }) => {
  const formPage = new FormPage(page);

  await page.route('*/**/api/innsendingInntektsmelding', (route) => {
    route.fulfill({
      status: 201,
      body: JSON.stringify({
        name: 'Nothing'
      })
    });
  });

  // Wait for the API to be loaded
  // const apiResponse = page.waitForResponse('*/**/api/hent-forespoersel/*');
  // Visit the page
  await page.goto(baseUrl);

  // Simulate interaction
  await openArbeidsgiverperiodeIfNeeded(page);

  await formPage.fillInput('Fra', '06.12.2024');
  await formPage.fillInput('Til', '21.12.2024');

  await openInntektEditingIfNeeded(page);

  const inntekt = page.getByLabel(/Månedslønn \d{2}\.\d{2}\.\d{4}/).first();
  await expect(inntekt).toHaveValue('36000');
  await inntekt.fill('50000');

  await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');
  await answerFullLonnIfVisible(page);

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
    forespoerselId: uuid,
    agp: {
      perioder: [
        {
          fom: '2024-12-06',
          tom: '2024-12-21'
        }
      ],
      redusertLoennIAgp: null
    },
    inntekt: {
      beloep: 50000,
      inntektsdato: '2024-12-06',
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
    avsenderTlf: '12345678',
    naturalytelser: [],
    flereArbeidsforhold: null
  });

  // Check final page

  await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/06.12.2024/);
  await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  await expect(page.locator('text="12345678"')).toBeVisible();
  await expect(page.locator('text="Bonus"')).toBeVisible();
  await expect(page.locator('text="50 000,00 kr/måned"').first()).toBeVisible();
  await expect(page.locator('text="45 000,00"').first()).toBeVisible();
  await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
});
