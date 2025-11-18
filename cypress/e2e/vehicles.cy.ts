/// <reference types="cypress" />

describe('Vehicles Feature', () => {
    let ownerEmail: string;
    let ownerPassword: string;

    before(() => {
        const timestamp = Date.now();
        ownerEmail = `vehicleowner${timestamp}@example.com`;
        ownerPassword = 'TestPassword123!';

        cy.signup(ownerEmail, ownerPassword);
    });

    beforeEach(() => {
        cy.clearAuth();
        cy.signin(ownerEmail, ownerPassword);
        cy.navigateToVehicles();
    });

    it('should create a vehicle with photos and show the detail view', () => {
        const uniqueId = Date.now();
        const make = `Cypress Make ${uniqueId}`;
        const model = `Model-${uniqueId}`;

        cy.get('[data-testid="create-vehicle-button"]').click();

        cy.get('[data-testid="vehicle-make-input"]').clear().type(make);
        cy.get('[data-testid="vehicle-model-input"]').clear().type(model);
        cy.get('[data-testid="vehicle-year-input"]').then(($input) => {
            ($input[0] as HTMLInputElement).valueAsNumber = 2024;
            cy.wrap($input).trigger('input');
        });
        cy.get('[data-testid="vehicle-color-input"]').clear().type('Midnight Blue');
        cy.get('[data-testid="vehicle-seats-input"]').then(($input) => {
            ($input[0] as HTMLInputElement).valueAsNumber = 4;
            cy.wrap($input).trigger('input');
        });
        cy.get('[data-testid="vehicle-vin-input"]').clear().type('1HGCM82633A004352');
        cy.get('[data-testid="vehicle-license-plate-input"]').clear().type(`CY-${uniqueId}`);
        cy.get('[data-testid="vehicle-transmission-select"]').select('automatic');
        cy.get('[data-testid="vehicle-fuel-type-select"]').select('petrol');
        cy.get('[data-testid="vehicle-price-per-day-input"]').then(($input) => {
            ($input[0] as HTMLInputElement).valueAsNumber = 95;
            cy.wrap($input).trigger('input');
        });
        cy.get('[data-testid="vehicle-description-input"]').clear().type('Vehicle created by Cypress test.');
        cy.get('[data-testid="vehicle-location-address-input"]').clear().type('123 Vehicle Lane, Test City');
        cy.get('[data-testid="vehicle-latitude-input"]').then(($input) => {
            ($input[0] as HTMLInputElement).valueAsNumber = 40.7128;
            cy.wrap($input).trigger('input');
        });
        cy.get('[data-testid="vehicle-longitude-input"]').then(($input) => {
            ($input[0] as HTMLInputElement).valueAsNumber = -74.0060;
            cy.wrap($input).trigger('input');
        });

        // Verify photo upload section exists and upload image
        cy.contains('Vehicle Photos').should('be.visible');
        cy.get('[data-testid="image-upload-input"]').should('exist');
        cy.get('[data-testid="image-upload-input"]').selectFile('cypress/fixtures/vehicle-default.png', { force: true });
        cy.wait(2000); // Wait for image upload to complete

        cy.get('[data-testid="vehicle-submit-button"]').scrollIntoView().should('be.visible').click();

        cy.url({ timeout: 10000 }).should('include', '/vehicles/');
        cy.get('[data-testid="vehicle-detail-page"]').should('be.visible');
        cy.contains(make).should('be.visible');
        cy.contains(model).should('be.visible');
        cy.get('[data-testid="vehicle-edit-button"]').should('be.visible');
        cy.get('[data-testid="vehicle-delete-button"]').should('be.visible');
    });

    it('should edit a vehicle successfully', () => {
        const baseMake = `Editable Make ${Date.now()}`;
        const baseModel = `Editable Model ${Date.now()}`;

        cy.createVehicle({ make: baseMake, model: baseModel, pricePerDay: 110 }).then(() => {
            const updatedMake = `${baseMake} Updated`;
            const updatedModel = `${baseModel}-2025`;

            cy.get('[data-testid="vehicle-edit-button"]').click();

            cy.get('[data-testid="vehicle-make-input"]').clear().type(updatedMake);
            cy.get('[data-testid="vehicle-model-input"]').clear().type(updatedModel);
            cy.get('[data-testid="vehicle-year-input"]').then(($input) => {
                ($input[0] as HTMLInputElement).valueAsNumber = 2025;
                cy.wrap($input).trigger('input');
            });
            cy.get('[data-testid="vehicle-color-input"]').clear().type('Bright Red');
            cy.get('[data-testid="vehicle-price-per-day-input"]').then(($input) => {
                ($input[0] as HTMLInputElement).valueAsNumber = 135;
                cy.wrap($input).trigger('input');
            });
            cy.get('[data-testid="vehicle-description-input"]').clear().type('Vehicle updated by Cypress automation.');

            cy.get('[data-testid="vehicle-submit-button"]').click();

            cy.get('[data-testid="vehicle-detail-page"]').should('be.visible');
            cy.contains(updatedMake).should('be.visible');
            cy.contains(updatedModel).should('be.visible');
            cy.contains('135.00').should('be.visible');

            cy.navigateToVehicles();
            cy.contains(updatedMake).should('be.visible');
        });
    });

    it('should delete a vehicle successfully', () => {
        const deletableMake = `Delete Make ${Date.now()}`;
        const deletableModel = `Delete Model ${Date.now()}`;

        cy.createVehicle({ make: deletableMake, model: deletableModel }).then(() => {
            cy.on('window:confirm', (text) => {
                expect(text).to.contain('delete this vehicle');
                return true;
            });

            cy.get('[data-testid="vehicle-delete-button"]').click();

            cy.url({ timeout: 10000 }).should('include', '/vehicles');
            cy.get('[data-testid="vehicles-page"]').should('be.visible');
            cy.contains(deletableMake).should('not.exist');
        });
    });

    it('should display vehicles on the home page', () => {
        const browseMake = `Browse Make ${Date.now()}`;
        const browseModel = `Browse Model ${Date.now()}`;

        cy.createVehicle({ make: browseMake, model: browseModel });

        cy.get('[data-testid="home-sidebar-button"]').click();

        cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
        cy.get('[data-testid="home-page"]').should('be.visible');
        cy.contains(browseMake, { timeout: 10000 }).should('be.visible');
    });
});
