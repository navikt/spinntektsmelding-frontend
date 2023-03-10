/// <reference types="cypress" />

// Welcome to Cypress!
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/im-dialog/1234-3456-5678-2457');
  });

  it('can click the Endre arbeidsgiverperiode button so that egenmelding gets disabled', () => {
    cy.get('[data-cy="endre-arbeidsgiverperiode"]').click();
    cy.get('.navds-alert--info .navds-alert__wrapper').should(
      'have.text',
      'Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder.'
    );
  });
});
