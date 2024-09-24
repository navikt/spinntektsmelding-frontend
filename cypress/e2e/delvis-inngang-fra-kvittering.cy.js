/// <reference types="cypress" />

import trengerDelvis from '../../mockdata/trenger-delvis.json';

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
  });

  it('Changes and submit', () => {
    trengerDelvis.erBesvart = true;
    cy.intercept('/im-dialog/api/hent-forespoersel', trengerDelvis).as('hent-forespoersel');
    cy.intercept('/im-dialog/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');
    cy.intercept('/im-dialog/api/inntektsdata', { fixture: '../../mockdata/inntektData.json' }).as('inntektsdata');

    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      fixture: '../../mockdata/kvittering-delvis.json'
    }).as('kvittering');

    cy.intercept('/collect', {
      statusCode: 202,
      body: 'OK'
    }).as('collect');

    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    cy.wait('@kvittering');

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');

    cy.findAllByRole('button', { name: 'Endre' }).first().click();

    cy.wait(5000);

    cy.location('pathname', { timeout: 60000 }).should(
      'equal',
      '/im-dialog/endring/12345678-3456-5678-2457-123456789012'
    );

    cy.findByRole('group', {
      name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 02.01.2023 og 02.01.2023 (start av nytt sykefravær)?'
    })
      .findByLabelText('Ja')
      .check();
    // cy.findByRole('button', { name: 'Endre' }).click();

    cy.findByLabelText('Månedsinntekt 02.01.2023').invoke('val').should('equal', '65000');
    cy.findByLabelText('Månedsinntekt 02.01.2023').clear().type('50000');

    cy.findByRole('group', {
      name: 'Er det endringer i refusjonskravet etter 02.01.2023 (start av nytt sykefravær)?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findAllByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.findAllByText('Vennligst angi årsak for endringen.').should('be.visible');
    cy.findAllByLabelText('Velg endringsårsak').select('Bonus');

    cy.findByRole('group', {
      name: 'Er det endringer i refusjonsbeløpet i perioden?'
    })
      .findByLabelText('Ja')
      .check();

    // cy.findByRole('group', {
    //   name: 'Er det endringer i refusjonsbeløpet i perioden?'
    // })
    //   .findByLabelText('Nei')
    //   .check();

    cy.findByRole('group', {
      name: 'Opphører refusjonkravet i perioden?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findByLabelText('Angi siste dag dere krever refusjon for').clear().type('30.09.23');
    // cy.realPress('Escape');

    cy.findByRole('button', { name: 'Endre' }).click();

    cy.findByLabelText('Oppgi refusjonsbeløpet per måned').clear().type('50000');
    // cy.realPress('Escape');

    cy.wait(1000);

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: null,
        inntekt: {
          beloep: 50000,
          inntektsdato: '2023-01-02',
          naturalytelser: [],
          endringAarsak: { aarsak: 'Bonus' }
        },
        refusjon: {
          beloepPerMaaned: 50000,
          sluttdato: '2023-09-30',
          endringer: []
        },
        avsenderTlf: '12345678'
      });

    // cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findByText('12345678').should('be.visible');
    cy.findByText(/Bonus/).should('be.visible');
    cy.findAllByText(/50\s?000,00\s?kr\/måned/)
      .should('be.visible')
      .then((elements) => {
        expect(elements.length).to.equal(2);
      });
    cy.findAllByText('24.01.2023').should('not.exist');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /02.01.2023/);
  });
});
