/// <reference types="cypress" />

describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');
  });

  it('No changes and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/hent-forespoersel', {
      fixture: '../../mockdata/trenger-delvis-enkel-variant.json'
    }).as('hent-forespoersel');
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
          beloep: 36000,
          inntektsdato: '2024-12-05',
          naturalytelser: [],

          endringAarsaker: []
        },
        refusjon: null,
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findAllByText('24.01.2023').should('not.exist');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /05.12.2024/);
  });

  it('Changes and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/hent-forespoersel', {
      fixture: '../../mockdata/trenger-delvis-enkel-variant.json'
    }).as('hent-forespoersel');
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.wait('@hent-forespoersel');

    cy.findAllByRole('button', {
      name: 'Endre'
    })
      .eq(1)
      .click();

    cy.findByLabelText('Månedslønn 05.12.2024')
      .invoke('val')
      .then((str) => str.normalize('NFKC').replace(/ /g, ''))
      .should('equal', '36000');
    cy.findByLabelText('Månedslønn 05.12.2024').clear().type('50000');

    cy.findByRole('group', {
      name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.findAllByText('Vennligst angi årsak for endringen.').should('be.visible');
    cy.findAllByLabelText('Velg endringsårsak').select('Bonus');

    cy.findByRole('group', { name: 'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?' })
      .findByLabelText('Ja')
      .check();

    cy.findByLabelText('Endret beløp/måned').type('45000');

    cy.findByLabelText('Dato for endring').type('30.09.2025');

    // cy.findByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).findByLabelText('Nei').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: null,
        inntekt: {
          beloep: 50000,
          inntektsdato: '2024-12-05',
          naturalytelser: [],

          endringAarsaker: [{ aarsak: 'Bonus' }]
        },
        refusjon: {
          beloepPerMaaned: 50000,
          sluttdato: null,
          endringer: [
            {
              beloep: 45000,
              startdato: '2025-09-30'
            }
          ]
        },
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findByText('12345678').should('be.visible');
    cy.findByText(/Bonus/).should('be.visible');
    cy.findAllByText(/50\s?000,00\s?kr\/måned/).should('be.visible');
    cy.findByText(/45\s?000,00/).should('be.visible');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /05.12.2024/);
  });
});
