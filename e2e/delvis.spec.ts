import { test, expect } from '@playwright/test';

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(require('../mockdata/trenger-delvis.json'))
      })
    );

    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
  });

  test('No changes and submit', async ({ page }) => {
    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await page
      .getByRole('group', {
        name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 02.01.2023 og 25.02.2023 (start av nytt sykefravær)?'
      })
      .getByLabel('Nei')
      .check();

    await page
      .getByRole('group', { name: 'Er det endringer i refusjonskravet etter 25.02.2023 (start av nytt sykefravær)?' })
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
        beloep: 46000,
        inntektsdato: '2023-02-25',
        naturalytelser: [],
        endringAarsak: null
      },
      refusjon: {
        beloepPerMaaned: 46000,
        sluttdato: null,
        endringer: [
          {
            beloep: 0,
            startdato: '2023-09-30'
          }
        ]
      },
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL('http://localhost:3000/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();

    await expect(page.getByText('24.01.2023')).not.toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/25.02.2023/);
  });

  test('Changes and submit', async ({ page }) => {
    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await page
      .getByRole('group', {
        name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 02.01.2023 og 25.02.2023 (start av nytt sykefravær)?'
      })
      .getByLabel('Ja')
      .check();

    await expect(page.getByLabel('Månedsinntekt 25.02.2023')).toHaveValue('46000');
    await page.getByLabel('Månedsinntekt 25.02.2023').fill('50000');

    await page
      .getByRole('group', { name: 'Er det endringer i refusjonskravet etter 25.02.2023 (start av nytt sykefravær)?' })
      .getByLabel('Ja')
      .check();

    await page.getByLabel('Telefon innsender').fill('12345678');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    await page.getByRole('button', { name: 'Send' }).click();

    // await expect(page.getByText('Vennligst angi årsak for endringen.')).toBeVisible();
    await page.getByLabel('Velg endringsårsak').selectOption('Bonus');

    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    await page.getByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).getByLabel('Nei').check();
    // URL: http://localhost:3000/im-dialog/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012

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
        inntektsdato: '2023-02-25',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' }
      },
      refusjon: {
        beloepPerMaaned: 46000,
        sluttdato: null,
        endringer: [
          {
            beloep: 0,
            startdato: '2023-09-30'
          }
        ]
      },
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL('http://localhost:3000/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    // await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();

    await expect(page.getByText('12345678')).toBeVisible();
    await expect(page.getByText(/Bonus/)).toBeVisible();
    await expect(page.getByText(/50\s?000,00\s?kr\/måned/)).toBeVisible();
    await expect(page.getByText(/46\s?000,00\s?kr\/måned/)).toBeVisible();
    await expect(page.getByText('24.01.2023')).not.toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/25.02.2023/);
  });
});
