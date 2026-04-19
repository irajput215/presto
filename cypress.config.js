export default {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'presto/frontend/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // Root launch path for Cypress GUI. Frontend specs live under presto/frontend.
    },
  },
};
