# UI Testing Rationale


# How to Run

Make sure your backend server and your frontend Vite server are both currently running.
In a new terminal inside the presto/frontend directory, simply run:
npm run test
A Cypress window will pop up. Select "E2E Testing" and click on either happy_path.cy.js or alternative_path.cy.js to watch the robotic test user zip through your application!

## Alternative Path

For the second test path (`alternative_path.cy.js`), the goal was to verify the actual feature capabilities inside the presentation editor, expanding upon the administrative flow covered in the happy path. 

While the happy path covered higher-level presentation lifecycle actions (Registering, Creating, Updating metadata, Deleting, and Logging out), the alternative path focuses on the **presentation authoring** experience.

### Features Covered:
1. **Adding Elements (Text & Image):** The test opens the tools panel and adds a new text element (modifying its content and font size) and an image element (providing an image URL and alt text). This validates the core canvas rendering capabilities.
2. **Slide Background Customization:** The test opens the "Slide Background & Theme" modal and alters the background type of the active slide to a gradient. This ensures the background CSS injection logic works as intended via the UI.
3. **Slide Panel Interaction:** The test verifies that the sidebar "Slide Panel" (which shows draggable thumbnail representations of the presentation deck) successfully renders with the correct slide count.
4. **Version History Modal:** Finally, the test ensures that the snapshot version history interface opens correctly, allowing users to potentially revert back to previous states. 

These functionalities are entirely distinct from the metadata updates and slide duplications tested in the happy path and ensure a much broader test coverage of the frontend's complex state management.
