import { test, expect } from '@playwright/test';

test.describe('Utfylling og innsending av selvbestemt skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/im-dialog/initiering');
  });

  test('selvbestemt med ferie', async ({ page }) => {
    await page.route('*/**/api/selvbestemt-inntektsmelding', (route) => {
      route.fulfill({
        status: 201,
        body: JSON.stringify({
          selvbestemtId: '1234-5678-1234-5678-123456789012'
        })
      });
    });

    await page.route('*/**/api/aktiveorgnr', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          fulltNavn: 'MUSKULØS VALS',
          underenheter: [{ orgnrUnderenhet: '810007842', virksomhetsnavn: 'ANSTENDIG PIGGSVIN BARNEHAGE' }]
        })
      });
    });

    await page.route('*/**/api/sp-soeknader', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
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
        ])
      });
    });

    await page.fill('label:has-text("Angi personnummer for den ansatte")', '25087327879');
    await page.click('text=Neste');

    // await expect(page).toHaveURL('http://localhost:3000/im-dialog/initiering2');

    await page.check('label:has-text("11.09.2024 - 15.09.2024 (pluss 4 egenmeldingsdager)")');
    await page.click('text=Neste');

    await page.fill('label:has-text("Telefon innsender")', '12345678');
    await page.fill('label:has-text("Utbetalt under arbeidsgiverperiode")', '5000');
    await page.selectOption(
      'label:has-text("Velg begrunnelse for kort arbeidsgiverperiode")',
      'Det er ikke fire ukers opptjeningstid'
    );
    await page.getByRole('button', { name: 'Endre' }).last().click();
    // await page.click('role=button[name="Endre"]:last-of-type');
    await page.fill('[data-cy="inntekt-beloep-input"]', '7500');
    await page.selectOption('label:has-text("Velg endringsårsak")', 'Ferie');
    await page.fill('label:has-text("Ferie til"):last-of-type', '07.07.24');
    await page.fill('label:has-text("Ferie fra"):last-of-type', '01.07.24');
    await page.fill('label:has-text("Ferie til"):last-of-type', '07.07.24');

    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .filter({ hasText: 'Nei' })
      .check();

    // await page.check(
    //   'role=group[name="Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?"] >> label:has-text("Nei")'
    // );

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // await page.check('label:has-text("Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.")');
    await page.click('text=Send');

    const request = await page.waitForRequest('/im-dialog/api/selvbestemt-inntektsmelding');
    const requestBody = JSON.parse(request.postData());

    expect(requestBody).toEqual({
      agp: {
        perioder: [
          {
            fom: '2024-09-06',
            tom: '2024-09-08'
          },
          {
            fom: '2024-09-10',
            tom: '2024-09-15'
          }
        ],
        egenmeldinger: [
          {
            fom: '2024-09-06',
            tom: '2024-09-08'
          },
          {
            fom: '2024-09-10',
            tom: '2024-09-10'
          }
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
        endringAarsak: {
          aarsak: 'Ferie',
          ferier: [
            {
              fom: '2024-07-01',
              tom: '2024-07-07'
            }
          ]
        }
      },
      refusjon: null,
      sykmeldtFnr: '25087327879',
      avsender: {
        orgnr: '810007842',
        tlf: '12345678'
      },
      sykmeldingsperioder: [
        {
          fom: '2024-09-11',
          tom: '2024-09-15'
        }
      ],
      selvbestemtId: null,
      vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
    });
  });

  test('selvbestemt med varig lønnsendring', async ({ page }) => {
    await page.route('/im-dialog/kvittering/agi/1234-5678-1234-5678-123456789012', (route) => {
      route.fulfill({
        status: 200,
        body: 'OK'
      });
    });

    await page.route('/im-dialog/api/selvbestemt-inntektsmelding', (route) => {
      route.fulfill({
        status: 201,
        body: JSON.stringify({
          selvbestemtId: '1234-5678-1234-5678-123456789012'
        })
      });
    });

    await page.route('/im-dialog/api/aktiveorgnr', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          fulltNavn: 'MUSKULØS VALS',
          underenheter: [{ orgnrUnderenhet: '810007842', virksomhetsnavn: 'ANSTENDIG PIGGSVIN BARNEHAGE' }]
        })
      });
    });

    await page.fill('label:has-text("Angi personnummer for den ansatte")', '25087327879');
    await page.click('text=Neste');

    await expect(page).toHaveURL('http://localhost:3000/im-dialog/initiering2');

    await page.check('label:has-text("11.09.2024 - 15.09.2024 (pluss 4 egenmeldingsdager)")');
    await page.check('label:has-text("16.09.2024 - 17.09.2024")');
    await page.click('text=Neste');

    await page.fill('label:has-text("Telefon innsender")', '12345678');
    await page.fill('label:has-text("Utbetalt under arbeidsgiverperiode")', '5000');
    await page.selectOption(
      'label:has-text("Velg begrunnelse for kort arbeidsgiverperiode")',
      'Det er ikke fire ukers opptjeningstid'
    );
    await page.click('role=button[name="Endre"]:last-of-type');
    await page.fill('[data-cy="inntekt-beloep-input"]', '7500');
    await page.selectOption('label:has-text("Velg endringsårsak")', 'Varig lønnsendring');
    await page.fill('label:has-text("Lønnsendring gjelder fra")', '30.06.24');
    await page.check(
      'role=group[name="Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?"] >> label:has-text("Nei")'
    );
    await page.check('label:has-text("Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.")');
    await page.click('text=Send');

    const request = await page.waitForRequest('/im-dialog/api/selvbestemt-inntektsmelding');
    const requestBody = JSON.parse(request.postData());

    expect(requestBody).toEqual({
      agp: {
        perioder: [
          {
            fom: '2024-09-06',
            tom: '2024-09-08'
          },
          {
            fom: '2024-09-10',
            tom: '2024-09-17'
          }
        ],
        egenmeldinger: [
          {
            fom: '2024-09-06',
            tom: '2024-09-08'
          },
          {
            fom: '2024-09-10',
            tom: '2024-09-10'
          }
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
        endringAarsak: {
          aarsak: 'VarigLoennsendring',
          gjelderFra: '2024-06-30'
        }
      },
      refusjon: null,
      sykmeldtFnr: '25087327879',
      avsender: {
        orgnr: '810007842',
        tlf: '12345678'
      },
      sykmeldingsperioder: [
        {
          fom: '2024-09-11',
          tom: '2024-09-15'
        },
        {
          fom: '2024-09-16',
          tom: '2024-09-17'
        }
      ],
      selvbestemtId: null,
      vedtaksperiodeId: '8396932c-9656-3f65-96b2-3e37eacff584'
    });
  });
});
