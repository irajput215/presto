describe('Admin Happy Path', () => {
  const userEmail = `happy${Date.now()}@example.com`;
  const userPass = 'password123';

  beforeEach(() => {
    cy.visit('/');
  });

  it('Completes the happy path successfully', () => {
    // 1. Registers successfully
    cy.contains('button', 'Create an account').click();
    cy.contains('label', 'Name').parent().find('input').type('Happy Admin');
    cy.contains('label', 'Email').parent().find('input').type(userEmail);
    cy.contains('label', 'Password').parent().find('input').type(userPass);
    cy.contains('label', 'Confirm Password').parent().find('input').type(userPass);
    cy.contains('button', 'Sign Up').click();

    // Verify dashboard
    cy.contains('Your Presentations').should('be.visible');

    // 2. Creates a new presentation successfully
    cy.contains('button', '+ New Presentation').click();
    cy.contains('label', 'Presentation Name').parent().find('input').type('My Happy Path Presentation');
    cy.contains('button', 'Create').click();
    cy.wait(500);

    // Verify presentation card and click to enter edit mode
    cy.contains('h3', 'My Happy Path Presentation').click();

    // Verify we are inside the edit view
    cy.contains('button', '+ Add Slide').should('be.visible');

    // 3. Updates the thumbnail and name of the presentation successfully
    cy.get('button[title="Edit Title"]').click();
    cy.contains('Edit Presentation Details').should('be.visible');
    
    // Edit Name
    cy.contains('label', 'Title').parent().find('input').clear().type('Updated Happy Path Presentation');
    
    // Select Image URL for thumbnail mode
    cy.contains('button', 'Image URL').click();
    cy.contains('label', 'Thumbnail URL').parent().find('input').type('https://images.unsplash.com/photo-1506744626753-1fa44df31c7e?w=150');
    cy.contains('button', 'Save').click();
    cy.wait(500);

    // Verify updated title on top bar
    cy.contains('h1', 'Updated Happy Path Presentation').should('be.visible');

    // 4. Add some slides in a slideshow deck successfully
    cy.contains('button', '+ Add Slide').click();
    cy.wait(500);
    cy.contains('button', '+ Add Slide').click();
    cy.wait(500);
    
    // We now have 3 slides total (1 default + 2 added)
    
    // 5. Switch between slides successfully
    // There should be Quick Nav floating buttons if there's > 1 slide
    cy.get('button[title="Previous Slide"]').click();
    cy.wait(500);
    cy.get('button[title="Next Slide"]').click();
    cy.wait(500);

    // 6. Delete a presentation successfully
    cy.contains('button', 'Delete Presentation').click();
    cy.contains('button', 'Yes').click();
    cy.wait(500);

    // Should be back at dashboard
    cy.contains('Your Presentations').should('be.visible');
    cy.contains('h3', 'Updated Happy Path Presentation').should('not.exist');

    // 7. Logs out of the application successfully
    cy.contains('button', 'Logout').click();

    // Should be at landing page
    cy.contains('The lean, lightweight presentation app.').should('be.visible');

    // 8. Logs back into the application successfully
    cy.contains('button', 'Login').click();
    cy.contains('label', 'Email').parent().find('input').type(userEmail);
    cy.contains('label', 'Password').parent().find('input').type(userPass);
    cy.contains('button', 'Sign In').click();
    
    cy.contains('Your Presentations').should('be.visible');
  });
});
