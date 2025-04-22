/// <reference types="cypress" />

describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    // const now = new Date(2021, 3, 14); // month is 0-indexed
    // cy.clock(now);
    // cy.visit('http://localhost:3000/im-dialog/8d50ef20-37b5-4829-ad83-56219e70b375');
    // cy.intercept('/im-dialog/api/trenger', { fixture: '../../mockdata/trenger-delvis.json' }).as('trenger');
    cy.intercept('/collect', {
      statusCode: 202,
      body: 'OK'
    }).as('collect');

    cy.intercept('GET', '**/im-dialog/api/hentKvittering/8d50ef20-37b5-4829-ad83-56219e70b375', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');
  });

  it('No changes and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-delvis-refusjon.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.wait('@hent-forespoersel');

    cy.location('pathname').should('equal', '/im-dialog/12345678-3456-5678-2457-123456789012');

    // cy.findByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
    //   .findByLabelText('Ja')
    //   .check();

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
          beloep: 26000,
          inntektsdato: '2023-07-01',
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
      .should('match', /01.07.2023/);
  });

  it('Changes and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-delvis-refusjon.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.wait('@hent-forespoersel');

    cy.location('pathname').should('equal', '/im-dialog/12345678-3456-5678-2457-123456789012');

    cy.wait(100);

    cy.findAllByRole('button', {
      name: 'Endre'
    })
      .eq(1)
      .click();

    cy.findByLabelText('Månedslønn 01.07.2023')
      .invoke('val')
      .then((str) => str.normalize('NFKC').replace(/ /g, ''))
      .should('equal', '26000');
    cy.findByLabelText('Månedslønn 01.07.2023').clear().type('50000');

    cy.findAllByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.findAllByText('Vennligst angi årsak til endringen.').should('be.visible');
    cy.findAllByLabelText('Velg endringsårsak').select('Varig lønnsendring');

    cy.findAllByLabelText('Lønnsendring gjelder fra').clear().type('30.06.23');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', { name: 'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?' })
      .findByLabelText('Nei')
      .check();

    // cy.findByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).findByLabelText('Nei').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: null,
        inntekt: {
          beloep: 50000,
          inntektsdato: '2023-07-01',
          naturalytelser: [],

          endringAarsaker: [
            {
              aarsak: 'VarigLoennsendring',
              gjelderFra: '2023-06-30'
            }
          ]
        },
        refusjon: { beloepPerMaaned: 50000, sluttdato: null, endringer: [] },
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findByText('12345678').should('be.visible');
    cy.findByText(/Varig lønnsendringsdato/).should('be.visible');
    cy.findByText(/30.06.2023/).should('be.visible');
    cy.findAllByText(/50\s?000,00\s?kr\/måned/).should('be.visible');
    cy.findAllByText('24.01.2023').should('not.exist');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /01.07.2023/);
  });

  it.skip('Changes to ferie and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/hent-forespoersel', { fixture: '../../mockdata/trenger-delvis-refusjon.json' }).as(
      'hent-forespoersel'
    );
    cy.intercept('/im-dialog/api/innsendingInntektsmelding', {
      statusCode: 201,
      body: {
        name: 'Nothing'
      }
    }).as('innsendingInntektsmelding');

    cy.wait('@hent-forespoersel');

    cy.location('pathname').should('equal', '/im-dialog/12345678-3456-5678-2457-123456789012');

    cy.wait(100);

    cy.findAllByRole('button', {
      name: 'Endre'
    })
      .eq(1)
      .click();

    cy.findByLabelText('Månedslønn 01.07.2023')
      .invoke('val')
      .then((str) => str.normalize('NFKC').replace(/ /g, ''))
      .should('equal', '26000');
    cy.findByLabelText('Månedslønn 01.07.2023').clear().type('50000');

    cy.findAllByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.findAllByText('Vennligst angi årsak til endringen.').should('be.visible');
    cy.findByLabelText('Velg endringsårsak').as('velg');
    // cy.get('@velg').invoke('attr', 'value', 'Ferie');
    cy.get('@velg').select('Ferie', { force: true });

    cy.get('@velg').type('Ferie{downArrow}{enter}', { force: true });

    cy.findAllByLabelText('Ferie fra').as('ferieFra');
    cy.get('@ferieFra').clear();
    cy.get('@ferieFra').type('30.06.23');

    cy.findAllByLabelText('Ferie til').as('ferieTil');
    cy.get('@ferieTil').clear();
    cy.get('@ferieTil').type('05.07.23');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .findByLabelText('Ja')
      .check();

    cy.findByRole('group', { name: 'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?' })
      .findByLabelText('Nei')
      .check();

    // cy.findByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).findByLabelText('Nei').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        forespoerselId: '12345678-3456-5678-2457-123456789012',
        agp: null,
        inntekt: {
          beloep: 50000,
          inntektsdato: '2023-07-01',
          naturalytelser: [],

          endringAarsaker: [
            {
              aarsak: 'Ferie',
              ferier: [
                {
                  fom: '2023-06-30',
                  tom: '2023-07-05'
                }
              ]
            }
          ]
        },
        refusjon: { beloepPerMaaned: 50000, sluttdato: null, endringer: [] },
        avsenderTlf: '12345678'
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findByText('12345678').should('be.visible');
    cy.findAllByText(/Ferie/).should('exist');
    cy.findByText(/30.06.2023/).should('be.visible');
    cy.findByText(/05.07.2023/).should('be.visible');
    cy.findAllByText(/50\s?000,00\s?kr\/måned/).should('be.visible');
    // cy.findAllByText('24.01.2023').should('not.exist');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /01.07.2023/);
  });
});
