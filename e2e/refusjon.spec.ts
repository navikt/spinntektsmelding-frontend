import { test, expect } from '@playwright/test';
import checkRadiobox from './helpers/checkRadiobox';
import clickSubmit from './helpers/clickSubmit';
import checkBekreftelse from './helpers/checkBekreftelse';

test.describe('Utfylling og innsending av skjema', () => {
  // test.beforeEach(async ({ page }) => {});

  test('can check the radioboxes for refusjon and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({ body: JSON.stringify(require('../mockdata/trenger-originalen.json')) })
    );

    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await checkRadiobox(page, 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    await checkRadiobox(page, 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?', 'Ja');

    await checkRadiobox(page, 'Er det endringer i refusjonsbeløpet i perioden?', 'Nei');
    // await page.locator('role=group[name=/Er det endringer i refusjonsbeløpet i perioden?/]').locator('role=radio[name="Nei"]').click();
    await checkRadiobox(page, 'Opphører refusjonkravet i perioden?', 'Nei');
    // await page.locator('role=group[name=/Opphører refusjonkravet i perioden?/]').locator('role=radio[name="Nei"]').click();

    await checkBekreftelse(page);

    const requestPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');

    await clickSubmit(page);

    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        naturalytelser: [],
        endringAarsak: null
      },
      refusjon: { beloepPerMaaned: 77000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
  });
});
