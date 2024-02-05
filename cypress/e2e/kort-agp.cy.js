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
    cy.intercept('/im-dialog/api/trenger', { fixture: '../../mockdata/trenger-originalen-16dager.json' }).as('trenger');
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

    cy.wait('@trenger');

    // cy.findByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
    //   .findByLabelText('Ja')
    //   .check();

    // cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
    //   .findByLabelText('Ja')
    //   .check();

    // cy.get('#lus-utbetaling-endring-radio [type="radio"]').last().click();
    // cy.get('#lus-sluttdato-velg [type="radio"]').last().click();

    // cy.get('[data-cy="endre-belop"]').click();

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // cy.get('[data-cy="inntekt-belop-input"]').clear();
    // cy.get('[data-cy="inntekt-belop-input"]').type('70000');

    // cy.get('[data-cy="refusjon-arbeidsgiver-belop"]')
    //   .invoke('text')
    //   .should('match', /70\s000,00\skr/);

    // cy.get('[data-cy="endre-refusjon-arbeidsgiver-belop"]').click();

    // cy.get('[data-cy="inntekt-belop-input"]').clear().type('75000');

    // cy.get('[data-cy="refusjon-arbeidsgiver-belop-input"]').should('have.value', '75000');

    // cy.findAllByLabelText('Velg endringsårsak').select('Bonus');

    cy.findAllByRole('button', { name: /Endre/ }).first().click();
    // cy.findByRole('button', { name: /Legg til periode/ }).click();

    // cy.findAllByLabelText('Fra').last().clear().type('30.01.23');
    // cy.realPress('Escape');
    cy.findAllByLabelText('Til').last().clear().type('116.03.23');
    cy.realPress('Escape');

    cy.findByLabelText('Utbetalt under arbeidsgiverperiode').clear().type('50000');
    cy.realPress('Escape');

    // cy.wait('@inntektsdata').its('request.body').should('deep.equal', {
    //   forespoerselId: '12345678-3456-5678-2457-123456789012',
    //   skjaeringstidspunkt: '2023-01-30'
    // });

    cy.findAllByLabelText('Velg begrunnelse for kort arbeidsgiverperiode').select('Arbeidsforholdet er avsluttet');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .findByLabelText('Nei')
      .check();

    cy.contains('Send').click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        orgnrUnderenhet: '911206722',
        identitetsnummer: '25087327879',
        egenmeldingsperioder: [],
        fraværsperioder: [
          {
            fom: '2023-02-20',
            tom: '2023-03-04'
          },
          {
            fom: '2023-03-15',
            tom: '2023-03-17'
          }
        ],
        arbeidsgiverperioder: [
          {
            fom: '2023-02-20',
            tom: '2023-03-04'
          },
          {
            fom: '2023-03-15',
            tom: '2023-03-16'
          }
        ],
        inntekt: {
          bekreftet: true,
          beregnetInntekt: 77000,
          manueltKorrigert: false
        },
        bestemmendeFraværsdag: '2023-03-15',
        fullLønnIArbeidsgiverPerioden: {
          utbetalerFullLønn: false,
          begrunnelse: 'ArbeidOpphoert',
          utbetalt: 50000
        },
        refusjon: {
          utbetalerHeleEllerDeler: false
        },
        bekreftOpplysninger: true,
        behandlingsdager: [],
        årsakInnsending: 'Ny',
        telefonnummer: '12345678',
        forespurtData: ['arbeidsgiverperiode', 'inntekt', 'refusjon']
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');
  });
});
