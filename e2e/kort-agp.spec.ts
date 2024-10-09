import { test, expect } from '@playwright/test';
import clickSubmit from './helpers/clickSubmit';
import checkRadiobox from './helpers/checkRadiobox';

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
  });

  test('can check the radioboxes for refusjon and submit', async ({ page }) => {
    await page.route('/im-dialog/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-originalen-16dager.json'))
      })
    );

    await page.route('/im-dialog/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.route('/im-dialog/api/inntektsdata', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/inntektData.json'))
      })
    );

    await page.waitForResponse('/im-dialog/api/hent-forespoersel');

    await page.locator('button:has-text("Endre")').first().dispatchEvent('click');

    await page.locator('label:has-text("Til")').last().fill('16.03.23');

    await page.getByLabel('Utbetalt under arbeidsgiverperiode').fill('50000');

    await page
      .locator('label:has-text("Velg begrunnelse for kort arbeidsgiverperiode")')
      .selectOption('Arbeidsforholdet er avsluttet');

    await checkRadiobox(page, 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?', 'Nei');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    const requestPromise = page.waitForRequest('/im-dialog/api/innsendingInntektsmelding');

    clickSubmit(page);

    const request = await requestPromise;

    const requestBody = JSON.parse(request.postData());
    expect(requestBody).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: {
        perioder: [
          {
            fom: '2023-02-20',
            tom: '2023-03-04'
          },
          {
            fom: '2023-03-15',
            tom: '2023-03-16'
          }
        ],
        egenmeldinger: [],
        redusertLoennIAgp: { beloep: 50000, begrunnelse: 'ArbeidOpphoert' }
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        naturalytelser: [],
        endringAarsak: null
      },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    // await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
  });
});
