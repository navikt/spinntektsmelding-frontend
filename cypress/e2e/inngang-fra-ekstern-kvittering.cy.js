/// <reference types="cypress" />

import hentForespoersel from '../../mockdata/trenger-originalen-16dager-innsendt.json';

describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    cy.intercept('/collect', {
      statusCode: 202,
      body: 'OK'
    }).as('collect');
  });

  it('Changes and submit', () => {
    cy.intercept('/im-dialog/api/hent-forespoersel', hentForespoersel).as('hent-forespoersel');
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');
    cy.intercept('/im-dialog/api/inntektsdata', { fixture: '../../mockdata/inntektData.json' }).as('inntektsdata');

    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      fixture: '../../mockdata/kvittering-eksternt-system.json'
    }).as('kvittering');

    cy.intercept('/collect', {
      statusCode: 202,
      body: 'OK'
    }).as('collect');

    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    cy.wait('@kvittering');

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');

    cy.findByRole('link', { name: 'sende den inn på nytt.' }).click();

    cy.wait(5000);

    cy.location('pathname', { timeout: 60000 }).should(
      'equal',
      '/im-dialog/12345678-3456-5678-2457-123456789012/overskriv'
    );

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?'
    })
      .findByLabelText('Nei')
      .check();

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

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
              tom: '2023-03-17'
            }
          ],
          egenmeldinger: [],
          redusertLoennIAgp: null
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

    // cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findByText('12345678').should('be.visible');
  });
});
