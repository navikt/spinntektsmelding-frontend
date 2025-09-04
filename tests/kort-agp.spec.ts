import { test, expect } from '@playwright/test';
import originalData from '../mockdata/trenger-originalen-16dager.json';
import inntektData from '../mockdata/inntektData.json';
import { FormPage } from './utils/formPage';

test.describe('Utfylling og innsending av skjema – kort arbeidsgiverperiode', () => {
  const uuid = '8d50ef20-37b5-4829-ad83-56219e70b375';
  const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

  test.beforeEach(async ({ page }) => {
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // stub hent-forespoersel
    await page.route('*/**/api/hent-forespoersel/*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(originalData)
      })
    );
    // stub inntektsdata
    await page.route('*/**/api/inntektsdata', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(inntektData)
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

    const response = page.waitForResponse('*/**/api/hent-forespoersel/*');
    await page.goto(baseUrl);
    await response;
  });

  test('can check the radioboxes for refusjon and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    // click første "Endre"
    await page.getByRole('button', { name: /Endre/ }).first().click();

    // endre siste "Til"-dato
    // await page.getByLabel('Til').nth(1).fill('16.03.23');
    const TilFelt = await formPage.getInput('Til');
    await expect(TilFelt.last()).toBeVisible();
    await TilFelt.last().fill('');
    await TilFelt.last().fill('16.03.23');

    // endre utbetalt beløp under arbeidsgiverperiode
    await formPage.fillInput('Utbetalt under arbeidsgiverperiode', '50000');

    // velg begrunnelse for kort arbeidsgiverperiode
    await page.getByLabel('Velg begrunnelse for kort arbeidsgiverperiode').selectOption({
      label: 'Arbeidsforholdet er avsluttet'
    });

    // velg "Nei" for refusjon under sykefraværet
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Nei')
      .check();

    // bekreft opplysninger
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // send inn skjemaet

    // avvent innsending-request og sjekk payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;

    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [
          { fom: '2023-02-20', tom: '2023-03-04' },
          { fom: '2023-03-15', tom: '2023-03-16' }
        ],
        egenmeldinger: [],
        redusertLoennIAgp: { beloep: 50000, begrunnelse: 'ArbeidOpphoert' }
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        naturalytelser: [],
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    // bekreft kvitteringsside
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });
});
