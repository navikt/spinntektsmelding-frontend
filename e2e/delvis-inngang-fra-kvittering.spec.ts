import { test, expect } from '@playwright/test';

import trengerDelvis from '../mockdata/trenger-delvis.json';
import kvitteringDelvis from '../mockdata/kvittering-delvis.json';

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // so we must tell it to visit our website with the `page.goto()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    // const now = new Date(2021, 3, 14); // month is 0-indexed
    // await page.context().addInitScript(() => {
    //   window.Date = class extends Date {
    //     constructor(...args) {
    //       if (args.length === 0) {
    //         super(now);
    //       } else {
    //         super(...args);
    //       }
    //     }
    //   };
    // });
    // await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    // await page.route('*/**/api/hent-forespoersel', route => route.fulfill({ json: trengerDelvis }));
  });

  test('Changes and submit', async ({ page }) => {
    trengerDelvis.erBesvart = true;
    await page.route('*/**/api/hent-forespoersel', (route) => route.fulfill({ json: trengerDelvis }));
    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({
          name: 'Nothing'
        })
      })
    );
    await page.route('*/**/api/inntektsdata', (route) => route.fulfill({ path: '../mockdata/inntektData.json' }));

    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({ json: kvitteringDelvis })
    );

    await page.route('/collect', (route) =>
      route.fulfill({
        status: 202,
        body: 'OK'
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await page.waitForResponse('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012');

    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');

    // await page.click('role=button[name="Endre"]');
    await page.getByRole('button', { name: 'Endre' }).first().click();

    // await page.waitForTimeout(5000);

    // await expect(page).toHaveURL('/im-dialog/endring/12345678-3456-5678-2457-123456789012');

    // await page
    //   .check
    //   // 'role=group[name="Har det vært endringer i beregnet månedslønn for den ansatte mellom 02.01.2023 og 02.01.2023 (start av nytt sykefravær)?"] >> label:text("Ja")'
    //   ();
    await page
      .getByRole('group', {
        name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 02.01.2023 og 02.01.2023 (start av nytt sykefravær)?'
      })
      .getByLabel('Ja')
      .check();

    await expect(page.locator('label:text("Månedsinntekt 02.01.2023")')).toHaveValue('65000');
    await page.fill('label:text("Månedsinntekt 02.01.2023")', '50000');

    // await page.check(
    //   'role=group[name="Er det endringer i refusjonskravet etter 02.01.2023 (start av nytt sykefravær)?"] >> label:text("Ja")'
    // );

    await page
      .getByRole('group', {
        name: 'Er det endringer i refusjonskravet etter 02.01.2023 (start av nytt sykefravær)?'
      })
      .getByLabel('Ja')
      .check();

    // await page.check(
    //   'role=group[name="Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?"] >> label:text("Ja")'
    // );
    await page
      .getByRole('group', {
        name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?'
      })
      .getByLabel('Ja')
      .check();

    await page.fill('label:text("Telefon innsender")', '12345678');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    await page.click('role=button[name="Send"]');

    //await expect(page.locator('text=Vennligst angi årsak for endringen.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vennligst angi årsak for endringen.' })).toBeVisible();
    await page.selectOption('label:text("Velg endringsårsak")', 'Bonus');

    await page.getByRole('group', { name: 'Er det endringer i refusjonsbeløpet i perioden?' }).getByLabel('Ja').check();

    // await page.check('role=group[name="Opphører refusjonkravet i perioden?"] >> label:text("Ja")');
    await page.getByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).getByLabel('Ja').check();

    await page.fill('label:text("Angi siste dag dere krever refusjon for")', '30.09.23');

    await page.click('role=button[name="Endre"]');

    await page.fill('label:text("Oppgi refusjonsbeløpet per måned")', '50000');

    await page.waitForTimeout(1000);

    const requestPromise = page.waitForRequest(
      '*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012'
    );

    await page.getByRole('button', { name: 'Send' }).click();

    const request = await requestPromise;

    const requestBody = JSON.parse(request.postData());

    expect(requestBody).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2023-01-02',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' }
      },
      refusjon: {
        beloepPerMaaned: 50000,
        sluttdato: '2023-09-30',
        endringer: []
      },
      avsenderTlf: '12345678'
    });

    // await expect(page.locator('text=Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();

    await expect(page.locator('text=12345678')).toBeVisible();
    await expect(page.locator('text=Bonus')).toBeVisible();
    const elements = await page.locator('text=50 000,00 kr/måned').elementHandles();
    expect(elements.length).toBe(2);
    await expect(page.locator('text=24.01.2023')).not.toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/02.01.2023/);
  });
});
