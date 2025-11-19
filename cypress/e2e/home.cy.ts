/// <reference types="cypress" />

describe('Home Page', () => {
    let userEmail: string;
    let userPassword: string;

    before(() => {
        const timestamp = Date.now();
        userEmail = `homeuser${timestamp}@example.com`;
        userPassword = 'TestPassword123!';

        cy.signup(userEmail, userPassword);
    });

    beforeEach(() => {
        cy.clearAuth();
        cy.signin(userEmail, userPassword);
    });

    it('should display the home page with collapsible search filters', () => {
        cy.get('[data-testid="home-sidebar-button"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.get('[data-testid="home-page"]').should('be.visible');

        // Check hero section
        cy.contains('Find your drive').should('be.visible');
        cy.contains('Explore the world\'s largest car sharing marketplace').should('be.visible');

        // Check that filters are hidden by default
        cy.get('[data-testid="home-make-input"]').should('not.exist');
        
        // Click to show filters
        cy.get('[data-testid="toggle-filters-button"]').click();

        // Check filter inputs are now visible
        cy.get('[data-testid="home-make-input"]').should('be.visible');
        cy.get('[data-testid="home-model-input"]').should('be.visible');
        cy.get('[data-testid="home-min-price-input"]').should('be.visible');
        cy.get('[data-testid="home-max-price-input"]').should('be.visible');
        cy.get('[data-testid="home-transmission-select"]').should('be.visible');
        cy.get('[data-testid="home-fuel-type-select"]').should('be.visible');
        cy.get('[data-testid="home-search-button"]').should('be.visible');
        cy.get('[data-testid="home-reset-button"]').should('be.visible');
        
        // Click to hide filters
        cy.get('[data-testid="toggle-filters-button"]').click();
        cy.get('[data-testid="home-make-input"]').should('not.exist');
    });

    it('should display vehicles section', () => {
        cy.get('[data-testid="home-sidebar-button"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');

        cy.contains('Available vehicles').should('be.visible');
        cy.contains('Found').should('be.visible');
    });

    it('should filter vehicles by make', () => {
        cy.get('[data-testid="home-sidebar-button"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');

        // Open filters first
        cy.get('[data-testid="toggle-filters-button"]').click();

        cy.get('[data-testid="home-make-input"]').type('Tesla');
        cy.get('[data-testid="home-search-button"]').click();

        cy.wait(1000);
        // Check that search was performed
        cy.get('[data-testid="home-page"]').should('be.visible');
    });

    it('should display vehicle cards when vehicles are available', () => {
        // Create a vehicle first
        cy.navigateToVehicles();
        cy.createVehicle({ make: 'Featured Car', model: 'Test Model', pricePerDay: 100 });

        // Go back to home
        cy.get('[data-testid="home-sidebar-button"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');

        // Check if vehicle card is displayed
        cy.contains('Featured Car').should('be.visible');
        cy.contains('Test Model').should('be.visible');
    });

    it('should navigate to vehicle detail when clicking a vehicle card', () => {
        // Create a vehicle first
        cy.navigateToVehicles();
        const vehicleMake = `Clickable Car ${Date.now()}`;
        cy.createVehicle({ make: vehicleMake, model: 'Detail Test', pricePerDay: 120 });

        // Go back to home
        cy.get('[data-testid="home-sidebar-button"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');

        // Click on the vehicle card
        cy.contains(vehicleMake).click();
        cy.url().should('include', '/vehicles/');
        cy.get('[data-testid="vehicle-detail-page"]').should('be.visible');
    });
});

