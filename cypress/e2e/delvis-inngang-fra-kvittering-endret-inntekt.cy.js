/// <reference types="cypress" />

import trengerDelvis from '../../mockdata/trenger-delvis.json';

describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    cy.intercept('/collect', {
      statusCode: 202,
      body: 'OK'
    }).as('collect');
  });

  it('Changes and submit', () => {
    trengerDelvis.erBesvart = true;
    cy.intercept('/im-dialog/api/hent-forespoersel', trengerDelvis).as('hent-forespoersel');
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');
    cy.intercept('/im-dialog/api/inntektsdata', { fixture: '../../mockdata/inntektData.json' }).as('inntektsdata');

    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      fixture: '../../mockdata/kvittering-delvis-endret-inntekt.json'
    }).as('kvittering');

    cy.intercept('/collect', {
      statusCode: 202,
      body: 'OK'
    }).as('collect');

    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    cy.wait('@kvittering');

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');

    cy.wait(1000);

    cy.findAllByRole('button', { name: 'Endre' }).first().click();

    cy.wait(1000);

    cy.location('pathname', { timeout: 60000 }).should('equal', '/im-dialog/12345678-3456-5678-2457-123456789012');

    cy.findAllByRole('button', {
      name: 'Endre'
    })
      .eq(1)
      .click();

    cy.findByLabelText('Månedslønn 02.01.2023')
      .invoke('val')
      .then((str) => str.normalize('NFKC').replace(/ /g, ''))
      .should('equal', '65000');
    cy.findByLabelText('Månedslønn 02.01.2023').clear().type('50000');

    cy.findAllByLabelText('Velg endringsårsak').select('Bonus');

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findAllByLabelText('Telefon innsender').should('have.value', '12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('group', {
      name: 'Er det endringer i refusjonsbeløpet i perioden?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findAllByRole('button', { name: 'Endre' }).eq(1).click();

    cy.findByLabelText('Oppgi refusjonsbeløpet per måned').clear();
    cy.findByLabelText('Oppgi refusjonsbeløpet per måned').type('50000');
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
          endringAarsak: null,
          endringsaarsaker: [{ aarsak: 'Bonus' }]
        },
        refusjon: { beloepPerMaaned: 50000, sluttdato: null, endringer: [] },
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
