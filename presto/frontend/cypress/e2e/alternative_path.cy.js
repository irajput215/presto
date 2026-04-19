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

describe('Alternative Path', () => {
  const userEmail = `alt${Date.now()}@example.com`;
  const userPass = 'password123';
  const deckName = 'Seeded Alt Deck';

  beforeEach(() => {
    cy.intercept('POST', '**/admin/auth/login').as('login');
    cy.intercept('GET', '**/store').as('getStore');
    cy.intercept('PUT', '**/store').as('storeSave');

    seedUserAndPresentation(userEmail, userPass, 'Alt Admin', {
      id: 'deck-alt-1',
      name: deckName,
      description: 'Seeded deck for authoring tests',
      thumbnail: '',
      slides: [
        {
          id: 'slide-1',
          background: { kind: 'solid', value: '#ffffff' },
          elements: [
            {
              id: 'text-1',
              type: 'text',
              x: 10,
              y: 10,
              width: 50,
              height: 15,
              layer: 0,
              text: 'Starter text',
              fontSize: 2,
              color: '#000000',
            },
          ],
        },
      ],
      updatedAt: Date.now(),
      fontFamily: 'Georgia, serif',
      defaultBackground: { kind: 'solid', value: '#ffffff' },
      history: [],
    });

    cy.visit('/');
  });

  it('adds elements and edits slide appearance on seeded deck', () => {
    cy.contains('button', 'Login').click();
    cy.contains('label', 'Email').parent().find('input').type(userEmail);
    cy.contains('label', 'Password').parent().find('input').type(userPass);
    cy.contains('button', 'Sign In').click();
    cy.wait('@login');
    cy.wait('@getStore');

    cy.contains('h3', deckName).click();
    cy.contains('button', '+ Add Slide').should('be.visible');

    cy.get('button[title="Add Text"]').click();
    cy.contains('label', 'Text Content').parent().find('textarea').type('Hello from Cypress!');
    cy.contains('label', 'Font Size (em)').parent().find('input').clear().type('2');
    cy.contains('button', 'Save').click();
    cy.wait('@storeSave');
    cy.contains('Hello from Cypress!').should('be.visible');

    cy.get('button[title="Add Image"]').click();
    cy.contains('label', 'Image URL or Base64').parent().find('input').type('https://via.placeholder.com/100');
    cy.contains('label', 'Alt Text').parent().find('input').type('Placeholder Image');
    cy.contains('button', 'Save').click();
    cy.wait('@storeSave');
    cy.get('img[alt="Placeholder Image"]').should('exist');

    cy.get('button[title="Slide Background & Theme"]').click();
    cy.contains('button', 'GRADIENT').first().click();
    cy.contains('button', 'Done').click();
    cy.wait('@storeSave');

    cy.contains('button', 'Slide panel').click();
    cy.contains('h2', 'Slide Panel').should('be.visible');
    cy.contains('Slide 1').should('be.visible');
    cy.get('button[aria-label="Close Modal"]').click();

    cy.contains('button', 'Version history').click();
    cy.contains('h2', 'Version History').should('be.visible');
    cy.get('button[aria-label="Close Modal"]').click();
  });
});