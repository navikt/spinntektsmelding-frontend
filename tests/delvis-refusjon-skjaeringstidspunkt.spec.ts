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

test.describe('Delvis skjema – Utfylling og innsending av skjema (refusjon skjæringstidspunkt)', () => {
  test.beforeEach(async ({ page }) => {
    // stub beacon
    await page.route('**/collect', (route) => route.fulfill({ status: 202, body: 'OK' }));
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // stub innsending
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.goto('http://localhost:3000/im-dialog/60c85231-d13c-49a2-bef3-1cb493d33f3b');
  });

  test('No changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    await setIngenArbeidsgiverperiodeIfVisible(page);
    await answerFullLonnIfVisible(page);
    await fillKortAgpIfVisible(page);
    // select "Nei" for refusjon
    await page
      .getByRole('radiogroup', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Nei')
      .check();
    // fill phone + confirm
    await page.getByLabel('Telefon innsender').fill('12345678');
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();
    await fillKortAgpIfVisible(page);

    // submit
    // assert payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;

    expect(JSON.parse(req.postData()!)).toMatchObject({
      forespoerselId: '60c85231-d13c-49a2-bef3-1cb493d33f3b',
      inntekt: {
        beloep: 55000,
        inntektsdato: '2023-09-18',
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });
    // confirmation page
    await page.waitForURL('/im-dialog/kvittering/60c85231-d13c-49a2-bef3-1cb493d33f3b?fromSubmit=true');
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    // the old bfd date should not appear
    await expect(await formPage.getByText('24.01.2023')).toHaveCount(0);
    // new bfd

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/18\.09\.2023/);
  });

  test('Changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    await setIngenArbeidsgiverperiodeIfVisible(page);
    // click second "Endre"
    await openInntektEditingIfNeeded(page, 'Månedslønn 18.09.2023');
    await fillKortAgpIfVisible(page);
    await page.waitForURL('**/im-dialog/60c85231-d13c-49a2-bef3-1cb493d33f3b');
    // update salary
    const salary = page.getByLabel('Månedslønn 18.09.2023');
    await expect(salary).toHaveValue('55000');
    await salary.fill('60000');
    // fill phone + confirm
    await formPage.fillInput('Telefon innsender', '12345678');
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    // initial submit → validation error
    await formPage.clickButton('Send');
    await expect((await formPage.getByText('Vennligst angi årsak til endringen.')).first()).toBeVisible();
    // select årsak + refusjon = Ja
    await formPage.selectOption('Velg endringsårsak', 'Bonus');
    await page
      .getByRole('radiogroup', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();
    await answerFullLonnIfVisible(page);
    // click second "Endre" again to set refusjonsbeløp
    await openRefusjonEditingIfNeeded(page);
    await page.getByLabel('Oppgi refusjonsbeløpet per måned').fill('55000');
    // choose "Nei" for endringer opphør
    await page
      .getByRole('radiogroup', {
        name: 'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?'
      })
      .getByLabel('Nei')
      .check();
    await fillKortAgpIfVisible(page);
    // final submit
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req2 = await reqPromise;
    // assert payload
    expect(JSON.parse(req2.postData()!)).toMatchObject({
      forespoerselId: '60c85231-d13c-49a2-bef3-1cb493d33f3b',
      inntekt: {
        beloep: 60000,
        inntektsdato: '2023-09-18',
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: { beloepPerMaaned: 55000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });
    // final confirmation

    await page.waitForURL('/im-dialog/kvittering/60c85231-d13c-49a2-bef3-1cb493d33f3b?fromSubmit=true');
    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/18\.09\.2023/);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="Bonus"')).toBeVisible();
    await expect(page.locator('text="60 000,00 kr/måned"').first()).toBeVisible();
  });
});
