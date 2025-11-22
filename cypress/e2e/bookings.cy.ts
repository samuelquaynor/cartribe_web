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

    it('should allow a renter to create a booking with Phase 1 fields and view pricing breakdown', () => {
        cy.signin(renterEmail, renterPassword);

        // Create booking with Phase 1 fields
        const startDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        cy.createBooking(vehicleId, {
            startDate,
            endDate,
            message: 'Test booking with Phase 1 features',
        }).then((bookingId) => {
            cy.navigateToBookings();

            // Wait for bookings to load
            cy.get('[data-testid="bookings-page"]', { timeout: 10000 }).should('be.visible');
            cy.wait(2000); // Wait for vehicle data to load

            // Find the booking card by vehicle make (since we know the make from setup)
            cy.contains(vehicleMake, { timeout: 10000 }).should('be.visible');
            cy.contains(vehicleMake).click();

            cy.url({ timeout: 10000 }).should('include', `/bookings/${bookingId}`);
            cy.get('[data-testid="booking-detail-page"]').should('be.visible');
            cy.contains('Pending').should('be.visible');

            // Phase 1: Verify pricing breakdown is displayed
            cy.contains('Price Breakdown', { timeout: 10000 }).should('be.visible');
            cy.contains('Subtotal', { timeout: 10000 }).should('be.visible');
            cy.contains('Service fee', { timeout: 10000 }).should('be.visible');

            cy.signout();
        });
    });

    it('should allow the owner to accept a pending booking request with Phase 1 pricing breakdown', () => {
        // Create a booking as renter first with different dates to avoid conflicts
        const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 days from now
        const endDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 9 days from now

        cy.signin(renterEmail, renterPassword);
        cy.createBooking(vehicleId, {
            startDate,
            endDate,
            message: 'Booking request with Phase 1 features',
        }).then((bookingId) => {
            cy.signout();

            // Owner reviews the pending request
            cy.signin(ownerEmail, ownerPassword);
            // Navigate to pending requests
            cy.visit('/bookings/requests', { timeout: 10000 });
            cy.url({ timeout: 10000 }).should('include', '/bookings/requests');
            cy.get('[data-testid="pending-requests-page"]').should('be.visible');
            cy.wait(2000); // Wait for vehicle data to load
            
            // Find the booking card by vehicle make
            cy.contains(vehicleMake, { timeout: 10000 }).should('be.visible');
            cy.contains(vehicleMake).click();

            cy.url({ timeout: 10000 }).should('include', `/bookings/${bookingId}`);
            cy.get('[data-testid="booking-detail-page"]').should('be.visible');

            // Phase 1: Verify pricing breakdown is visible
            cy.contains('Price Breakdown', { timeout: 10000 }).should('be.visible');
            cy.contains('Subtotal', { timeout: 10000 }).should('be.visible');

            cy.get('[data-testid="booking-action-accepted"]').click();
            cy.contains('Accepted', { timeout: 10000 }).should('be.visible');

            // Phase 1: Verify pricing breakdown still visible after acceptance
            cy.contains('Price Breakdown', { timeout: 10000 }).should('be.visible');
            cy.contains('Total', { timeout: 10000 }).should('be.visible');

            cy.signout();
        });
    });

    it('should create a booking with delivery request and show delivery fee in pricing', () => {
        // First, create a vehicle with delivery enabled
        cy.signin(ownerEmail, ownerPassword);
        cy.navigateToVehicles();
        const deliveryVehicleMake = `Delivery Vehicle ${Date.now()}`;
        cy.createVehicle({
            make: deliveryVehicleMake,
            model: 'Delivery Model',
            pricePerDay: 100,
            deliveryAvailable: true,
            deliveryFeePerKm: 2.50,
            deliveryRadiusKm: 50,
        }).then((deliveryVehicleId) => {
            cy.signout();

            // Create booking with delivery request
            cy.signin(renterEmail, renterPassword);
            const startDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const endDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            cy.createBooking(deliveryVehicleId, {
                startDate,
                endDate,
                deliveryRequested: true,
                deliveryAddress: '123 Delivery Street, Test City',
                deliveryDistanceKm: 15,
            }).then((bookingId) => {
                cy.navigateToBookings();
                cy.get('[data-testid="bookings-page"]', { timeout: 10000 }).should('be.visible');
                cy.wait(2000);

                cy.contains(deliveryVehicleMake, { timeout: 10000 }).should('be.visible');
                cy.contains(deliveryVehicleMake).click();

                cy.url({ timeout: 10000 }).should('include', `/bookings/${bookingId}`);
                cy.get('[data-testid="booking-detail-page"]').should('be.visible');

                // Phase 1: Verify delivery fee is shown in pricing breakdown
                cy.contains('Delivery fee', { timeout: 10000 }).should('be.visible');
                cy.contains('Price Breakdown', { timeout: 10000 }).should('be.visible');

                cy.signout();
            });
        });
    });
});
