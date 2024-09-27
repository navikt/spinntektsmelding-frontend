import { test, expect } from '@playwright/test';
import trengerDelvisUtenBfd from '../mockdata/trenger-delvis-uten-bfd.json';

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });

    await page.route('http://localhost:12347/collect', async (route) => {
      route.fulfill({
        status: 202,
        body: 'OK'
      });
    });
  });

  test('No changes and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        status: 200,
        json: trengerDelvisUtenBfd
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', async (route) => {
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    // await page.waitForResponse((response) => response.url().includes('*/**/api/hent-forespoersel'));

    await page
      .getByRole('group', {
        name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 18.09.2023 og 07.01.2024 (start av nytt sykefravær)?'
      })
      .getByLabel('Nei')
      .check();

    await page
      .getByRole('group', {
        name: 'Er det endringer i refusjonskravet etter 07.01.2024 (start av nytt sykefravær)?'
      })
      .getByLabel('Nei')
      .check();

    await page.fill('label:text("Telefon innsender")', '12345678');

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
        beloep: 55000,
        inntektsdato: '2024-01-07',
        naturalytelser: [],
        endringAarsak: null
      },
      refusjon: { beloepPerMaaned: 55000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();

    await expect(page.locator('text="24.01.2023"')).not.toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/07.01.2024/);
  });

  test('Changes and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        status: 200,
        json: trengerDelvisUtenBfd
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', async (route) => {
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });

    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', async (route) => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    // await page.waitForResponse((response) => response.url().includes('*/**/api/hent-forespoersel'));

    // await expect(page).toHaveURL('/im-dialog/endring/12345678-3456-5678-2457-123456789012');

    await page
      .getByRole('group', {
        name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 18.09.2023 og 07.01.2024 (start av nytt sykefravær)?'
      })
      .getByLabel('Ja')
      .check();

    await expect(page.locator('label:text("Månedsinntekt 07.01.2024")')).toHaveValue('55000');
    await page.locator('label:text("Månedsinntekt 07.01.2024")').fill('60000');

    await page
      .getByRole('group', {
        name: 'Er det endringer i refusjonskravet etter 07.01.2024 (start av nytt sykefravær)?'
      })
      .getByLabel('Ja')
      .check();

    await page.locator('label:text("Telefon innsender")').type('12345678');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    await page.getByRole('button', { name: 'Send' }).click();

    // await expect(page.locator('text="Vennligst angi årsak for endringen."')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vennligst angi årsak for endringen.' })).toBeVisible();
    await page.locator('label:text("Velg endringsårsak")').selectOption('Bonus');

    // await page.locator('role=group[name="Opphører refusjonkravet i perioden?"]').locator('label:text("Nei")').check();
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
        beloep: 60000,
        inntektsdato: '2024-01-07',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' }
      },
      refusjon: { beloepPerMaaned: 55000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    // await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    // await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
    await expect(page.locator('text="12345678"')).toBeVisible();
    await expect(page.locator('text="Bonus"')).toBeVisible();
    await expect(page.locator('text="60 000,00 kr/måned"')).toBeVisible();
    await expect(page.locator('text="24.01.2023"')).not.toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/07.01.2024/);
  });
});
