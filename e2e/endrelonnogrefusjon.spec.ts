import { test, expect } from '@playwright/test';
import clickSubmit from './helpers/clickSubmit';

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
  });

  test('can check the radioboxes for refusjon and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-en-sykeperiode.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', (route) =>
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

    // await page.check('text=Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden? >> text=Ja');
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();
    //await page.check('text=Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden? >> text=Ja');
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();
    // await page.click('text=Er det endringer i refusjonsbeløpet i perioden? >> text=Nei');
    await page
      .getByRole('group', { name: 'Er det endringer i refusjonsbeløpet i perioden?' })
      .getByLabel('Nei')
      .check();

    // await page.click('text=Opphører refusjonkravet i perioden? >> text=Nei');
    await page.getByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).getByLabel('Nei').check();

    await page.click('[data-cy="endre-beloep"]');
    await page.fill('[data-cy="inntekt-beloep-input"]', '70000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]')).toHaveText('70 000,00 kr');

    await page.click('[data-cy="endre-refusjon-arbeidsgiver-beloep"]');
    await page.fill('[data-cy="inntekt-beloep-input"]', '75000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep-input"]')).toHaveValue('75000');

    await page.selectOption('label:text("Velg endringsårsak")', 'Bonus');
    // await page.click('text=Endre');
    await page.getByRole('button', { name: 'Endre' }).first().click();
    // await page.click('text=Legg til periode');
    await page.getByRole('button', { name: 'Legg til periode' }).first().click();

    await page.getByLabel('Fra').nth(1).fill('30.01.23');
    // await page.fill('text=Fra >> nth=1', '30.01.23');
    await page.fill('label:has-text("Til") >> nth=1', '01.02.23');
    // await page.getByLabel('Til').nth(1).fill('01.02.23');
    // await page.fill('text=Til >> nth=1', '01.02.23');

    await page.waitForResponse('*/**/api/inntektsdata');

    // await page.check('text=Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    const requestPromise = page.waitForRequest(
      '*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012'
    );

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

    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    // await expect(page.locator('text=Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kvittering - innsendt inntektsmelding' })).toBeVisible();
  });

  test('can check the radioboxes for refusjon and status to ferie and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-en-sykeperiode.json'))
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', (route) =>
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

    // await page.check('text=Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden? >> text=Ja');
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();
    // await page.check('text=Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden? >> text=Ja');
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    // await page.click('text=Er det endringer i refusjonsbeløpet i perioden? >> text=Nei');
    await page
      .getByRole('group', { name: 'Er det endringer i refusjonsbeløpet i perioden?' })
      .getByLabel('Nei')
      .check();

    // await page.click('text=Opphører refusjonkravet i perioden? >> text=Nei');
    await page.getByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).getByLabel('Nei').check();

    await page.click('[data-cy="endre-beloep"]');
    await page.fill('[data-cy="inntekt-beloep-input"]', '70000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]')).toHaveText('70 000,00 kr');

    await page.click('[data-cy="endre-refusjon-arbeidsgiver-beloep"]');
    await page.fill('[data-cy="inntekt-beloep-input"]', '75000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep-input"]')).toHaveValue('75000');

    await page.selectOption('label:text("Velg endringsårsak")', 'Ferie');

    await page.getByLabel('Ferie fra').fill('25.12.22');
    await page.getByLabel('Ferie til').fill('30.12.22');
    // await page.fill('text=Ferie til >> nth=1', '30.12.22');
    // await page.fill('text=Ferie fra >> nth=1', '25.12.22');
    // await page.fill('text=Ferie til >> nth=1', '30.12.22');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    const requestPromise = page.waitForRequest(
      '*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012'
    );
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

    await page.route('*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', (route) =>
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

    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();
    await page
      .getByRole('group', { name: 'Er det endringer i refusjonsbeløpet i perioden?' })
      .getByLabel('Nei')
      .check();
    await page.getByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).getByLabel('Nei').check();

    await page.click('[data-cy="endre-beloep"]');
    await page.fill('[data-cy="inntekt-beloep-input"]', '70000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]')).toHaveText('70 000,00 kr');

    await page.click('[data-cy="endre-refusjon-arbeidsgiver-beloep"]');
    await page.fill('[data-cy="inntekt-beloep-input"]', '75000');
    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep-input"]')).toHaveValue('75000');

    // await page.click('text=Endre');
    await page.getByRole('button', { name: 'Endre' }).first().click();
    await page.click('text=Legg til periode');

    // await page.fill('text=Fra >> nth=1', '30.01.23');
    await page.fill('label:has-text("Fra") >> nth=1', '30.01.23');
    // await page.fill('text=Til >> nth=1', '01.02.23');
    await page.fill('label:has-text("Til") >> nth=1', '01.02.23');

    await page.selectOption('label:text("Velg endringsårsak")', 'Varig lønnsendring');
    await page.fill('text=Lønnsendring gjelder fra', '30.12.22');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    const requestPromise = page.waitForRequest(
      '*/**/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012'
    );
    // await page.click('text=Send');
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
