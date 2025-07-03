import { test, expect } from '@playwright/test';
import { FormPage } from './utils/formPage';

const spSoeknader = [
  {
    sykepengesoknadUuid: '8396932c-9656-3f65-96b2-3e37eacff584',
    fom: '2024-08-09',
    tom: '2024-08-15',
    sykmeldingId: '399a6090-1ec9-48e5-b53c-df60d9e95e0e',
    status: 'NY',
    startSykeforlop: '2024-08-06',
    egenmeldingsdagerFraSykmelding: ['2024-08-06', '2024-08-08', '2024-08-07'],
    vedtaksperiodeId: '399a6090-1ec9-48e5-b53c-df60d9e95e0e'
  },
  {
    sykepengesoknadUuid: '399a6090-1ec9-48e5-b53c-df60d9e95e0e',
    fom: '2024-09-11',
    tom: '2024-09-15',
    sykmeldingId: '8396932c-9656-3f65-96b2-3e37eacff584',
    status: 'NY',
    startSykeforlop: '2024-09-06',
    egenmeldingsdagerFraSykmelding: ['2024-09-06', '2024-09-08', '2024-09-07', '2024-09-10'],
    vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
  },
  {
    sykepengesoknadUuid: '4009c928-d13b-45f9-90e4-1c98a421f464',
    fom: '2024-09-16',
    tom: '2024-09-17',
    sykmeldingId: '8396932c-9656-3f65-96b2-3e37eacff584',
    status: 'NY',
    startSykeforlop: '2024-09-16',
    egenmeldingsdagerFraSykmelding: [],
    vedtaksperiodeId: '4009c928-d13b-45f9-90e4-1c98a421f464'
  }
];

const activeOrgnr = {
  fulltNavn: 'MUSKULØS VALS',
  underenheter: [{ orgnrUnderenhet: '810007842', virksomhetsnavn: 'ANSTENDIG PIGGSVIN BARNEHAGE' }]
};

