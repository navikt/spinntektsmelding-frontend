import { test, expect } from '@playwright/test';
import checkRadiobox from './helpers/checkRadiobox';

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/collect', async (route) => {
      await route.fulfill({
        status: 202,
        body: 'OK'
      });
    });

    await page.route('*/**/api/hentKvittering/8d50ef20-37b5-4829-ad83-56219e70b375', async (route) => {
      await route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });
  });

  test('No changes and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', async (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-delvis-refusjon.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', async (route) => {
      await route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await page
      .getByRole('group', {
        name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 01.07.2023 og 08.08.2023 (start av nytt sykefravær)?'
      })
      .getByLabel('Nei')
      .dispatchEvent('click');

    await page
      .getByRole('group', { name: 'Er det endringer i refusjonskravet etter 08.08.2023 (start av nytt sykefravær)?' })
      .getByLabel('Nei')
      .check();

    await page.getByLabel('Telefon innsender').fill('12345678');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    const requestPromise = page.waitForRequest(
      '*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012'
    );
    await page.getByRole('button', { name: 'Send' }).click();

    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 26000,
        inntektsdato: '2023-08-08',
        naturalytelser: [],
        endringAarsak: null
      },
      refusjon: { beloepPerMaaned: 10000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    // await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    // await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();

    await expect(page.getByText('24.01.2023')).not.toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/08.08.2023/);
  });

  test('Changes and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', async (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-delvis-refusjon.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', async (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // await page.route('http://localhost:12347/collect', async (route) =>
    //   route.fulfill({
    //     status: 202,
    //     body: 'OK'
    //   })
    // );
    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    // await page.waitForResponse('*/**/api/hent-forespoersel');

    // await expect(page).toHaveURL('/im-dialog/endring/12345678-3456-5678-2457-123456789012');

    await page
      .getByRole('group', {
        name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 01.07.2023 og 08.08.2023 (start av nytt sykefravær)?'
      })
      .getByLabel('Ja')
      .check();

    await expect(page.getByLabel('Månedsinntekt 08.08.2023')).toHaveValue('26000');
    await page.getByLabel('Månedsinntekt 08.08.2023').fill('50000');

    await page
      .getByRole('group', { name: 'Er det endringer i refusjonskravet etter 08.08.2023 (start av nytt sykefravær)?' })
      .getByLabel('Ja')
      .check();

    await page.getByLabel('Telefon innsender').fill('12345678');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    await page.getByRole('button', { name: 'Send' }).click();

    // await expect(page.getByText('Vennligst angi årsak for endringen.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vennligst angi årsak for endringen.' })).toBeVisible();
    await page.getByLabel('Velg endringsårsak').selectOption('Varig lønnsendring');

    await page.getByLabel('Lønnsendring gjelder fra').fill('30.06.23');

    await page.getByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).getByLabel('Nei').check();

    const requestPromise = page.waitForRequest(
      '*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012'
    );

    await page.getByRole('button', { name: 'Send' }).click();

    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2023-08-08',
        naturalytelser: [],
        endringAarsak: {
          aarsak: 'VarigLoennsendring',
          gjelderFra: '2023-06-30'
        }
      },
      refusjon: { beloepPerMaaned: 10000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    // await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    // await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();

    await expect(page.getByText('12345678')).toBeVisible();
    await expect(page.getByText(/Varig lønnsendringsdato/)).toBeVisible();
    await expect(page.getByText(/30.06.2023/)).toBeVisible();
    await expect(page.getByText(/50\s?000,00\s?kr\/måned/)).toBeVisible();
    await expect(page.getByText('24.01.2023')).not.toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/08.08.2023/);
  });

  test('Changes to ferie and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-delvis-refusjon.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // await page.route('http://localhost:12347/collect', (route) =>
    //   route.fulfill({
    //     status: 202,
    //     body: 'OK'
    //   })
    // );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    // await page.waitForResponse('*/**/api/hent-forespoersel');

    // await expect(page).toHaveURL('/im-dialog/endring/12345678-3456-5678-2457-123456789012');

    await checkRadiobox(
      page,
      'Har det vært endringer i beregnet månedslønn for den ansatte mellom 01.07.2023 og 08.08.2023 (start av nytt sykefravær)?',
      'Ja'
    );

    await expect(page.getByLabel('Månedsinntekt 08.08.2023')).toHaveValue('26000');
    await page.getByLabel('Månedsinntekt 08.08.2023').fill('50000');

    await page
      .getByRole('group', { name: 'Er det endringer i refusjonskravet etter 08.08.2023 (start av nytt sykefravær)?' })
      .getByLabel('Ja')
      .check();

    await page.getByLabel('Telefon innsender').fill('12345678');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    await page.getByRole('button', { name: 'Send' }).click();

    // await expect(page.getByText('Vennligst angi årsak for endringen.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vennligst angi årsak for endringen.' })).toBeVisible();
    await page.getByLabel('Velg endringsårsak').selectOption('Ferie');

    await page.getByLabel('Ferie fra').fill('30.06.2023');
    await page.getByLabel('Ferie til').fill('05.07.2023');

    await page.getByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).getByLabel('Nei').check();

    const requestPromise = page.waitForRequest(
      '*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012'
    );
    await page.getByRole('button', { name: 'Send' }).click();

    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2023-08-08',
        naturalytelser: [],
        endringAarsak: {
          aarsak: 'Ferie',
          ferier: [
            {
              fom: '2023-06-30',
              tom: '2023-07-05'
            }
          ]
        }
      },
      refusjon: { beloepPerMaaned: 10000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    // await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    // await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();

    await expect(page.getByText('12345678')).toBeVisible();
    // await expect(page.getByText(/Ferie/)).toBeVisible();
    await expect(page.getByText(/30.06.2023/)).toBeVisible();
    await expect(page.getByText(/05.07.2023/)).toBeVisible();
    await expect(page.getByText(/50\s?000,00\s?kr\/måned/)).toBeVisible();
    await expect(page.getByText('24.01.2023')).not.toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/08.08.2023/);
  });
});
