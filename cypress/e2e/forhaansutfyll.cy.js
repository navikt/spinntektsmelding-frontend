/// <reference types="cypress" />

import body from '../../mockdata/trenger-forhaandsutfyll.json';

describe('Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    // const now = new Date(2021, 3, 14); // month is 0-indexed
    // cy.clock(now);

    // cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.injectAxe();

    // cy.wait('@kvittering');
    // cy.wait('@hent-forespoersel');
  });

  // it('Has no detectable a11y violations on load', () => {
  //   cy.get('[data-cy="navn"]').should('have.text', 'Navn Navnesen');
  //   // Test the page at initial load
  //   cy.checkA11y();
  // });

  it('should display information on the person and the submitter', () => {
    cy.mockBackendRequest({
      port: 3001,
      routeMock: {
        path: 'http://im-api.helsearbeidsgiver/api/v1/hent-forespoersel',
        method: 'GET',
        response: {
          statusCode: 200,
          body
        }
      },
      fixturePath: 'my_fixture_file_path'
    });

    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-forhaandsutfyll.json' }).as(
      'hent-forespoersel'
    );

    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');

    cy.intercept('/im-dialog/api/inntektsdata', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('inntektsdata');

    cy.intercept('/im-dialog/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    cy.wait('@kvittering');
    cy.wait('@hent-forespoersel');

    cy.get('[data-cy="navn"]').should('have.text', 'Test Navn Testesen-Navnesen Jr.');
    cy.get('[data-cy="identitetsnummer"]').should('have.text', '10486535275');
    cy.get('[data-cy="virksomhetsnavn"]').should('have.text', 'Veldig ampert piggsvin barnehage');
    cy.get('[data-cy="orgnummer"]').should('have.text', '911206722');
    cy.get('[data-cy="innsendernavn"]').should('have.text', 'Test Testesen');
    cy.get('[data-cy="innsendertlf"]').should('have.value', '12345678');
    // });

    // it('should display information on the egenmelding', () => {

    cy.get('[data-cy="egenmelding"] .navds-label').first().should('have.text', 'Fra');
    cy.get('[data-cy="egenmelding"] .navds-label').last().should('have.text', 'Til');
    cy.get('[data-cy="egenmelding-fra"]').should('have.text', '01.02.2023');
    cy.get('[data-cy="egenmelding-til"]').should('have.text', '03.02.2023');
    // });

    // it('should display information on the sykmelding', () => {
    cy.get('[data-cy="sykmelding-0-fra"]').should('have.text', 'Fra');
    cy.get('[data-cy="sykmelding-0-til"]').should('have.text', 'Til');
    cy.get('[data-cy="sykmelding-0-fra-dato"]').should('have.text', '04.02.2023');
    cy.get('[data-cy="sykmelding-0-til-dato"]').should('have.text', '15.02.2023');
    // });

    // it('should display information on the arbeidsgiverperiode', () => {
    cy.get('[data-cy="arbeidsgiverperiode-0-fra"]').should('have.text', 'Fra');
    cy.get('[data-cy="arbeidsgiverperiode-0-til"]').should('have.text', 'Til');
    cy.get('[data-cy="arbeidsgiverperiode-0-fra-dato"]').should('have.text', '01.02.2023');
    cy.get('[data-cy="arbeidsgiverperiode-0-til-dato"]').should('have.text', '15.02.2023');
    // });

    // it('should display information on the beregnet månedslønn', () => {
    cy.get('[data-cy="tidligereinntekt"] tbody tr').its('length').should('be.eq', 3);
    cy.get('[data-cy="tidligereinntekt"] tbody tr').first().find('td').first().should('have.text', 'November:');
    cy.get('[data-cy="tidligereinntekt"] tbody tr')
      .first()
      .find('td')
      .last()
      .invoke('text')
      .should('match', /88\s000,00\skr/);
    cy.get('[data-cy="tidligereinntekt"] tbody tr').last().find('td').first().should('have.text', 'Januar:');
    cy.get('[data-cy="tidligereinntekt"] tbody tr')
      .last()
      .find('td')
      .last()
      .invoke('text')
      .should('match', /66\s000,00\skr/);

    cy.findByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .findByLabelText('Nei')
      .check();

    // It should display an alert about the sykemelding that is not covered by the inntektsmelding
    cy.findAllByText('Dere vil motta en separat forespørsel om inntektsmelding for denne perioden.').should(
      'be.visible'
    );

    cy.findByRole('checkbox', {
      name: 'Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
    }).check();
    cy.injectAxe();
    cy.checkA11y();

    cy.findByRole('button', { name: 'Send' }).click();
    cy.wait('@innsendingInntektsmelding');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.checkA11y();
  });
});
