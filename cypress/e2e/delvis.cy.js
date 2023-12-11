/// <reference types="cypress" />

describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    // const now = new Date(2021, 3, 14); // month is 0-indexed
    // cy.clock(now);
    // cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    // cy.intercept('/im-dialog/api/trenger', { fixture: '../../mockdata/trenger-delvis.json' }).as('trenger');
  });

  it('No changes and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/trenger', { fixture: '../../mockdata/trenger-delvis.json' }).as('trenger');
    cy.intercept('/im-dialog/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012').as(
      'innsendingInntektsmelding'
    );
    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');

    cy.wait('@kvittering');
    cy.wait('@trenger');

    // cy.location('pathname').should('equal', '/im-dialog/endring/12345678-3456-5678-2457-123456789012');

    cy.findByRole('group', {
      name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 02.01.2023 og 01.01.2023 (start av nytt sykefravær)?'
    })
      .findByLabelText('Nei')
      .check();

    cy.findByRole('group', {
      name: 'Har det vært endringer i refusjonskrav mellom 02.01.2023 og 01.01.2023 (start av nytt sykefravær)?'
    })
      .findByLabelText('Nei')
      .check();

    cy.findAllByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        orgnrUnderenhet: '810007842',
        identitetsnummer: '10486535275',
        egenmeldingsperioder: [],
        fraværsperioder: [
          { fom: '2023-01-02', tom: '2023-01-20' },
          { fom: '2023-01-24', tom: '2023-01-29' }
        ],
        arbeidsgiverperioder: [],
        inntekt: { bekreftet: true, beregnetInntekt: 46000, manueltKorrigert: false },
        bestemmendeFraværsdag: '2023-01-01',
        refusjon: {
          utbetalerHeleEllerDeler: true,
          refusjonPrMnd: 46000,
          refusjonEndringer: [
            {
              beløp: 46000,
              dato: '2023-01-02'
            },
            {
              beløp: 0,
              dato: '2023-09-30'
            }
          ]
        },
        bekreftOpplysninger: true,
        behandlingsdager: [],
        årsakInnsending: 'Ny',
        telefonnummer: '12345678',
        forespurtData: ['inntekt', 'refusjon']
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findAllByText('24.01.2023').should('not.exist');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /01.01.2023/);
  });

  it('Changes and submit', () => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    cy.intercept('/im-dialog/api/trenger', { fixture: '../../mockdata/trenger-delvis.json' }).as('trenger');
    cy.intercept('/im-dialog/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012').as(
      'innsendingInntektsmelding'
    );
    cy.intercept('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', {
      statusCode: 404,
      body: {
        name: 'Nothing'
      }
    }).as('kvittering');
    cy.wait('@kvittering');
    cy.wait('@trenger');

    cy.location('pathname').should('equal', '/im-dialog/endring/12345678-3456-5678-2457-123456789012');

    cy.findByRole('group', {
      name: 'Har det vært endringer i beregnet månedslønn for den ansatte mellom 02.01.2023 og 01.01.2023 (start av nytt sykefravær)?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findByLabelText('Månedsinntekt 01.01.2023').invoke('val').should('equal', '46 000,00');
    cy.findByLabelText('Månedsinntekt 01.01.2023').clear().type('50000');

    cy.findByRole('group', {
      name: 'Har det vært endringer i refusjonskrav mellom 02.01.2023 og 01.01.2023 (start av nytt sykefravær)?'
    })
      .findByLabelText('Ja')
      .check();

    cy.findByLabelText('Telefon innsender').type('12345678');

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.findAllByText('Vennligst angi årsak for endringen.').should('be.visible');
    cy.findAllByLabelText('Velg endringsårsak').select('Bonus');

    cy.findByRole('group', { name: 'Opphører refusjonkravet i perioden?' }).findByLabelText('Nei').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        orgnrUnderenhet: '810007842',
        identitetsnummer: '10486535275',
        egenmeldingsperioder: [],
        fraværsperioder: [
          { fom: '2023-01-02', tom: '2023-01-20' },
          { fom: '2023-01-24', tom: '2023-01-29' }
        ],
        arbeidsgiverperioder: [],
        inntekt: { bekreftet: true, beregnetInntekt: 50000, manueltKorrigert: true, endringÅrsak: { typpe: 'Bonus' } },
        bestemmendeFraværsdag: '2023-01-01',
        refusjon: {
          utbetalerHeleEllerDeler: true,
          refusjonPrMnd: 46000,
          refusjonEndringer: [
            {
              beløp: 46000,
              dato: '2023-01-02'
            },
            {
              beløp: 0,
              dato: '2023-09-30'
            }
          ]
        },
        bekreftOpplysninger: true,
        behandlingsdager: [],
        årsakInnsending: 'Ny',
        telefonnummer: '12345678',
        forespurtData: ['inntekt', 'refusjon']
      });

    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.findByText('12345678').should('be.visible');
    cy.findByText(/Bonus/).should('be.visible');
    cy.findByText(/50\s?000,00\s?kr\/måned/).should('be.visible');
    cy.findByText(/46\s?000,00\s?kr\/måned/).should('be.visible');
    cy.findAllByText('24.01.2023').should('not.exist');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /01.01.2023/);
  });
});
