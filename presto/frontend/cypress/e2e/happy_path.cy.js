const BACKEND_URL = 'http://localhost:5005';

const seedUserAndPresentation = (email, password, name, presentation) => {
  cy.request('POST', `${BACKEND_URL}/admin/auth/register`, { email, password, name })
    .its('body.token')
    .then((token) => {
      cy.request({
        method: 'PUT',
        url: `${BACKEND_URL}/store`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          store: {
            presentations: [presentation],
          },
        },
      });
    });
};

describe('Happy Path', () => {
  const userEmail = `happy${Date.now()}@example.com`;
  const userPass = 'password123';
  const deckName = 'Seeded Happy Deck';

  beforeEach(() => {
    cy.intercept('POST', '**/admin/auth/login').as('login');
    cy.intercept('GET', '**/store').as('getStore');
    cy.intercept('PUT', '**/store').as('storeSave');

    seedUserAndPresentation(userEmail, userPass, 'Happy Admin', {
      id: 'deck-happy-1',
      name: deckName,
      description: 'Seeded deck for Cypress',
      thumbnail: '',
      slides: [
        {
          id: 'slide-1',
          background: { kind: 'solid', value: '#ffffff' },
          elements: [],
        },
      ],
      updatedAt: Date.now(),
      fontFamily: 'Georgia, serif',
      defaultBackground: { kind: 'solid', value: '#ffffff' },
      history: [],
    });

    cy.visit('/');
  });

  it('opens dashboard, deck, and editor from seeded data', () => {
    cy.contains('button', 'Login').click();
    cy.contains('label', 'Email').parent().find('input').type(userEmail);
    cy.contains('label', 'Password').parent().find('input').type(userPass);
    cy.contains('button', 'Sign In').click();
    cy.wait('@login');
    cy.wait('@getStore');

    cy.contains('h2', 'Presentations').should('be.visible');
    cy.contains('h3', deckName).should('be.visible').click();
    cy.contains('button', '+ Add Slide').should('be.visible');

    cy.contains('button', '+ Add Slide').click();
    cy.wait('@storeSave');

    cy.contains('button', 'Slide panel').click();
    cy.contains('h2', 'Slide Panel').should('be.visible');
    cy.contains('Slide 1').should('be.visible');
    cy.get('button[aria-label="Close Modal"]').click();

    cy.contains('button', 'Version history').click();
    cy.contains('h2', 'Version History').should('be.visible');
    cy.contains('button', 'Restore').should('be.visible');
    cy.get('button[aria-label="Close Modal"]').click();

    cy.contains('button', 'Back').click();
    cy.contains('h2', 'Presentations').should('be.visible');
    cy.contains('button', 'Logout').click();
    cy.url().should('include', '/login');
    cy.contains('h2', 'Login to Presto').should('be.visible');
  });
});
