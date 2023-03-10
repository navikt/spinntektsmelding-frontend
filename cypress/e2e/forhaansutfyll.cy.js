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

    cy.visit('http://localhost:3000/im-dialog/1234-3456-5678-2457');
    cy.injectAxe();
  });

  it('Has no detectable a11y violations on load', () => {
    // Test the page at initial load
    cy.checkA11y();
  });

  it('should display information on the person and the submitter', () => {
    cy.get('[data-cy="navn"]').should('have.text', 'Navn Navnesen');
    cy.get('[data-cy="identitetsnummer"]').should('have.text', '25087327879');
    cy.get('[data-cy="virksomhetsnavn"]').should('have.text', 'Ampert piggsvin barnehage');
    cy.get('[data-cy="orgnummer"]').should('have.text', '911206722');
    cy.get('[data-cy="innsendernavn"]').should('have.text', 'Test Testesen');
    cy.get('[data-cy="innsendertlf"]').should('have.value', '12345678');
  });

  it('should display information on the egenmelding', () => {
    cy.get('[data-cy="egenmelding"] .navds-label').first().should('have.text', 'Fra');
    cy.get('[data-cy="egenmelding"] .navds-label').last().should('have.text', 'Til');
    cy.get('[data-cy="egenmelding"] .navds-date__field-input').should('have.value', '');
  });

  it('should display information on the sykmelding', () => {
    cy.get('[data-cy="sykmelding-0-fra"]').should('have.text', 'Fra');
    cy.get('[data-cy="sykmelding-0-til"]').should('have.text', 'Til');
    cy.get('[data-cy="sykmelding-0-fra-dato"]').should('have.text', '20.02.2023');
    cy.get('[data-cy="sykmelding-0-til-dato"]').should('have.text', '03.03.2023');
  });

  it('should display information on the arbeidsgiverperiode', () => {
    cy.get('[data-cy="arbeidsgiverperiode-0-fra"]').should('have.text', 'Fra');
    cy.get('[data-cy="arbeidsgiverperiode-0-til"]').should('have.text', 'Til');
    cy.get('[data-cy="arbeidsgiverperiode-0-fra-dato"]').should('have.text', '20.02.2023');
    cy.get('[data-cy="arbeidsgiverperiode-0-til-dato"]').should('have.text', '06.03.2023');
  });

  it('should display information on the beregnet månedslønn', () => {
    cy.get('[data-cy="tidligereinntekt"] tbody tr').its('length').should('be.eq', 3);
    cy.get('[data-cy="tidligereinntekt"] tbody tr').first().find('td').first().should('have.text', 'November:');
    cy.get('[data-cy="tidligereinntekt"] tbody tr')
      .first()
      .find('td')
      .last()
      .invoke('text')
      .should('match', /88\s000,00\skr/);
    cy.get('[data-cy="tidligereinntekt"] tbody tr').last().find('td').first().should('have.text', 'Januar:');
    cy.get('[data-cy="tidligereinntekt"] tbody tr')
      .last()
      .find('td')
      .last()
      .invoke('text')
      .should('match', /66\s000,00\skr/);
  });

  it('can click the Endre arbeidsgiverperiode button so that egenmelding gets disabled', () => {
    cy.contains('Endre').first().click();

    cy.get('.navds-alert--info .navds-alert__wrapper').should(
      'have.text',
      'Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder.'
    );
  });

  it('can check some radioboxes and submit the form', () => {
    cy.get('#lia-radio [type="radio"]').first().check();
    cy.get('#lus-radio [type="radio"]').last().check();

    cy.get('#bekreft-opplysninger').check();

    cy.contains('Send').click();

    cy.get('h2').first().should('have.text', 'Kvittering - innsendt inntektsmelding');

    cy.checkA11y();

    // We'll store our item text in a variable so we can reuse it
    // const newItem = 'Feed the cat';

    // // Let's get the input element and use the `type` command to
    // // input our new list item. After typing the content of our item,
    // // we need to type the enter key as well in order to submit the input.
    // // This input has a data-test attribute so we'll use that to select the
    // // element in accordance with best practices:
    // // https://on.cypress.io/selecting-elements
    // cy.get('[data-test=new-todo]').type(`${newItem}{enter}`);

    // // Now that we've typed our new item, let's check that it actually was added to the list.
    // // Since it's the newest item, it should exist as the last element in the list.
    // // In addition, with the two default items, we should have a total of 3 elements in the list.
    // // Since assertions yield the element that was asserted on,
    // // we can chain both of these assertions together into a single statement.
    // cy.get('.todo-list li').should('have.length', 3).last().should('have.text', newItem);
  });

  // it('can check off an item as completed', () => {
  //   // In addition to using the `get` command to get an element by selector,
  //   // we can also use the `contains` command to get an element by its contents.
  //   // However, this will yield the <label>, which is lowest-level element that contains the text.
  //   // In order to check the item, we'll find the <input> element for this <label>
  //   // by traversing up the dom to the parent element. From there, we can `find`
  //   // the child checkbox <input> element and use the `check` command to check it.
  //   cy.contains('Pay electric bill').parent().find('input[type=checkbox]').check();

  //   // Now that we've checked the button, we can go ahead and make sure
  //   // that the list element is now marked as completed.
  //   // Again we'll use `contains` to find the <label> element and then use the `parents` command
  //   // to traverse multiple levels up the dom until we find the corresponding <li> element.
  //   // Once we get that element, we can assert that it has the completed class.
  //   cy.contains('Pay electric bill').parents('li').should('have.class', 'completed');
  // });

  // context('with a checked task', () => {
  //   beforeEach(() => {
  //     // We'll take the command we used above to check off an element
  //     // Since we want to perform multiple tests that start with checking
  //     // one element, we put it in the beforeEach hook
  //     // so that it runs at the start of every test.
  //     cy.contains('Pay electric bill').parent().find('input[type=checkbox]').check();
  //   });

  //   it('can filter for uncompleted tasks', () => {
  //     // We'll click on the "active" button in order to
  //     // display only incomplete items
  //     cy.contains('Active').click();

  //     // After filtering, we can assert that there is only the one
  //     // incomplete item in the list.
  //     cy.get('.todo-list li').should('have.length', 1).first().should('have.text', 'Walk the dog');

  //     // For good measure, let's also assert that the task we checked off
  //     // does not exist on the page.
  //     cy.contains('Pay electric bill').should('not.exist');
  //   });

  //   it('can filter for completed tasks', () => {
  //     // We can perform similar steps as the test above to ensure
  //     // that only completed tasks are shown
  //     cy.contains('Completed').click();

  //     cy.get('.todo-list li').should('have.length', 1).first().should('have.text', 'Pay electric bill');

  //     cy.contains('Walk the dog').should('not.exist');
  //   });

  //   it('can delete all completed tasks', () => {
  //     // First, let's click the "Clear completed" button
  //     // `contains` is actually serving two purposes here.
  //     // First, it's ensuring that the button exists within the dom.
  //     // This button only appears when at least one task is checked
  //     // so this command is implicitly verifying that it does exist.
  //     // Second, it selects the button so we can click it.
  //     cy.contains('Clear completed').click();

  //     // Then we can make sure that there is only one element
  //     // in the list and our element does not exist
  //     cy.get('.todo-list li').should('have.length', 1).should('not.have.text', 'Pay electric bill');

  //     // Finally, make sure that the clear button no longer exists.
  //     cy.contains('Clear completed').should('not.exist');
  //   });
  // });
});
