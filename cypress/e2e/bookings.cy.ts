/// <reference types="cypress" />

describe('Bookings Feature', () => {
    let ownerEmail: string;
    let ownerPassword: string;
    let renterEmail: string;
    let renterPassword: string;
    let vehicleId: string;
    let vehicleMake: string;

    before(() => {
        const timestamp = Date.now();
        ownerEmail = `owner${timestamp}@example.com`;
        renterEmail = `renter${timestamp}@example.com`;
        ownerPassword = 'TestPassword123!';
        renterPassword = 'TestPassword123!';

        // Create owner account
        cy.signup(ownerEmail, ownerPassword);
        cy.signout();

        // Create renter account
        cy.signup(renterEmail, renterPassword);
        cy.signout();

        // Sign in as owner and list a vehicle for bookings
        cy.signin(ownerEmail, ownerPassword);
        cy.navigateToVehicles();
        vehicleMake = `Owner Vehicle ${Date.now()}`;
        cy.createVehicle({ make: vehicleMake, model: `Booking Model ${Date.now()}`, pricePerDay: 120 }).then((id) => {
            vehicleId = id;
            cy.signout();
        });
    });

    beforeEach(() => {
        cy.clearAuth();
    });

    it('should allow a renter to create a booking and view it in My Bookings', () => {
        cy.signin(renterEmail, renterPassword);

        cy.createBooking(vehicleId).then((bookingId) => {
            cy.navigateToBookings();

            cy.contains(vehicleId, { timeout: 10000 }).should('be.visible');
            cy.contains(vehicleId).click();

            cy.url({ timeout: 10000 }).should('include', `/bookings/${bookingId}`);
            cy.get('[data-testid="booking-detail-page"]').should('be.visible');
            cy.contains('Pending').should('be.visible');

            cy.signout();
        });
    });

    it('should allow the owner to accept a pending booking request', () => {
        // Create a booking as renter first with different dates to avoid conflicts
        const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
        const endDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(); // 9 days from now

        cy.signin(renterEmail, renterPassword);
        cy.createBooking(vehicleId, { startDate, endDate }).then((bookingId) => {
            cy.signout();

            // Owner reviews the pending request
            cy.signin(ownerEmail, ownerPassword);
            cy.get('[data-testid="bookings-sidebar-button"]').click();
            cy.get('[data-testid="pending-requests-sidebar-button"]').click();

            cy.url({ timeout: 10000 }).should('include', '/bookings/requests');
            cy.get('[data-testid="pending-requests-page"]').should('be.visible');
            cy.contains(vehicleId, { timeout: 10000 }).should('be.visible');
            cy.contains(vehicleId).click();

            cy.url({ timeout: 10000 }).should('include', `/bookings/${bookingId}`);
            cy.get('[data-testid="booking-detail-page"]').should('be.visible');

            cy.get('[data-testid="booking-action-accepted"]').click();
            cy.contains('Accepted', { timeout: 10000 }).should('be.visible');

            cy.signout();
        });
    });
});
