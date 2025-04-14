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

    cy.intercept('/collect', {
      statusCode: 202,
      body: 'OK'
    }).as('collect');

    cy.intercept('/im-dialog/api/logger', {
      statusCode: 200,
      body: 'OK'
    }).as('logger');

    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');
  });

  it('can check the radioboxes for refusjon and submit', () => {
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-en-sykeperiode.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.intercept('/im-dialog/api/inntektsdata', { fixture: '../../mockdata/inntektData.json' }).as('inntektsdata');

    cy.wait('@hent-forespoersel');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', {
      name: /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/
    }).within(() => {
      cy.findByRole('radio', { name: 'Nei' }).click();
    });

    // cy.findByRole('group', { name: /Opphører refusjonkravet i perioden?/ }).within(() => {
    //   cy.findByRole('radio', { name: 'Nei' }).click();
    // });

    cy.get('[data-cy="endre-beloep"]').click();

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.get('[data-cy="inntekt-beloep-input"]').clear();
    cy.get('[data-cy="inntekt-beloep-input"]').type('70000');

    cy.get('[data-cy="refusjon-arbeidsgiver-beloep"]')
      .invoke('text')
      .should('match', /70\s000,00\skr/);

    cy.get('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();

    cy.get('[data-cy="inntekt-beloep-input"]').clear().type('75000');

    cy.get('[data-cy="refusjon-arbeidsgiver-beloep-input"]').should('have.value', '75000');

    cy.findAllByLabelText('Velg endringsårsak').select('Bonus');

    cy.findAllByRole('button', { name: /Endre/ }).first().click();

    cy.findByRole('button', { name: /Legg til periode/ }).click();

    cy.findAllByLabelText('Fra').last().clear().type('30.01.23');
    // cy.realPress('Escape');
    cy.findAllByLabelText('Til').last().clear().type('01.02.23');
    // cy.realPress('Escape');

    cy.wait('@inntektsdata').its('request.body').should('deep.equal', {
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      skjaeringstidspunkt: '2023-01-30'
    });

    cy.contains('Send').click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: {
          perioder: [
            {
              fom: '2023-01-30',
              tom: '2023-02-14'
            }
          ],
          egenmeldinger: [
            {
              fom: '2023-02-02',
              tom: '2023-02-02'
            },
            {
              fom: '2023-01-30',
              tom: '2023-02-01'
            }
          ],
          redusertLoennIAgp: null
        },
        inntekt: {
          beloep: 84333.33,
          inntektsdato: '2023-01-30',
          naturalytelser: [],

          endringAarsaker: [
            {
              aarsak: 'Bonus'
            }
          ]
        },
        refusjon: { beloepPerMaaned: 84333.33, sluttdato: null, endringer: [] },
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');
  });

  it('can check the radioboxes for refusjon and status to ferie and submit', () => {
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-en-sykeperiode.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.intercept('/im-dialog/api/inntektsdata', { fixture: '../../mockdata/inntektData.json' }).as('inntektsdata');

    cy.wait('@hent-forespoersel');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', {
      name: /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/
    }).within(() => {
      cy.findByRole('radio', { name: 'Nei' }).click();
    });

    cy.get('[data-cy="endre-beloep"]').click();

    cy.get('[data-cy="inntekt-beloep-input"]').clear();
    cy.get('[data-cy="inntekt-beloep-input"]').type('70000');

    cy.get('[data-cy="refusjon-arbeidsgiver-beloep"]')
      .invoke('text')
      .should('match', /70\s000,00\skr/);

    cy.get('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();

    cy.get('[data-cy="inntekt-beloep-input"]').clear().type('75000');

    cy.get('[data-cy="refusjon-arbeidsgiver-beloep-input"]').should('have.value', '75000');

    cy.findAllByLabelText('Velg endringsårsak').select('Ferie');

    // Jeg er ikke sikker på hvorfor det må være denne frem og tilbakde dansen
    cy.findAllByLabelText('Ferie til').last().clear().type('30.12.22');

    cy.findAllByLabelText('Ferie fra').last().clear().type('25.12.22');
    cy.findAllByLabelText('Ferie til').last().clear().type('30.12.22');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.contains('Send').click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: {
          perioder: [
            {
              fom: '2023-02-02',
              tom: '2023-02-17'
            }
          ],
          egenmeldinger: [
            {
              fom: '2023-02-02',
              tom: '2023-02-02'
            }
          ],
          redusertLoennIAgp: null
        },
        inntekt: {
          beloep: 75000,
          inntektsdato: '2023-02-02',
          naturalytelser: [],

          endringAarsaker: [
            {
              aarsak: 'Ferie',
              ferier: [
                {
                  fom: '2022-12-25',
                  tom: '2022-12-30'
                }
              ]
            }
          ]
        },
        refusjon: { beloepPerMaaned: 75000, sluttdato: null, endringer: [] },
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');
  });

  it('can check the radioboxes for refusjon and status to Varig lønnsendring and submit', () => {
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-en-sykeperiode.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
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

    cy.findByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', {
      name: /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/
    }).within(() => {
      cy.findByRole('radio', { name: 'Nei' }).click();
    });

    // cy.findByRole('group', { name: /Opphører refusjonkravet i perioden?/ }).within(() => {
    //   cy.findByRole('radio', { name: 'Nei' }).click();
    // });

    cy.get('[data-cy="endre-beloep"]').click();

    cy.get('[data-cy="inntekt-beloep-input"]').clear();
    cy.get('[data-cy="inntekt-beloep-input"]').type('70000');

    cy.get('[data-cy="refusjon-arbeidsgiver-beloep"]')
      .invoke('text')
      .should('match', /70\s000,00\skr/);

    cy.get('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();

    cy.get('[data-cy="inntekt-beloep-input"]').clear().type('75000');

    cy.get('[data-cy="refusjon-arbeidsgiver-beloep-input"]').should('have.value', '75000');

    cy.findAllByRole('button', { name: /Endre/ }).first().click();
    cy.findByRole('button', { name: /Legg til periode/ }).click();

    cy.findAllByLabelText('Fra').last().clear().type('30.01.23');
    // cy.realPress('Escape');
    cy.findAllByLabelText('Til').last().clear().type('01.02.23');
    // cy.realPress('Escape');

    cy.findAllByLabelText('Velg endringsårsak').select('Varig lønnsendring');

    cy.findAllByLabelText('Lønnsendring gjelder fra').clear().type('30.12.22');
    // cy.realPress('Tab');
    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.contains('Send').click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: {
          perioder: [
            {
              fom: '2023-01-30',
              tom: '2023-02-14'
            }
          ],
          egenmeldinger: [
            {
              fom: '2023-02-02',
              tom: '2023-02-02'
            },
            {
              fom: '2023-01-30',
              tom: '2023-02-01'
            }
          ],
          redusertLoennIAgp: null
        },
        inntekt: {
          beloep: 84333.33,
          inntektsdato: '2023-01-30',
          naturalytelser: [],

          endringAarsaker: [
            {
              aarsak: 'VarigLoennsendring',
              gjelderFra: '2022-12-30'
            }
          ]
        },
        refusjon: { beloepPerMaaned: 84333.33, sluttdato: null, endringer: [] },
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');
  });
});
