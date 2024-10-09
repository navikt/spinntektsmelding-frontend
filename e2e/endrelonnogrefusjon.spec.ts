import { test, expect } from '@playwright/test';
import clickSubmit from './helpers/clickSubmit';
import checkBekreftelse from './helpers/checkBekreftelse';
import checkRadiobox from './helpers/checkRadiobox';
import mockLoggerRoute from './helpers/mockLoggerRoute';

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await mockLoggerRoute(page);
  });

  test('can check the radioboxes for refusjon and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-en-sykeperiode.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.route('*/**/api/inntektsdata', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/inntektData.json'))
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await checkRadiobox(page, 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    await checkRadiobox(page, 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?', 'Ja');

    await checkRadiobox(page, 'Er det endringer i refusjonsbeløpet i perioden?', 'Nei');

    await checkRadiobox(page, 'Opphører refusjonkravet i perioden?', 'Nei');

    await page.click('[data-cy="endre-beloep"]');
    await page.fill('[data-cy="inntekt-beloep-input"]', '70000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]')).toHaveText('70 000,00 kr');

    await page.click('[data-cy="endre-refusjon-arbeidsgiver-beloep"]');
    await page.fill('[data-cy="inntekt-beloep-input"]', '75000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep-input"]')).toHaveValue('75000');

    await page.selectOption('label:text("Velg endringsårsak")', 'Bonus');

    await page.getByRole('button', { name: 'Endre' }).first().click();

    await page.getByRole('button', { name: 'Legg til periode' }).first().click();

    await page.getByLabel('Fra').nth(1).fill('30.01.23');

    await page.getByRole('textbox', { name: 'Til' }).nth(1).fill('01.02.23');

    await checkBekreftelse(page);

    const requestPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');

    await clickSubmit(page);

    const request = await requestPromise;
    const requestBody = JSON.parse(request.postData());
    expect(requestBody).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: {
        perioder: [
          {
            fom: '2023-01-30',
            tom: '2023-02-14'
          }
        ],
        egenmeldinger: [
          {
            fom: '2023-02-02',
            tom: '2023-02-02'
          },
          {
            fom: '2023-01-30',
            tom: '2023-02-01'
          }
        ],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 75000,
        inntektsdato: '2023-01-30',
        naturalytelser: [],
        endringAarsak: { aarsak: 'Bonus' }
      },
      refusjon: { beloepPerMaaned: 75000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012', { timeout: 10000 });

    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
  });

  test('can check the radioboxes for refusjon and status to ferie and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-en-sykeperiode.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.route('*/**/api/inntektsdata', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/inntektData.json'))
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await checkRadiobox(page, 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    await checkRadiobox(page, 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?', 'Ja');

    await checkRadiobox(page, 'Er det endringer i refusjonsbeløpet i perioden?', 'Nei');

    await checkRadiobox(page, 'Opphører refusjonkravet i perioden?', 'Nei');

    await page.getByRole('button', { name: 'Endre' }).nth(2).click();
    await page.getByLabel('Månedsinntekt 02.02.2023').fill('70000');

    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]')).toHaveText('70 000,00 kr');

    await page.getByRole('button', { name: 'Endre' }).nth(2).click();
    await page.getByLabel('Månedsinntekt 02.02.2023').fill('75000');
    await expect(page.getByLabel('Oppgi refusjonsbeløpet per måned')).toHaveValue('75000');

    await page.selectOption('label:text("Velg endringsårsak")', 'Ferie');

    await page.getByLabel('Ferie fra').fill('25.12.22');
    await page.getByLabel('Ferie til').fill('30.12.22');

    await checkBekreftelse(page);

    const requestPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await clickSubmit(page);
    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: {
        perioder: [
          {
            fom: '2023-02-02',
            tom: '2023-02-17'
          }
        ],
        egenmeldinger: [
          {
            fom: '2023-02-02',
            tom: '2023-02-02'
          }
        ],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 75000,
        inntektsdato: '2023-02-02',
        naturalytelser: [],
        endringAarsak: {
          aarsak: 'Ferie',
          ferier: [
            {
              fom: '2022-12-25',
              tom: '2022-12-30'
            }
          ]
        }
      },
      refusjon: { beloepPerMaaned: 75000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');

    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
  });

  test('can check the radioboxes for refusjon and status to Varig lønnsendring and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-en-sykeperiode.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.route('*/**/api/inntektsdata', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/inntektData.json'))
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

    await checkRadiobox(page, 'Opphører refusjonkravet i perioden?', 'Nei');

    await page.getByRole('button', { name: 'Endre' }).nth(2).click();
    await page.getByLabel('Månedsinntekt 02.02.2023').fill('70000');

    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]')).toHaveText('70 000,00 kr');

    await page.getByRole('button', { name: 'Endre' }).nth(2).click();
    await page.getByLabel('Månedsinntekt 02.02.2023').fill('75000');
    await expect(page.getByLabel('Oppgi refusjonsbeløpet per måned')).toHaveValue('75000');

    await page.getByRole('button', { name: 'Endre' }).first().click();
    await page.getByRole('button', { name: 'Legg til periode' }).first().click();

    await page.getByLabel('Fra').nth(1).fill('30.01.23');
    await page.getByRole('textbox', { name: 'Til' }).nth(1).fill('01.02.23');

    await page.getByLabel('Velg endringsårsak').selectOption('Varig lønnsendring');

    await page.getByLabel('Lønnsendring gjelder fra').fill('30.12.22');

    await checkBekreftelse(page);

    const requestPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');

    await clickSubmit(page);

    const request = await requestPromise;

    expect(request.postDataJSON()).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: {
        perioder: [
          {
            fom: '2023-01-30',
            tom: '2023-02-14'
          }
        ],
        egenmeldinger: [
          {
            fom: '2023-02-02',
            tom: '2023-02-02'
          },
          {
            fom: '2023-01-30',
            tom: '2023-02-01'
          }
        ],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 75000,
        inntektsdato: '2023-01-30',
        naturalytelser: [],
        endringAarsak: {
          aarsak: 'VarigLoennsendring',
          gjelderFra: '2022-12-30'
        }
      },
      refusjon: { beloepPerMaaned: 75000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');

    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
  });
});
