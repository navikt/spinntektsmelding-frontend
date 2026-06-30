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

async function openRefusjonEditingIfNeeded(page: Page) {
  const refusjonInput = page.getByLabel('Oppgi refusjonsbeløpet per måned');
  if (await refusjonInput.count()) {
    return;
  }

  const endreButtons = page.getByRole('button', { name: 'Endre' });
  if (await endreButtons.count()) {
    await endreButtons.last().click();
  }
}

const uuid = 'f46623ac-fe65-403c-9b91-41db41d3a232';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema – refusjon', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // navigate to form
    await page.goto(baseUrl);
  });

  test('submit inntektsmelding that only requires refusjon', async ({ page }) => {
    const formPage = new FormPage(page);
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await answerFullLonnIfVisible(page);
    await fillKortAgpIfVisible(page);

    await formPage.fillInput('Telefon innsender', '12345678');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await fillKortAgpIfVisible(page);
    await answerFullLonnIfVisible(page);

    // submit

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toMatchObject({
      forespoerselId: uuid,
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('submit inntektsmelding that only requires refusjon, change refusjonsdata - refusjon higher than inntekt', async ({
    page
  }) => {
    const formPage = new FormPage(page);
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await answerFullLonnIfVisible(page);
    await fillKortAgpIfVisible(page);

    await formPage.fillInput('Telefon innsender', '12345678');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await openRefusjonEditingIfNeeded(page);

    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '77000');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    await formPage.fillInput('Endret beløp/måned', '75000');

    await formPage.fillInput('Dato for endring', '01.06.25');
    await fillKortAgpIfVisible(page);

    // await formPage.clickButton('Send');
    // await formPage.assertNotVisibleText('Refusjonsbeløpet kan ikke være høyere enn inntekten.');
    // submit

    // await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '51333');
    await formPage.fillInput('Endret beløp/måned', '50000');
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await fillKortAgpIfVisible(page);
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );
    // 51333;

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toMatchObject({
      forespoerselId: uuid,
      refusjon: {
        beloepPerMaaned: 77000,
        endringer: [
          {
            beloep: 50000,
            startdato: '2025-06-01'
          }
        ],
        sluttdato: null
      },
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('submit inntektsmelding that only requires refusjon, change refusjonsdata - refusjon lower than inntekt', async ({
    page
  }) => {
    const formPage = new FormPage(page);
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await answerFullLonnIfVisible(page);
    await fillKortAgpIfVisible(page);

    await formPage.fillInput('Telefon innsender', '12345678');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await openRefusjonEditingIfNeeded(page);

    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '50000');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    await formPage.fillInput('Endret beløp/måned', '45000');

    await formPage.fillInput('Dato for endring', '01.06.25');
    await fillKortAgpIfVisible(page);

    // submit

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toMatchObject({
      forespoerselId: uuid,
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [
          {
            beloep: 45000,
            startdato: '2025-06-01'
          }
        ],
        sluttdato: null
      },
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('submit inntektsmelding that only requires refusjon, change refusjonsdata - one refusjon endring and beløp is 0', async ({
    page
  }) => {
    const formPage = new FormPage(page);
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await answerFullLonnIfVisible(page);
    await fillKortAgpIfVisible(page);

    await formPage.fillInput('Telefon innsender', '12345678');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await openRefusjonEditingIfNeeded(page);

    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '50000');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    await formPage.fillInput('Endret beløp/måned', '0');

    await formPage.fillInput('Dato for endring', '01.06.25');
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await fillKortAgpIfVisible(page);

    // submit

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toMatchObject({
      forespoerselId: uuid,
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [
          {
            beloep: 0,
            startdato: '2025-06-01'
          }
        ],
        sluttdato: null
      },
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await formPage.assertVisibleTextAtLeastOnce('Kvittering - innsendt inntektsmelding');
    await formPage.assertVisibleTextAtLeastOnce('Endret refusjonsbeløp');
    await formPage.assertVisibleTextAtLeastOnce('01.06.2025');
  });
});
