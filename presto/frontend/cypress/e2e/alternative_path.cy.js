describe('Admin Alternative Path', () => {
  const userEmail = `alt${Date.now()}@example.com`;
  const userPass = 'password123';

  beforeEach(() => {
    cy.visit('/');
  });

  it('Uses different presentation features (Elements, Backgrounds, Panels, History)', () => {
    // 1. Registers successfully
    cy.contains('button', 'Create an account').click();
    cy.contains('label', 'Name').parent().find('input').type('Alt Admin');
    cy.contains('label', 'Email').parent().find('input').type(userEmail);
    cy.contains('label', 'Password').parent().find('input').type(userPass);
    cy.contains('label', 'Confirm Password').parent().find('input').type(userPass);
    cy.contains('button', 'Sign Up').click();

    // 2. Creates a presentation
    cy.contains('Your Presentations').should('be.visible');
    cy.contains('button', '+ New Presentation').click();
    cy.contains('label', 'Presentation Name').parent().find('input').type('Alternative Path Pres');
    cy.contains('button', 'Create').click();
    cy.wait(500);

    // 3. Open presentation editor
    cy.contains('h3', 'Alternative Path Pres').click();
    cy.contains('button', '+ Add Slide').should('be.visible');

    // 4. Add a Text Element
    cy.get('button[title="Add Text"]').click();
    cy.contains('label', 'Text Content').parent().find('textarea').clear().type('Hello from Cypress!');
    // Change font size
    cy.contains('label', 'Font Size (em)').parent().find('input').clear().type('2');
    cy.contains('button', 'Save').click();
    cy.wait(500);
    // Verify text exists on the slide canvas
    cy.contains('Hello from Cypress!').should('be.visible');

    // 5. Add an Image Element
    cy.get('button[title="Add Image"]').click();
    cy.contains('label', 'Image URL').parent().find('input').type('https://via.placeholder.com/100');
    cy.contains('label', 'Alt Text').parent().find('input').type('Placeholder Image');
    cy.contains('button', 'Save').click();
    cy.wait(500);

    // 6. Change Slide Background to Gradient
    cy.get('button[title="Slide Background & Theme"]').click();
    cy.contains('button', 'GRADIENT').first().click(); // First one is 'This Slide'
    // Click Done
    cy.contains('button', 'Done').click();
    cy.wait(500);

    // 7. View Slide Panel
    cy.contains('button', 'Slide panel').click();
    cy.contains('h2', 'Slide Panel').should('be.visible');
    // Ensure we can see slide 1
    cy.contains('Slide 1').should('be.visible');
    cy.get('button[aria-label="Close Modal"]').click();
    cy.wait(500);

    // 8. View Version History
    cy.contains('button', 'Version history').click();
    cy.contains('h2', 'Version History').should('be.visible');
    // Just verifying the modal opens as history might take a minute to snapshot
    cy.get('button[aria-label="Close Modal"]').click();
  });
});
