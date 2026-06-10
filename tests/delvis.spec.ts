import { test, expect, Page } from '@playwright/test';
import { FormPage } from './utils/formPage';

async function answerFullLonnIfVisible(page: Page) {
  const fullLonnGroup = page.getByRole('radiogroup', { name: /Betaler arbeidsgiver ut full lønn/i });
  if (await fullLonnGroup.count()) {
    const yesOption = fullLonnGroup.getByLabel('Ja');
    if (await yesOption.isEnabled()) {
      await yesOption.check();
    }
  }
}

async function setIngenArbeidsgiverperiodeIfVisible(page: Page) {
  const checkbox = page.getByLabel('Det er ikke arbeidsgiverperiode i dette sykefraværet');
  if (await checkbox.count()) {
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }
}

async function fillKortAgpIfVisible(page: Page) {
  const beloepInput = page.locator('#agp-redusertloenniagp-beloep');
  if (await beloepInput.count()) {
    const existing = await beloepInput.inputValue();
    if (!existing) {
      await beloepInput.fill('5000');
    }
  }

  const begrunnelseSelectById = page.locator('#agp-redusertloenniagp-begrunnelse');
  const begrunnelseSelect =
    (await begrunnelseSelectById.count()) > 0
      ? begrunnelseSelectById
      : page.getByRole('combobox', { name: /Velg begrunnelse/i });
  if (await begrunnelseSelect.count()) {
    if (await begrunnelseSelect.isEnabled()) {
      const selected = await begrunnelseSelect.inputValue();
      if (!selected || /velg\s+begrunnelse/i.test(selected)) {
        await begrunnelseSelect.selectOption({ label: 'Ansatt har ikke hatt fravær fra jobb' });
      }
    }
  }
}

async function openInntektEditingIfNeeded(page: Page, inntektLabel: string) {
  const inntektInput = page.getByLabel(inntektLabel);
  if (await inntektInput.count()) {
    return;
  }

  const endreButtons = page.getByRole('button', { name: 'Endre' });
  if (await endreButtons.count()) {
    await endreButtons.last().click();
  }
}

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // intercept hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    // intercept collect
    await page.route('**/collect', (route) => route.fulfill({ status: 202, body: 'OK' }));

    // intercept innsendingInntektsmelding → success
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await page.goto('http://localhost:3000/im-dialog/ac33a4ae-e1bd-4cab-9170-b8a01a13471e');
  });

  test('No changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await answerFullLonnIfVisible(page);
    await fillKortAgpIfVisible(page);
    // select "Nei" in refusjon group
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');

    // fill phone
    await page.getByLabel('Telefon innsender').fill('12345678');
    // confirm
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await fillKortAgpIfVisible(page);
    // submit
    const pageLoad = page.waitForRequest('**/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await pageLoad;
    // assert request body
    expect(JSON.parse(req.postData()!)).toMatchObject({
      forespoerselId: 'ac33a4ae-e1bd-4cab-9170-b8a01a13471e',
      inntekt: {
        beloep: 36000,
        inntektsdato: '2024-12-05',
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // verify navigation and UI
    // await expect(page).toHaveURL(/\/im-dialog\/kvittering\/12345678/);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toContainText('05.12.2024');
  });

  test('Changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);

    await setIngenArbeidsgiverperiodeIfVisible(page);
    await openInntektEditingIfNeeded(page, 'Månedslønn 05.12.2024');

    // update income
    const label = page.getByLabel('Månedslønn 05.12.2024');
    await expect(label).toHaveValue('36000');
    await label.fill('50000');

    // change refusjon to "Ja"
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
    await answerFullLonnIfVisible(page);

    await page.getByLabel('Telefon innsender').fill('12345678');
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await fillKortAgpIfVisible(page);
    await formPage.clickButton('Send');

    // validation error for missing årsak
    const elements = page.locator('text="Vennligst angi årsak til endringen."');
    await expect(elements).toHaveCount(2);

    await page.getByLabel('Velg endringsårsak').selectOption('Bonus');

    // set refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );
    await formPage.fillInput('Endret beløp/måned', '45000');
    await page.getByLabel('Dato for endring').fill('30.09.2025');
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await fillKortAgpIfVisible(page);
    const req2 = page.waitForResponse('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const responsData = await req2;

    expect(JSON.parse(responsData.request().postData()!)).toMatchObject({
      forespoerselId: 'ac33a4ae-e1bd-4cab-9170-b8a01a13471e',
      inntekt: {
        beloep: 50000,
        inntektsdato: '2024-12-05',
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 50000,
        sluttdato: null,
        endringer: [{ beloep: 45000, startdato: '2025-09-30' }]
      },
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    await formPage.assertVisibleTextAtLeastOnce('Kvittering - innsendt inntektsmelding');
    await formPage.assertVisibleText('Bonus');
    await formPage.assertVisibleText('45 000,00');
  });
});
