/// <reference types="cypress" />

describe('Utfylling og innsending av skjema', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
  });

  it('can check the radioboxes for refusjon and submit', () => {
    cy.intercept('/im-dialog/api/trenger', { fixture: '../../mockdata/trenger-to-arbeidsforhold.json' }).as('trenger');
    cy.intercept('/im-dialog/api/innsendingInntektsmelding/12345678-3456-5678-2457-123456789012').as(
      'innsendingInntektsmelding'
    );

    cy.wait('@trenger');

    cy.findAllByLabelText('Telefon innsender').type('12345678');

    cy.findByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .findByLabelText('Ja')
      .check();
    cy.findByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .findByLabelText('Nei')
      .check();

    cy.findByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    cy.findByRole('button', { name: 'Send' }).click();

    cy.wait('@innsendingInntektsmelding')
      .its('request.body')
      .should('deep.equal', {
        orgnrUnderenhet: '810007842',
        identitetsnummer: '10486535275',
        egenmeldingsperioder: [],
        fraværsperioder: [
          { fom: '2023-09-04', tom: '2023-09-10' },
          { fom: '2023-09-11', tom: '2023-09-24' }
        ],
        arbeidsgiverperioder: [{ fom: '2023-09-04', tom: '2023-09-19' }],
        inntekt: { bekreftet: true, beregnetInntekt: 45000, manueltKorrigert: false },
        bestemmendeFraværsdag: '2023-08-23',
        fullLønnIArbeidsgiverPerioden: { utbetalerFullLønn: true, begrunnelse: null, utbetalt: null },
        refusjon: { utbetalerHeleEllerDeler: false },
        bekreftOpplysninger: true,
        behandlingsdager: [],
        årsakInnsending: 'Ny',
        telefonnummer: '12345678',
        forespurtData: ['arbeidsgiverperiode', 'inntekt', 'refusjon']
      });
    cy.location('pathname').should('equal', '/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    cy.findAllByText('Kvittering - innsendt inntektsmelding').should('be.visible');

    cy.get('[data-cy="bestemmendefravaersdag"]')
      .invoke('text')
      .should('match', /23.08.2023/);
  });
});
