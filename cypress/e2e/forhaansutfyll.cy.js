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
    cy.injectAxe();
  });

  // it('Has no detectable a11y violations on load', () => {
  //   cy.get('[data-cy="navn"]').should('have.text', 'Navn Navnesen');
  //   // Test the page at initial load
  //   cy.checkA11y();
  // });

  it('should display information on the person and the submitter', () => {
    cy.get('[data-cy="navn"]').should('have.text', 'Test Navn Testesen-Navnesen Jr.');
    cy.get('[data-cy="identitetsnummer"]').should('have.text', '25087327879');
    cy.get('[data-cy="virksomhetsnavn"]').should('have.text', 'Veldig ampert piggsvin barnehage');
    cy.get('[data-cy="orgnummer"]').should('have.text', '911206722');
    cy.get('[data-cy="innsendernavn"]').should('have.text', 'Test Testesen');
    cy.get('[data-cy="innsendertlf"]').should('have.value', '12345678');
  });

  it('should display information on the egenmelding', () => {
    cy.get('[data-cy="egenmelding"] .navds-label').first().should('have.text', 'Fra');
    cy.get('[data-cy="egenmelding"] .navds-label').last().should('have.text', 'Til');
    cy.get('[data-cy="egenmelding-fra"]').should('have.text', '17.02.2023');
    cy.get('[data-cy="egenmelding-til"]').should('have.text', '19.02.2023');
  });

  it('should display information on the sykmelding', () => {
    cy.get('[data-cy="sykmelding-0-fra"]').should('have.text', 'Fra');
    cy.get('[data-cy="sykmelding-0-til"]').should('have.text', 'Til');
    cy.get('[data-cy="sykmelding-0-fra-dato"]').should('have.text', '20.02.2023');
    cy.get('[data-cy="sykmelding-0-til-dato"]').should('have.text', '03.03.2023');
  });

  it('should display information on the arbeidsgiverperiode', () => {
    cy.get('[data-cy="arbeidsgiverperiode-0-fra"]').should('have.text', 'Fra');
    cy.get('[data-cy="arbeidsgiverperiode-0-til"]').should('have.text', 'Til');
    cy.get('[data-cy="arbeidsgiverperiode-0-fra-dato"]').should('have.text', '17.02.2023');
    cy.get('[data-cy="arbeidsgiverperiode-0-til-dato"]').should('have.text', '04.03.2023');
  });

  it('should display information on the beregnet månedslønn', () => {
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

    cy.get('#lia-radio [type="radio"]').first().check();
    cy.get('#lus-radio [type="radio"]').last().check();

    cy.get('#bekreft-opplysninger').check();
    cy.get('#bekreft-opplysninger').check();

    cy.checkA11y();

    cy.contains('Send').click();

    cy.get('h2').first().should('have.text', 'Kvittering - innsendt inntektsmelding');
    cy.checkA11y();
  });
});
