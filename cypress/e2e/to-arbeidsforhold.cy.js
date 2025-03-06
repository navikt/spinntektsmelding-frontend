/// <reference types="cypress" />

describe('Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
  });

  it('can check the radioboxes for refusjon and submit', () => {
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-to-arbeidsforhold.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');
    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');
    cy.wait('@hent-forespoersel');

    cy.findAllByLabelText('Telefon innsender').type('12345678');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .findByLabelText('Ja')
      .check();
    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .findByLabelText('Nei')
      .check();

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: {
          perioder: [{ fom: '2023-09-04', tom: '2023-09-19' }],
          egenmeldinger: [],
          redusertLoennIAgp: null
        },

        inntekt: {
          beloep: 45000,
          inntektsdato: '2023-08-23',
          naturalytelser: [],
          endringAarsak: null,
          endringsaarsaker: null
        },
        refusjon: null,
        avsenderTlf: '12345678'
      });
    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findAllByText('Sykmelding').should('be.visible');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /23.08.2023/);
  });
});