test.describe('Utfylling og innsending av selvbestemt skjema', () => {
  test.beforeEach(async ({ page }) => {
    // stub logger
    await page.route('*/**/api/logger', (r) => r.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' }));
    // stub sykepengesøknader
    await page.route('*/**/api/sp-soeknader', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(spSoeknader) })
    );
    // stub innsending
    await page.route('*/**/api/selvbestemt-inntektsmelding', (r) =>
      r.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ selvbestemtId: '1234-5678-1234-5678-123456789012' })
      })
    );
    // stub organisasjoner
    await page.route('*/**/api/aktiveorgnr', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(activeOrgnr) })
    );
    // start on initialisering
    await page.goto('http://localhost:3000/im-dialog/initiering');
    // await page.waitForResponse('*/**/api/sp-soeknader');
  });

  test('selvbestemt med ferie', async ({ page }) => {
    const formPage = new FormPage(page);
    // select fødselsnummer and next
    await page.getByLabel('Ansattes fødselsnummer').fill('25087327879');
    await formPage.checkRadioButton('Årsak til at du vil opprette inntektsmelding.', 'Annen årsak');

    await formPage.clickButton('Neste');
    await page.waitForURL('**/im-dialog/initieringAnnet');

    // choose period with ferie dager
    await page.getByLabel('11.09.2024 - 15.09.2024 (pluss 4 egenmeldingsdager)').check();
    await formPage.clickButton('Neste');

    // fill utbetalt under AGP
    await page.getByLabel('Utbetalt under arbeidsgiverperiode').fill('5000');
    // choose kort AGP begrunnelse
    await page
      .getByLabel('Velg begrunnelse for kort arbeidsgiverperiode')
      .selectOption({ label: 'Det er ikke fire ukers opptjeningstid' });
    // click last Endre to change inntekt
    await page.getByRole('button', { name: 'Endre' }).last().click();

    // clear and fill new inntekt
    const beløpInput = page.locator('[data-cy="inntekt-beloep-input"]');
    await beløpInput.fill('7500');
    // select endringsårsak Ferie
    await page.getByLabel('Velg endringsårsak').selectOption({ label: 'Ferie' });
    // fill ferie-perioder
    await page.getByLabel('Ferie til').last().fill('07.07.24');
    await page.getByLabel('Ferie fra').last().fill('01.07.24');
    // select refusjon under sykefraværet = Nei
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');
    // fill phone and confirm
    await page.getByLabel('Telefon innsender').last().fill('12345678');
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    // send

    // assert payload
    const reqPromise = page.waitForRequest('*/**/api/selvbestemt-inntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    expect(JSON.parse(req.postData()!)).toEqual({
      agp: {
        perioder: [
          { fom: '2024-09-06', tom: '2024-09-08' },
          { fom: '2024-09-10', tom: '2024-09-15' }
        ],
        egenmeldinger: [
          { fom: '2024-09-06', tom: '2024-09-08' },
          { fom: '2024-09-10', tom: '2024-09-10' }
        ],
        redusertLoennIAgp: {
          beloep: 5000,
          begrunnelse: 'ManglerOpptjening'
        }
      },
      inntekt: {
        beloep: 7500,
        inntektsdato: '2024-09-10',
        naturalytelser: [],
        endringAarsaker: [
          {
            aarsak: 'Ferie',
            ferier: [{ fom: '2024-07-01', tom: '2024-07-07' }]
          }
        ]
      },
      refusjon: null,
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '810007842', tlf: '12345678' },
      sykmeldingsperioder: [{ fom: '2024-09-11', tom: '2024-09-15' }],
      selvbestemtId: null,
      vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
    });
  });

  test('selvbestemt med varig lønnsendring', async ({ page }) => {
    // // stub innsending and aktive orgnr
    // await page.route('*/**/api/selvbestemt-inntektsmelding', (r) =>
    //   r.fulfill({
    //     status: 201,
    //     contentType: 'application/json',
    //     body: JSON.stringify({ selvbestemtId: '1234-5678-1234-5678-123456789012' })
    //   })
    // );
    // await page.route('*/**/api/aktiveorgnr', (r) =>
    //   r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(activeOrgnr) })
    // );

    // fill personnummer and next
    const formPage = new FormPage(page);
    await page.getByLabel('Ansattes fødselsnummer').fill('25087327879');
    await formPage.checkRadioButton('Årsak til at du vil opprette inntektsmelding.', 'Annen årsak');
    await page.getByRole('button', { name: 'Neste' }).click();

    await page.waitForURL('**/initieringAnnet');

    // select both periods
    await page.getByLabel('11.09.2024 - 15.09.2024 (pluss 4 egenmeldingsdager)').check();
    await page.getByLabel('16.09.2024 - 17.09.2024').check();
    await page.getByRole('button', { name: 'Neste' }).click();

    // fill phone and utbetalt
    await page.getByLabel('Telefon innsender').fill('12345678');
    await page.getByLabel('Utbetalt under arbeidsgiverperiode').fill('5000');
    // short AGP reason
    await page
      .getByLabel('Velg begrunnelse for kort arbeidsgiverperiode')
      .selectOption({ label: 'Det er ikke fire ukers opptjeningstid' });
    // click last Endre and change amount
    await page.getByRole('button', { name: 'Endre' }).last().click();
    const amtInput = page.locator('[data-cy="inntekt-beloep-input"]');
    await amtInput.fill('7500');
    // select endringsårsak Varig lønnsendring
    await page.getByLabel('Velg endringsårsak').selectOption({ label: 'Varig lønnsendring' });
    await page.getByLabel('Lønnsendring gjelder fra').fill('30.06.24');
    // refusjon = Nei
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');
    // confirm + send
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // assert payload
    const req2Promise = page.waitForRequest('*/**/api/selvbestemt-inntektsmelding');
    await formPage.clickButton('Send');
    const req2 = await req2Promise;
    expect(JSON.parse(req2.postData()!)).toEqual({
      agp: {
        perioder: [
          { fom: '2024-09-06', tom: '2024-09-08' },
          { fom: '2024-09-10', tom: '2024-09-17' }
        ],
        egenmeldinger: [
          { fom: '2024-09-06', tom: '2024-09-08' },
          { fom: '2024-09-10', tom: '2024-09-10' }
        ],
        redusertLoennIAgp: {
          beloep: 5000,
          begrunnelse: 'ManglerOpptjening'
        }
      },
      inntekt: {
        beloep: 7500,
        inntektsdato: '2024-09-10',
        naturalytelser: [],
        endringAarsaker: [{ aarsak: 'VarigLoennsendring', gjelderFra: '2024-06-30' }]
      },
      refusjon: null,
      sykmeldtFnr: '25087327879',
      avsender: { orgnr: '810007842', tlf: '12345678' },
      sykmeldingsperioder: [
        { fom: '2024-09-11', tom: '2024-09-15' },
        { fom: '2024-09-16', tom: '2024-09-17' }
      ],
      selvbestemtId: null,
      vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
    });
  });
});
