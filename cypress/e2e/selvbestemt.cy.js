/// <reference types="cypress" />

// Welcome to Cypress!
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Utfylling og innsending av selvbestemt skjema', () => {
  beforeEach(() => {
    cy.intercept('/im-dialog/api/logger', {
      statusCode: 200,
      body: 'OK'
    }).as('logger');

    cy.intercept('/im-dialog/api/sp-soeknader', {
      statusCode: 200,
      body: [
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
      ]
    }).as('sykepengeSoeknader');

    cy.visit('http://localhost:3000/im-dialog/initiering');
  });

  it('selvbestemt med ferie', () => {
    cy.intercept('/im-dialog/api/selvbestemt-inntektsmelding', {
      statusCode: 201,
      body: {
        selvbestemtId: '1234-5678-1234-5678-123456789012'
      }
    }).as('innsendingInntektsmelding');

    cy.intercept('/im-dialog/api/aktiveorgnr', {
      statusCode: 200,
      body: {
        fulltNavn: 'MUSKULØS VALS',
        underenheter: [{ orgnrUnderenhet: '810007842', virksomhetsnavn: 'ANSTENDIG PIGGSVIN BARNEHAGE' }]
      }
    }).as('aktiveorgnr');

    cy.findByLabelText('Angi personnummer for den ansatte').type('25087327879');
    cy.contains('Neste').click();

    cy.location('pathname').should('equal', '/im-dialog/initiering2');

    cy.findByLabelText('11.09.2024 - 15.09.2024 (pluss 4 egenmeldingsdager)').check();

    cy.contains('Neste').click();

    cy.findByLabelText('Utbetalt under arbeidsgiverperiode').type('5000');

    // cy.findByLabelText('Telefon innsender').clear().type('12345678');

    cy.findAllByLabelText('Velg begrunnelse for kort arbeidsgiverperiode').select(
      'Det er ikke fire ukers opptjeningstid'
    );

    cy.findAllByRole('button', { name: 'Endre' }).last().click();

    cy.get('[data-cy="inntekt-beloep-input"]').clear().as('inntektBeloep');
    cy.get('@inntektBeloep').type('7500');

    cy.findAllByLabelText('Velg endringsårsak').as('endringAarsak');
    cy.get('@endringAarsak').select('Ferie');

    cy.findAllByLabelText('Ferie til').last().as('ferieTil');
    cy.get('@ferieTil').clear().type('07.07.24');
    cy.findAllByLabelText('Ferie fra').last().as('ferieFra');
    cy.get('@ferieFra').clear().type('01.07.24');

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?'
    })
      .findByLabelText('Nei')
      .check();

    cy.findAllByLabelText('Telefon innsender').last().click().type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // cy.findAllByLabelText('Telefon innsender').last().clear().type('12345678');

    cy.contains('Send').click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
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
          endringAarsak: null,
          endringAarsaker: [
            {
              aarsak: 'Ferie',
              ferier: [
                {
                  fom: '2024-07-01',
                  tom: '2024-07-07'
                }
              ]
            }
          ]
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

  it('selvbestemt med varig lønnsendring', () => {
    cy.intercept('/im-dialog/kvittering/agi/1234-5678-1234-5678-123456789012', {
      statusCode: 200,
      body: 'OK'
    }).as('loginRedirect');

    cy.intercept('/im-dialog/api/selvbestemt-inntektsmelding', {
      statusCode: 201,
      body: {
        selvbestemtId: '1234-5678-1234-5678-123456789012'
      }
    }).as('innsendingSelvbestemtInntektsmelding');

    cy.intercept('/im-dialog/api/aktiveorgnr', {
      statusCode: 200,
      body: {
        fulltNavn: 'MUSKULØS VALS',
        underenheter: [{ orgnrUnderenhet: '810007842', virksomhetsnavn: 'ANSTENDIG PIGGSVIN BARNEHAGE' }]
      }
    }).as('aktiveorgnr');

    cy.findByLabelText('Angi personnummer for den ansatte').type('25087327879');
    cy.contains('Neste').click();

    cy.location('pathname').should('equal', '/im-dialog/initiering2');

    cy.findByLabelText('11.09.2024 - 15.09.2024 (pluss 4 egenmeldingsdager)').check();
    cy.findByLabelText('16.09.2024 - 17.09.2024').check();

    cy.contains('Neste').click();

    cy.findByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Utbetalt under arbeidsgiverperiode').type('5000');

    cy.findAllByLabelText('Velg begrunnelse for kort arbeidsgiverperiode').select(
      'Det er ikke fire ukers opptjeningstid'
    );

    cy.findAllByRole('button', { name: 'Endre' }).last().click();

    cy.get('[data-cy="inntekt-beloep-input"]').as('beloep').clear();
    cy.get('@beloep').type('7500');

    cy.findAllByLabelText('Velg endringsårsak').as('endringAarsak');
    cy.get('@endringAarsak').select('Varig lønnsendring');

    cy.findAllByLabelText('Lønnsendring gjelder fra').clear().type('30.06.24');

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?'
    })
      .findByLabelText('Nei')
      .check();

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.contains('Send').click();

    cy.wait('@innsendingSelvbestemtInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
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
          endringAarsak: null,
          endringAarsaker: [
            {
              aarsak: 'VarigLoennsendring',
              gjelderFra: '2024-06-30'
            }
          ]
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
