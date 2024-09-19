/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    // const now = new Date(2021, 3, 14); // month is 0-indexed
    // cy.clock(now);

    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
  });

  it('can check the radioboxes for refusjon and submit', () => {
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-originalen-16dager.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.intercept('/im-dialog/api/inntektsdata', { fixture: '../../mockdata/inntektData.json' }).as('inntektsdata');

    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');

    cy.wait('@hent-forespoersel');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findAllByRole('button', { name: /Endre/ }).first().click();

    cy.findAllByLabelText('Til').last().clear().type('16.03.23');
    cy.realPress('Escape');

    cy.findByLabelText('Utbetalt under arbeidsgiverperiode').clear().type('50000');
    cy.realPress('Escape');

    cy.findAllByLabelText('Velg begrunnelse for kort arbeidsgiverperiode').select('Arbeidsforholdet er avsluttet');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .findByLabelText('Nei')
      .check();

    cy.contains('Send').click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: {
          perioder: [
            {
              fom: '2023-02-20',
              tom: '2023-03-04'
            },
            {
              fom: '2023-03-15',
              tom: '2023-03-16'
            }
          ],
          egenmeldinger: [],
          redusertLoennIAgp: { beloep: 50000, begrunnelse: 'ArbeidOpphoert' }
        },
        inntekt: {
          beloep: 77000,
          inntektsdato: '2023-03-15',
          naturalytelser: [],
          endringAarsak: null
        },
        refusjon: null,
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');
  });
});
