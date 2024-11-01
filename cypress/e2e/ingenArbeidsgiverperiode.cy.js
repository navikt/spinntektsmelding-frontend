/// <reference types="cypress" />

describe('Utfylling av skjema - ingen arbeidsgiverperiode', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    // const now = new Date(2021, 3, 14); // month is 0-indexed
    // cy.clock(now);

    cy.visit('http://localhost:3000/im-dialog/8d50ef20-37b5-4829-ad83-56219e70b375');

    cy.intercept('/im-dialog/api/hentKvittering/8d50ef20-37b5-4829-ad83-56219e70b375', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');

    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-originalen.json' }).as(
      'hent-forespoersel'
    );
  });

  it('can check the "Det er ikke arbeidsgiverperiode" and verify that everithing is OK', () => {
    cy.wait('@hent-forespoersel');

    cy.findByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon i sykefraværet/ }).should('not.exist');
    cy.findByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden/ }).should(
      'exist'
    );

    cy.findByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?/ }).within(
      () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      }
    );

    cy.findAllByText(/Refusjon til arbeidsgiver i sykefraværet/).should('not.exist');
    cy.findAllByText(/Refusjon til arbeidsgiver etter arbeidsgiverperiode/).should('exist');

    cy.get('[data-cy="endre-arbeidsgiverperiode"]').click();
    cy.findByRole('checkbox', { name: /Det er ikke arbeidsgiverperiode/ }).check();

    cy.contains('label', 'Velg begrunnelse').should('exist');

    cy.findByRole('option', { name: /Velg begrunnelse/ }).should('exist');

    cy.findByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ }).within(() => {
      cy.findByRole('radio', { name: 'Ja' }).should('be.disabled');
    });

    cy.findByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon i sykefraværet/ }).should('exist');
    cy.findByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden/ }).should(
      'not.exist'
    );

    cy.findByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon i sykefraværet?/ }).within(() => {
      cy.findByRole('radio', { name: 'Ja' }).click();
    });

    cy.findAllByText(/Refusjon til arbeidsgiver i sykefraværet/).should('exist');
    cy.findAllByText(/Refusjon til arbeidsgiver etter arbeidsgiverperioden/).should('not.exist');

    cy.findAllByText(
      /Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder./
    ).should('exist');

    cy.findAllByRole('button', { name: /Endre/ }).first().should('be.disabled');

    cy.findByRole('checkbox', { name: /Det er ikke arbeidsgiverperiode/ }).uncheck();

    cy.findByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ }).within(() => {
      cy.findByRole('radio', { name: 'Ja' }).should('be.enabled');
    });

    cy.findByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon i sykefraværet/ }).should('not.exist');
    cy.findByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden/ }).should(
      'exist'
    );

    cy.findByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ }).within(() => {
      cy.findByRole('radio', { name: 'Ja' }).should('not.be.checked');
    });
    cy.findByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ }).within(() => {
      cy.findByRole('radio', { name: 'Nei' }).should('not.be.checked');
    });

    cy.findByRole('textbox', { name: /Fra/i }).contains('17.02.2023');
    // cy.get('#arbeidsgiverperioder[0].fom').should('have.text', '17.02.2023');
    cy.get('[data-cy="arbeidsgiverperiode-0-til-dato"]').should('have.text', '04.03.2023');
  });
});
