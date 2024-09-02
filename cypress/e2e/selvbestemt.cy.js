/// <reference types="cypress" />

// Welcome to Cypress!
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Utfylling og innsending av selvbestemt skjema', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/im-dialog/initiering');
  });

  it('selvbestemt med ferie', () => {
    // cy.intercept('/im-dialog/api/trenger', { fixture: '../../mockdata/trenger-originalen.json' }).as('trenger');

    // cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
    //   statusCode: 404,
    //   body: {
    //     name: 'Nothing'
    //   }
    // }).as('kvittering');

    //localhost:3000/im-dialog/kvittering/agi/arbeidsgiverInitiertInnsending

    https: cy.intercept('/im-dialog/api/selvbestemt-inntektsmelding', {
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

    // cy.wait('@kvittering');
    // cy.wait('@trenger');

    cy.findByLabelText('Angi personnummer for den ansatte').type('25087327879');
    cy.contains('Neste').click();

    cy.location('pathname').should('equal', '/im-dialog/initiering2');

    cy.findAllByLabelText('Sykmelding fra').last().clear().type('26.08.24');
    cy.realPress('Escape');
    cy.findAllByLabelText('Sykmelding til').last().clear().type('30.08.24');
    cy.realPress('Escape');

    cy.contains('Neste').click();

    cy.findByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Utbetalt under arbeidsgiverperiode').type('5000');

    cy.findAllByLabelText('Velg begrunnelse for kort arbeidsgiverperiode').select(
      'Det er ikke fire ukers opptjeningstid'
    );

    cy.findAllByRole('button', { name: 'Endre' }).last().click();

    cy.get('[data-cy="inntekt-beloep-input"]').clear().type('7500');

    // cy.get('[data-cy="refusjon-arbeidsgiver-beloep-input"]').should('have.value', '7500');

    cy.findAllByLabelText('Velg endringsårsak').select('Ferie');

    // Jeg er ikke sikker på hvorfor det må være denne frem og tilbakde dansen
    cy.findAllByLabelText('Til').last().clear().type('07.07.24');
    cy.findAllByLabelText('Fra').last().clear().type('01.07.24');
    cy.findAllByLabelText('Til').last().clear().type('07.07.24');

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?'
    })
      .findByLabelText('Nei')
      .check();

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.contains('Send').click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        agp: {
          perioder: [
            {
              fom: '2024-08-26',
              tom: '2024-08-30'
            }
          ],
          egenmeldinger: [],
          redusertLoennIAgp: {
            beloep: 5000,
            begrunnelse: 'ManglerOpptjening'
          }
        },
        inntekt: {
          beloep: 7500,
          inntektsdato: '2024-08-26',
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
            fom: '2024-08-26',
            tom: '2024-08-30'
          }
        ],
        selvbestemtId: null
      });
  });

  it('selvbestemt med varig lønnsendring', () => {
    // cy.intercept('/im-dialog/api/trenger', { fixture: '../../mockdata/trenger-originalen.json' }).as('trenger');

    // cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
    //   statusCode: 404,
    //   body: {
    //     name: 'Nothing'
    //   }
    // }).as('kvittering');

    //localhost:3000/im-dialog/kvittering/agi/arbeidsgiverInitiertInnsending

    https: cy.intercept('/im-dialog/api/selvbestemt-inntektsmelding', {
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

    // cy.wait('@kvittering');
    // cy.wait('@trenger');

    cy.findByLabelText('Angi personnummer for den ansatte').type('25087327879');
    cy.contains('Neste').click();

    cy.location('pathname').should('equal', '/im-dialog/initiering2');

    cy.findAllByLabelText('Sykmelding fra').last().clear().type('26.08.24');
    cy.realPress('Escape');
    cy.findAllByLabelText('Sykmelding til').last().clear().type('30.08.24');
    cy.realPress('Escape');

    cy.contains('Neste').click();

    cy.findByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Utbetalt under arbeidsgiverperiode').type('5000');

    cy.findAllByLabelText('Velg begrunnelse for kort arbeidsgiverperiode').select(
      'Det er ikke fire ukers opptjeningstid'
    );

    cy.findAllByRole('button', { name: 'Endre' }).last().click();

    cy.get('[data-cy="inntekt-beloep-input"]').clear().type('7500');

    // cy.get('[data-cy="refusjon-arbeidsgiver-beloep-input"]').should('have.value', '7500');

    cy.findAllByLabelText('Velg endringsårsak').select('Varig lønnsendring');

    cy.findAllByLabelText('Lønnsendring gjelder fra').clear().type('30.06.24');

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?'
    })
      .findByLabelText('Nei')
      .check();

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.contains('Send').click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        agp: {
          perioder: [
            {
              fom: '2024-08-26',
              tom: '2024-08-30'
            }
          ],
          egenmeldinger: [],
          redusertLoennIAgp: {
            beloep: 5000,
            begrunnelse: 'ManglerOpptjening'
          }
        },
        inntekt: {
          beloep: 7500,
          inntektsdato: '2024-08-26',
          naturalytelser: [],
          endringAarsak: {
            aarsak: 'VarigLoennsendring',
            gjelderFra: '2024-06-24'
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
            fom: '2024-08-26',
            tom: '2024-08-30'
          }
        ],
        selvbestemtId: null
      });
  });
});
