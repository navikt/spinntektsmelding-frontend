/// <reference types="cypress" />

const { wait } = require('@testing-library/user-event/dist/cjs/utils/index.js');

describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    // const now = new Date(2021, 3, 14); // month is 0-indexed
    // cy.clock(now);
    // cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    // cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-delvis.json' }).as('hent-forespoersel');
    cy.intercept('/collect', {
      statusCode: 202,
      body: 'OK'
    }).as('collect');

    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');
  });

  it('No changes and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-delvis-uten-bfd.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.wait('@hent-forespoersel');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .findByLabelText('Nei')
      .check();

    cy.findAllByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: null,
        inntekt: {
          beloep: 55000,
          inntektsdato: '2024-01-07',
          naturalytelser: [],
          endringAarsak: null
        },
        refusjon: null,
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findAllByText('24.01.2023').should('not.exist');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /07.01.2024/);
  });

  it('Changes and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-delvis-uten-bfd.json' }).as(
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
    cy.intercept('http://localhost:12347/collect', {
      statusCode: 202,
      body: 'OK'
    });

    cy.wait('@hent-forespoersel');

    cy.location('pathname').should('equal', '/im-dialog/12345678-3456-5678-2457-123456789012');

    wait(100);

    cy.findAllByRole('button', {
      name: 'Endre'
    })
      .eq(1)
      .click();

    cy.findByLabelText('Månedslønn 07.01.2024')
      .invoke('val')
      .then((str) => str.normalize('NFKC').replace(/ /g, ''))
      .should('equal', '55000,00');
    cy.findByLabelText('Månedslønn 07.01.2024').clear().type('60000');

    cy.findAllByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.findAllByText('Vennligst angi årsak for endringen.').should('be.visible');
    cy.findAllByLabelText('Velg endringsårsak').select('Bonus');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .findByLabelText('Ja')
      .check();

    cy.findAllByRole('button', {
      name: 'Endre'
    })
      .eq(1)
      .click();

    cy.findByLabelText('Oppgi refusjonsbeløpet per måned').clear().type('55000');

    cy.findByRole('group', { name: 'Er det endringer i refusjonsbeløpet i perioden?' }).findByLabelText('Nei').check();

    // cy.findByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).findByLabelText('Nei').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: null,
        inntekt: {
          beloep: 60000,
          inntektsdato: '2024-01-07',
          naturalytelser: [],
          endringAarsak: { aarsak: 'Bonus' }
        },
        refusjon: { beloepPerMaaned: 55000, sluttdato: null, endringer: [] },
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findByText('12345678').should('be.visible');
    cy.findByText(/Bonus/).should('be.visible');
    cy.findByText(/60\s?000,00\s?kr\/måned/).should('be.visible');
    cy.findAllByText('24.01.2023').should('not.exist');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /07.01.2024/);
  });
});
