import { test, expect } from '@playwright/test';
// import trengerSykeperiode from '../mockdata/trenger-en-sykeperiode.json';
import inntektData from '../mockdata/inntektData.json';
import { FormPage } from './utils/formPage';

const uuid = 'b4e2f8a1-6c3d-4e9f-82b7-1a5c9d0e4f63';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema – endre lønn og refusjon', () => {
  test.beforeEach(async ({ page }) => {
    // stub beacon & logger
    await page.route('**/collect', (r) => r.fulfill({ status: 202, body: 'OK' }));
    await page.route('*/**/api/logger', (r) => r.fulfill({ status: 200, body: 'OK' }));
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (r) =>
      r.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );

    // stub data calls
    await page.route('*/**/api/inntektsdata', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(inntektData) })
    );
    await page.route('*/**/api/innsendingInntektsmelding', (r) =>
      r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );

    // go to form
    await page.goto(baseUrl);
  });

  test('refusjon uten perioder', async ({ page }) => {
    const formPage = new FormPage(page);

    // select full lønn & refusjon = Ja
    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    // refusjon endringer = Nei
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    // override inntekt
    await page.locator('[data-cy="endre-beloep"]').click();
    // confirm and update salary
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();
    const salaryInput = page.locator('[data-cy="inntekt-beloep-input"]');
    await salaryInput.fill('70000');
    // assert displayed refusjon-beloep
    const displayed = await page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]').textContent();
    expect(displayed).toMatch(/70\s000,00\skr/);

    // override refusjon-beloep
    await page.locator('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();
    await salaryInput.fill('75000');
    await expect(page.getByLabel('Oppgi refusjonsbeløpet per måned')).toHaveValue('70000');

    // select årsak
    await page.getByLabel('Velg endringsårsak').selectOption('Bonus');
    // click første Endre for å legge til periode
    await page.getByRole('button', { name: /Endre/ }).first().click();

    // await formPage.clickButton('Legg til periode');

    // fill nye periode-datoer
    const skReqPromise = page.waitForRequest('*/**/api/inntektsdata');
    await page.getByRole('textbox', { name: 'Fra' }).first().fill('30.01.23');
    await page.getByRole('textbox', { name: 'Til' }).first().fill('14.02.23');

    // capture skjaeringstidspunkt request
    const skReq = await skReqPromise;
    expect(JSON.parse(skReq.postData()!)).toEqual({
      forespoerselId: uuid,
      inntektsdato: '2023-01-30'
    });

    // submit
    const txPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const tx = await txPromise;
    // assert final payload
    expect(JSON.parse(tx.postData()!)).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-01-30', tom: '2023-02-14' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 84333.33,
        inntektsdato: '2023-01-30',
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: { beloepPerMaaned: 70000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // confirm receipt page
    // await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('refusjon med ferie', async ({ page }) => {
    const formPage = new FormPage(page);
    // stub data calls

    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    await page.locator('[data-cy="endre-beloep"]').click();
    const salaryInput = page.locator('[data-cy="inntekt-beloep-input"]');
    await salaryInput.fill('70000');
    await page.locator('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();
    await salaryInput.fill('75000');
    // select Ferie
    await page.getByLabel('Velg endringsårsak').selectOption('Ferie');
    // fill ferie period: Fra/til
    await page.getByRole('textbox', { name: 'Ferie til' }).last().fill('30.12.22');
    await page.getByRole('textbox', { name: 'Ferie fra' }).last().fill('25.12.22');
    // await page.getByLabel('Ferie til').last().fill('30.12.22');
    // confirm and send
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    const txPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const tx = await txPromise;
    expect(JSON.parse(tx.postData()!)).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-02-02', tom: '2023-02-17' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 75000,
        inntektsdato: '2023-02-02',
        endringAarsaker: [{ aarsak: 'Ferie', ferier: [{ fom: '2022-12-25', tom: '2022-12-30' }] }]
      },
      refusjon: { beloepPerMaaned: 70000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('refusjon med varig lønnsendring', async ({ page }) => {
    const formPage = new FormPage(page);

    await page.getByRole('button', { name: /Endre/ }).first().click();
    await page.getByRole('textbox', { name: 'Til' }).first().fill('14.02.23');
    await page.getByRole('textbox', { name: 'Fra' }).first().fill('30.01.23');

    await page.locator('[data-cy="endre-beloep"]').click();
    await formPage.fillInput('Månedslønn 30.01.2023', '70000');

    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
    await page.locator('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();
    await formPage.fillInput('Månedslønn 30.01.2023', '75000');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    await page.getByLabel('Velg endringsårsak').selectOption('Varig lønnsendring');
    await page.getByLabel('Lønnsendring gjelder fra').fill('30.12.22');

    // confirm and send
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    const txPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const tx = await txPromise;

    expect(JSON.parse(tx.postData()!)).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-01-30', tom: '2023-02-14' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 75000,
        inntektsdato: '2023-01-30',
        endringAarsaker: [{ aarsak: 'VarigLoennsendring', gjelderFra: '2022-12-30' }]
      },
      refusjon: { beloepPerMaaned: 70000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });
});
