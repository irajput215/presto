describe('Happy Path', () => {
  const userEmail = `happy${Date.now()}@example.com`;
  const userPass = 'password123';
  const userName = 'Happy Admin';
  const deckName = 'My New Presentation';
  const updatedDeckName = 'Updated Presentation Name';
  const updatedThumbnail = 'https://example.com/thumbnail.png';

  it('completes the admin happy path successfully', () => {
    cy.visit('/');
    
    // 1. Registers successfully
    cy.contains('button', 'Create an account').click();
    cy.url().should('include', '/register');
    cy.contains('h2', 'Create Account').should('be.visible');
    cy.contains('label', 'Name').parent().find('input').type(userName);
    cy.contains('label', 'Email').parent().find('input').type(userEmail);
    cy.contains('label', 'Password').parent().find('input').type(userPass);
    cy.contains('label', 'Confirm Password').parent().find('input').type(userPass);
    cy.contains('button', 'Sign Up').click();

    // 2. Creates a new presentation successfully
    cy.url().should('include', '/dashboard');
    cy.contains('h2', 'Presentations').should('be.visible');
    cy.contains('button', 'New presentation').click();
    cy.contains('h2', 'Create new presentation').should('be.visible');
    cy.contains('label', 'Name').parent().find('input').type(deckName);
    cy.contains('button', /^Create$/).click();
    
    // Navigate to edit page
    cy.contains('h3', deckName).should('be.visible').click();
    cy.url().should('include', '/presentation/');

    // 3. Updates the thumbnail and name of the presentation successfully
    cy.get('button[title="Edit Title"]').click();
    cy.contains('h2', 'Edit Presentation Details').should('be.visible');
    cy.contains('label', 'Title').parent().find('input').clear().type(updatedDeckName);
    cy.contains('button', 'Image URL').click();
    cy.contains('label', 'Thumbnail URL').parent().find('input').clear().type(updatedThumbnail);
    cy.contains('button', /^Save$/).click();
    cy.contains('h1', updatedDeckName).should('be.visible');

    // 4. Add some slides in a slideshow deck successfully
    cy.contains('button', '+ Add Slide').click();
    cy.contains('button', '+ Add Slide').click();

    // 5. Switch between slides successfully
    // Move backward twice then forward once
    cy.get('button[title="Previous Slide"]').click();
    cy.get('button[title="Previous Slide"]').click();
    cy.get('button[title="Next Slide"]').click();

    // 6. Delete a presentation successfully
    cy.contains('button', 'Delete Presentation').click();
    cy.contains('h2', 'Are you sure?').should('be.visible');
    cy.contains('button', /^Yes$/).click();

    // Verify we're back on dashboard and deck is gone
    cy.url().should('include', '/dashboard');
    cy.contains('h3', updatedDeckName).should('not.exist');

    // 7. Logs out of the application successfully
    cy.contains('button', 'Logout').click();
    cy.wait(1000);
    cy.url().should('include', '/login');

    // 8. Logs back into the application successfully
    // (Already on login page due to protected route redirect)
    cy.contains('label', 'Email').parent().find('input').type(userEmail);
    cy.contains('label', 'Password').parent().find('input').type(userPass);
    cy.contains('button', 'Sign In').click();
    cy.url().should('include', '/dashboard');
  });
});
