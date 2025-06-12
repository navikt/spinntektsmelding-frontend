import { test, expect } from '@playwright/test';
import hentForespoersel from '../mockdata/trenger-originalen-16dager-innsendt.json';
import inntektData from '../mockdata/inntektData.json';
import kvitteringEkstern from '../mockdata/kvittering-eksternt-system.json';

test.describe('Delvis skjema – Innlogging fra ekstern kvittering', () => {
  const uuid = '12345678-3456-5678-2457-123456789012';
  const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

  test.beforeEach(async ({ page }) => {
    // stub collect beacon
    await page.route('**/collect', (r) => r.fulfill({ status: 202, body: 'OK' }));
    // stub hent-forespoersel
    await page.route('*/**/api/hent-forespoersel/*', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(hentForespoersel) })
    );
    // stub inntektsdata
    await page.route('*/**/api/inntektsdata', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(inntektData) })
    );
    // stub innsending
    await page.route('*/**/api/innsendingInntektsmelding', (r) =>
      r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );
    // stub hentKvittering → ekstern fixture
    await page.route('*/**/api/hentKvittering/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(kvitteringEkstern) })
    );

    await page.goto(baseUrl);
    await page.waitForResponse('*/**/api/hentKvittering/**');
  });

  test('Changes and submit', async ({ page }) => {
    // should redirect to receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);

    // click "sende den inn på nytt."
    await page.getByRole('link', { name: 'sende den inn på nytt.' }).click();
    await page.waitForURL(`**/im-dialog/${uuid}/overskriv`);

    // select full lønn = Ja
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    // select refusjon under sykefravær = Nei
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Nei')
      .check();

    // confirm
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // submit

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [
          { fom: '2023-02-20', tom: '2023-03-04' },
          { fom: '2023-03-15', tom: '2023-03-17' }
        ],
        egenmeldinger: [],
        redusertLoennIAgp: null
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

    // final confirmation
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="12345678"')).toBeVisible();
  });
});
