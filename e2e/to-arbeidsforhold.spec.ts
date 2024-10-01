import { test, expect, selectors } from '@playwright/test';
import clickSubmit from './helpers/clickSubmit';
import checkRadiobox from './helpers/checkRadiobox';

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    selectors.setTestIdAttribute('data-cy');
  });

  test('can check the radioboxes for refusjon and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(require('../mockdata/trenger-to-arbeidsforhold.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', (route) =>
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

    await page.fill('label:text("Telefon innsender")', '12345678');

    await checkRadiobox(page, 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    await checkRadiobox(page, 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?', 'Nei');

    await page
      .getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.')
      .dispatchEvent('click');

    const requestPromise = page.waitForRequest(
      '*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012'
    );
    await clickSubmit(page);
    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: {
        perioder: [{ fom: '2023-09-04', tom: '2023-09-19' }],
        egenmeldinger: [],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 45000,
        inntektsdato: '2023-08-23',
        naturalytelser: [],
        endringAarsak: null
      },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
    await expect(page.locator('text=Sykmelding')).toBeVisible();
    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/23.08.2023/);
  });
});
