import { test, expect } from '@playwright/test';
import trengerDelvis from '../mockdata/trenger-delvis.json';
import inntektData from '../mockdata/inntektData.json';
import kvitteringData from '../mockdata/kvittering-delvis.json';
import { FormPage } from './utils/formPage';

const uuid = '8d50ef20-37b5-4829-ad83-56219e70b375';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // stub collect beacon
    await page.route('**/collect', (r) => r.fulfill({ status: 202, body: 'OK' }));

    // mark as besvart
    trengerDelvis.erBesvart = true;

    // stub API
    await page.route('**/api/hent-forespoersel/*', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(trengerDelvis), contentType: 'application/json' })
    );
    await page.route('**/api/inntektsdata', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(inntektData), contentType: 'application/json' })
    );
    await page.route('**/api/hentKvittering/**', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(kvitteringData), contentType: 'application/json' })
    );
    await page.route('**/api/innsendingInntektsmelding', (r) =>
      r.fulfill({ status: 201, body: JSON.stringify({ name: 'Nothing' }), contentType: 'application/json' })
    );

    const response = page.waitForResponse('**/api/hent-forespoersel/*');
    const kvitteringResponse = page.waitForResponse(`**/api/hentKvittering/${uuid}`);
    await page.goto(baseUrl);
    const [forespoerselResp, kvitteringResp] = await Promise.all([response, kvitteringResponse]);
  });

  test('Changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);

    await test.step('Gå til kvitteringsside og trykk Endre', async () => {
      await expect(page).toHaveURL(/\/im-dialog\/kvittering\/8d50ef20-37b5-4829-ad83-56219e70b375/);
      await page.getByRole('button', { name: /Endre/ }).first().click();
      await expect(page).toHaveURL(baseUrl);
    });

    await test.step('Oppdater månedslønn', async () => {
      await page.getByRole('button', { name: /Endre/ }).nth(1).click();

      const incomeInput = page.getByLabel('Månedslønn 02.01.2023');
      await expect(incomeInput).toBeVisible();
      await expect(incomeInput).toHaveValue('65000');
      await incomeInput.fill('50000');
    });

    await test.step('Velg endringsårsak og refusjon', async () => {
      await formPage.selectOption('Velg endringsårsak', 'Bonus');
      await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
    });

    await test.step('Bekreft telefonnummer og kryss av', async () => {
      const tlf = page.getByLabel('Telefon innsender');
      await expect(tlf).toHaveValue('12345678');

      await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    });

    await test.step('Oppdater refusjonsbeløp', async () => {
      await page.getByRole('button', { name: /Endre/ }).nth(1).click();

      const refusjonInput = page.getByLabel('Oppgi refusjonsbeløpet per måned');
      await expect(refusjonInput).toBeVisible();
      await refusjonInput.fill('50000');
    });

    await test.step('Send inn og verifiser payload', async () => {
      const reqPromise = page.waitForRequest('**/api/innsendingInntektsmelding');
      await formPage.clickButton('Send');
      const req = await reqPromise;
      const body = JSON.parse(req.postData()!);

      expect(body).toEqual({
        forespoerselId: uuid,
        agp: null,
        inntekt: {
          beloep: 50000,
          inntektsdato: '2023-01-02',
          naturalytelser: [],
          endringAarsaker: [{ aarsak: 'Bonus' }]
        },
        refusjon: {
          beloepPerMaaned: 50000,
          sluttdato: null,
          endringer: []
        },
        avsenderTlf: '12345678'
      });
    });

    await test.step('Verifiser kvitteringssiden', async () => {
      await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/02.01.2023/);
      await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
      await expect(page.locator('text="12345678"')).toBeVisible();
      await expect(page.locator('text="Bonus"')).toBeVisible();
      await expect(page.locator('text="50 000,00 kr/måned"').first()).toBeVisible();
    });
  });
});
