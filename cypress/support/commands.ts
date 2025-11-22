/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to select DOM element by data-cy attribute.
             * @example cy.dataCy('greeting')
             */
            dataCy(value: string): Chainable<JQuery<HTMLElement>>;

            /**
             * Custom command to login with test credentials
             * @example cy.login('test@example.com', 'password123')
             */
            login(email: string, password: string): Chainable<void>;

            /**
             * Custom command to logout
             * @example cy.logout()
             */
            logout(): Chainable<void>;
            /**
             * Custom command to signout via UI
             * @example cy.signout()
             */
            signout(): Chainable<void>;

            /**
             * Custom command to clear all cookies and localStorage
             * @example cy.clearAuth()
             */
            clearAuth(): Chainable<void>;

            /**
             * Custom command to set authentication cookies
             * @example cy.setAuthCookies('access-token', 'refresh-token')
             */
            setAuthCookies(accessToken: string, refreshToken?: string): Chainable<void>;

            /**
             * Custom command to wait for API response
             * @example cy.waitForApi('POST', '/auth/login')
             */
            waitForApi(method: string, url: string): Chainable<void>;

            /**
             * Custom command to sign up a new user
             * @example cy.signup('test@example.com', 'password123')
             */
            signup(email: string, password: string): Chainable<void>;

            /**
             * Custom command to sign in with credentials
             * @example cy.signin('test@example.com', 'password123')
             */
            signin(email: string, password: string): Chainable<void>;

            /**
             * Custom command to navigate to vehicles page
             */
            navigateToVehicles(): Chainable<void>;
            /**
             * Custom command to create a vehicle via the UI
             */
            createVehicle(data?: Partial<{
                make: string;
                model: string;
                year: number;
                color?: string;
                seats: number;
                vin?: string;
                licensePlate?: string;
                transmission: 'automatic' | 'manual' | 'semi-automatic';
                fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
                pricePerDay: number;
                description?: string;
                address?: string;
                latitude?: number;
                longitude?: number;
                // Phase 1 fields
                features?: string[];
                instantBooking?: boolean;
                weeklyDiscountPercent?: number;
                monthlyDiscountPercent?: number;
                cleaningFee?: number;
                pickupTimeStart?: string;
                pickupTimeEnd?: string;
                returnTimeStart?: string;
                returnTimeEnd?: string;
                flexiblePickupReturn?: boolean;
                deliveryAvailable?: boolean;
                deliveryFeePerKm?: number;
                deliveryRadiusKm?: number;
                pickupLocationType?: 'owner_location' | 'airport' | 'train_station' | 'hotel' | 'custom';
            }>): Chainable<string>;
            /**
             * Custom command to navigate to bookings page
             */
            navigateToBookings(): Chainable<void>;
            /**
             * Custom command to create a booking via UI
             */
            createBooking(vehicleId: string, overrides?: Partial<{
                startDate: string;
                endDate: string;
                message?: string;
                // Phase 1 fields
                pickupTime?: string;
                returnTime?: string;
                pickupLocation?: string;
                returnLocation?: string;
                deliveryRequested?: boolean;
                deliveryAddress?: string;
                deliveryDistanceKm?: number;
            }>): Chainable<string>;
        }
    }
}

// Custom command to select by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
    return cy.get(`[data-cy=${value}]`);
});

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.session([email, password], () => {
        cy.visit('/signin');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/admin');
    });
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
        win.sessionStorage.clear();
    });
});

// Custom command to signout via UI
Cypress.Commands.add('signout', () => {
    // Click on user dropdown
    cy.get('[data-testid="user-dropdown-button"]').click();

    // Wait for dropdown to open and verify signout button is visible
    cy.get('[data-testid="signout-button"]').should('be.visible');

    // Click sign out button
    cy.get('[data-testid="signout-button"]').click();

    // Wait for signout to complete - just wait for URL to change
    cy.wait(1000);

    // Clear any stored tokens/cookies
    cy.clearCookies();
});

// Custom command to clear authentication data
Cypress.Commands.add('clearAuth', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
        win.sessionStorage.clear();
    });
});

// Custom command to set authentication cookies
Cypress.Commands.add('setAuthCookies', (accessToken: string, refreshToken?: string) => {
    cy.setCookie('access_token', accessToken);
    if (refreshToken) {
        cy.setCookie('refresh_token', refreshToken);
    }
});

// Custom command to wait for API calls
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
    cy.intercept(method, url).as('apiCall');
    cy.wait('@apiCall');
});

// Custom command to sign up a new user
Cypress.Commands.add('signup', (email: string, password: string) => {
    // Intercept the signup API call
    cy.intercept('POST', '**/auth/register').as('signupRequest');

    cy.visit('/signup');
    cy.get('h1').should('contain', 'Sign Up');

    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="confirm-password-input"]').type(password);
    cy.get('input[type="checkbox"]').check();

    cy.get('[data-testid="signup-submit-button"]').click();

    // Wait for the API call to complete
    cy.wait('@signupRequest', { timeout: 15000 }).then((interception) => {
        // Check if signup was successful (status 200 or 201)
        if (interception.response && (interception.response.statusCode === 200 || interception.response.statusCode === 201)) {
            cy.log('Signup successful');
        } else {
            cy.log('Signup may have failed, checking for errors');
            // Check for error messages on the page
            cy.get('body').then(($body) => {
                if ($body.find('[data-testid="error-message"]').length > 0) {
                    cy.get('[data-testid="error-message"]').then(($error) => {
                        throw new Error(`Signup failed: ${$error.text()}`);
                    });
                }
            });
        }
    });

    // Wait for redirect to home page (successful signup)
    cy.url({ timeout: 15000 }).should('eq', Cypress.config().baseUrl + '/');
    cy.get('[data-testid="home-page"]', { timeout: 10000 }).should('be.visible');

    // Wait for user data to be loaded (check for user dropdown which indicates user is loaded)
    cy.get('[data-testid="user-dropdown-button"]', { timeout: 10000 }).should('be.visible');
});

// Custom command to sign in with credentials
Cypress.Commands.add('signin', (email: string, password: string) => {
    cy.visit('/signin');

    // Check if we're already on the home page (already authenticated)
    cy.url().then((url) => {
        if (url === Cypress.config().baseUrl + '/') {
            cy.log('Already authenticated, skipping signin');
            cy.get('[data-testid="home-page"]').should('be.visible');
        } else {
            // Not authenticated, proceed with signin
            cy.get('h1').should('contain', 'Sign In');

            cy.get('[data-testid="email-input"]').type(email);
            cy.get('[data-testid="password-input"]').type(password);

            cy.get('[data-testid="signin-submit-button"]').click();

            // Wait for signin to complete and redirect to home
            cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
            cy.get('[data-testid="home-page"]').should('be.visible');

            // Wait for user data to be loaded (check for user dropdown which indicates user is loaded)
            cy.get('[data-testid="user-dropdown-button"]', { timeout: 10000 }).should('be.visible');
        }
    });
});

Cypress.Commands.add('navigateToVehicles', () => {
    // Directly visit the vehicles page instead of clicking sidebar
    cy.visit('/vehicles', { timeout: 10000 });

    // Wait for vehicles page to be visible
    cy.get('[data-testid="vehicles-page"]', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('createVehicle', (data = {}) => {
    const defaults = {
        make: `Test Make ${Date.now()}`,
        model: 'Model X',
        year: new Date().getFullYear(),
        color: 'Silver',
        seats: 5,
        vin: '1HGBH41JXMN109186',
        licensePlate: `ABC-${Math.floor(Math.random() * 9000 + 1000)}`,
        transmission: 'automatic' as const,
        fuelType: 'petrol' as const,
        pricePerDay: 75,
        description: 'Well maintained vehicle built for Cypress tests',
        address: '123 Main Street, Test City',
        latitude: 37.7749,
        longitude: -122.4194,
    };

    const vehicleData = { ...defaults, ...data };

    // Ensure we're on the vehicles page before clicking create
    cy.get('[data-testid="my-vehicles-sidebar-button"]').click();
    cy.url().should('include', '/vehicles');
    cy.get('[data-testid="vehicles-page"]').should('be.visible');
    cy.wait(1000); // Wait for page to fully load

    cy.get('[data-testid="create-vehicle-button"]').scrollIntoView().should('be.visible');
    cy.wait(500); // Small wait after scroll
    cy.get('[data-testid="create-vehicle-button"]').click({ force: true });

    cy.get('[data-testid="vehicle-make-input"]').clear().type(vehicleData.make);
    cy.get('[data-testid="vehicle-model-input"]').clear().type(vehicleData.model);
    cy.get('[data-testid="vehicle-year-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = vehicleData.year;
        cy.wrap($input).trigger('input');
    });
    cy.get('[data-testid="vehicle-color-input"]').clear().type(vehicleData.color || '');
    cy.get('[data-testid="vehicle-seats-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = vehicleData.seats;
        cy.wrap($input).trigger('input');
    });

    if (vehicleData.vin) {
        cy.get('[data-testid="vehicle-vin-input"]').clear().type(vehicleData.vin);
    }
    if (vehicleData.licensePlate) {
        cy.get('[data-testid="vehicle-license-plate-input"]').clear().type(vehicleData.licensePlate);
    }

    cy.get('[data-testid="vehicle-transmission-select"]').select(vehicleData.transmission);
    cy.get('[data-testid="vehicle-fuel-type-select"]').select(vehicleData.fuelType);
    cy.get('[data-testid="vehicle-price-per-day-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = vehicleData.pricePerDay;
        cy.wrap($input).trigger('input');
    });
    cy.get('[data-testid="vehicle-description-input"]').clear().type(vehicleData.description || '');

    cy.get('[data-testid="vehicle-location-address-input"]').clear().type(vehicleData.address || '');
    cy.get('[data-testid="vehicle-latitude-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = vehicleData.latitude ?? 0;
        cy.wrap($input).trigger('input');
    });
    cy.get('[data-testid="vehicle-longitude-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = vehicleData.longitude ?? 0;
        cy.wrap($input).trigger('input');
    });

    // Phase 1: Features/Amenities
    if (vehicleData.features && vehicleData.features.length > 0) {
        vehicleData.features.forEach((feature) => {
            const featureTestId = `vehicle-feature-${feature.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            cy.get(`[data-testid="${featureTestId}"]`).should('exist').check();
        });
    }

    // Phase 1: Pricing Enhancements
    if (vehicleData.weeklyDiscountPercent !== undefined) {
        cy.get('[data-testid="vehicle-weekly-discount-input"]').clear().type(vehicleData.weeklyDiscountPercent.toString());
    }
    if (vehicleData.monthlyDiscountPercent !== undefined) {
        cy.get('[data-testid="vehicle-monthly-discount-input"]').clear().type(vehicleData.monthlyDiscountPercent.toString());
    }
    if (vehicleData.cleaningFee !== undefined) {
        cy.get('[data-testid="vehicle-cleaning-fee-input"]').clear().type(vehicleData.cleaningFee.toString());
    }

    // Phase 1: Instant Booking
    if (vehicleData.instantBooking) {
        cy.get('[data-testid="vehicle-instant-booking-checkbox"]').check();
    }

    // Phase 1: Pickup/Return Times
    if (vehicleData.flexiblePickupReturn) {
        cy.get('[data-testid="vehicle-flexible-times-checkbox"]').check();
    } else {
        if (vehicleData.pickupTimeStart) {
            cy.get('[data-testid="vehicle-pickup-time-start-input"]').clear().type(vehicleData.pickupTimeStart);
        }
        if (vehicleData.pickupTimeEnd) {
            cy.get('[data-testid="vehicle-pickup-time-end-input"]').clear().type(vehicleData.pickupTimeEnd);
        }
        if (vehicleData.returnTimeStart) {
            cy.get('[data-testid="vehicle-return-time-start-input"]').clear().type(vehicleData.returnTimeStart);
        }
        if (vehicleData.returnTimeEnd) {
            cy.get('[data-testid="vehicle-return-time-end-input"]').clear().type(vehicleData.returnTimeEnd);
        }
    }

    // Phase 1: Delivery Options
    if (vehicleData.deliveryAvailable) {
        cy.get('[data-testid="vehicle-delivery-available-checkbox"]').check();
        if (vehicleData.deliveryFeePerKm !== undefined) {
            cy.get('[data-testid="vehicle-delivery-fee-per-km-input"]').clear().type(vehicleData.deliveryFeePerKm.toString());
        }
        if (vehicleData.deliveryRadiusKm !== undefined) {
            cy.get('[data-testid="vehicle-delivery-radius-input"]').clear().type(vehicleData.deliveryRadiusKm.toString());
        }
        if (vehicleData.pickupLocationType) {
            cy.get('[data-testid="vehicle-pickup-location-type-select"]').select(vehicleData.pickupLocationType);
        }
    }

    // Upload default vehicle image
    cy.get('[data-testid="image-upload-input"]').should('exist').selectFile('cypress/fixtures/vehicle-default.png', { force: true });

    // Wait for image preview to appear (upload completed)
    cy.get('[data-testid="image-preview-grid"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="image-preview-0"]', { timeout: 10000 }).should('be.visible');

    // Additional wait to ensure upload is fully processed
    cy.wait(1000);

    cy.get('[data-testid="vehicle-submit-button"]').scrollIntoView().should('be.visible').click();

    cy.url({ timeout: 10000 }).should('include', '/vehicles/');
    cy.get('[data-testid="vehicle-detail-page"]').should('be.visible');

    return cy.url().then((url) => {
        const parts = url.split('/');
        const vehicleId = parts[parts.length - 1];
        return vehicleId;
    });
});

Cypress.Commands.add('navigateToBookings', () => {
    // Click the bookings menu to expand it
    cy.get('[data-testid="bookings-sidebar-button"]').click();
    // Wait for the submenu to expand
    cy.wait(300);
    // Click on "My Bookings" submenu item
    cy.get('[data-testid="my-bookings-sidebar-button"]').should('be.visible').click();
    cy.url().should('include', '/bookings');
    cy.get('[data-testid="bookings-page-container"]').should('be.visible');
});

Cypress.Commands.add('createBooking', (vehicleId: string, overrides = {}): Cypress.Chainable<string> => {
    // Calculate dates - default to tomorrow and day after tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    // Format dates as YYYY-MM-DD for date inputs
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startDate = overrides.startDate
        ? (typeof overrides.startDate === 'string' && overrides.startDate.includes('T')
            ? new Date(overrides.startDate).toISOString().split('T')[0]
            : formatDate(new Date(overrides.startDate)))
        : formatDate(tomorrow);

    const endDate = overrides.endDate
        ? (typeof overrides.endDate === 'string' && overrides.endDate.includes('T')
            ? new Date(overrides.endDate).toISOString().split('T')[0]
            : formatDate(new Date(overrides.endDate)))
        : formatDate(dayAfter);

    const message = overrides.message || 'Booking created by Cypress test';

    // Navigate to vehicle detail page
    cy.visit(`/vehicles/${vehicleId}`);
    cy.get('[data-testid="vehicle-detail-page"]', { timeout: 10000 }).should('be.visible');

    // Wait for booking form to be visible (for non-owners)
    cy.get('[data-testid="booking-start-date-input"]', { timeout: 10000 }).scrollIntoView().should('be.visible');

    // Fill in the booking form
    cy.get('[data-testid="booking-start-date-input"]').scrollIntoView().clear().type(startDate);
    cy.get('[data-testid="booking-end-date-input"]').scrollIntoView().clear().type(endDate);

    // Phase 1: Pickup/Return Times (if provided and vehicle doesn't have flexible times)
    if (overrides.pickupTime) {
        cy.get('[data-testid="booking-pickup-time-input"]').should('exist').then(($input) => {
            if ($input.length > 0) {
                cy.wrap($input).clear().type(overrides.pickupTime!.split('T')[1]?.substring(0, 5) || overrides.pickupTime!);
            }
        });
    }
    if (overrides.returnTime) {
        cy.get('[data-testid="booking-return-time-input"]').should('exist').then(($input) => {
            if ($input.length > 0) {
                cy.wrap($input).clear().type(overrides.returnTime!.split('T')[1]?.substring(0, 5) || overrides.returnTime!);
            }
        });
    }

    // Phase 1: Delivery Options
    if (overrides.deliveryRequested) {
        cy.get('[data-testid="booking-delivery-requested-checkbox"]').should('exist').check();
        cy.wait(500); // Wait for delivery fields to appear
        if (overrides.deliveryAddress) {
            cy.get('[data-testid="booking-delivery-address-input"]').scrollIntoView({ offset: { top: -100, left: 0 } }).should('exist').clear({ force: true }).type(overrides.deliveryAddress, { force: true });
        }
        if (overrides.deliveryDistanceKm !== undefined) {
            cy.get('[data-testid="booking-delivery-distance-input"]').scrollIntoView({ offset: { top: -100, left: 0 } }).should('exist').clear({ force: true }).type(overrides.deliveryDistanceKm.toString(), { force: true });
        }
    }

    if (message) {
        cy.get('[data-testid="booking-message-input"]').scrollIntoView().clear().type(message);
    }

    // Submit the booking form
    cy.get('[data-testid="booking-submit-button"]').scrollIntoView().should('be.visible').click();

    // Wait for booking to be created and redirect (could be to /bookings or /bookings/{id})
    // Increase timeout to allow for API processing
    cy.url({ timeout: 20000 }).should('include', '/bookings');

    // Check if we're on booking detail page or bookings list
    return cy.url().then((url) => {
        // If already on booking detail page, extract ID and return
        if (url.match(/\/bookings\/[^/]+$/)) {
            cy.get('[data-testid="booking-detail-page"]', { timeout: 10000 }).should('be.visible');
            const parts = url.split('/bookings/');
            if (parts.length > 1) {
                return parts[1].split('/')[0];
            }
            return vehicleId;
        }
        // If on bookings list, navigate to detail page
        cy.get('[data-testid="bookings-page"]', { timeout: 10000 }).should('be.visible');
        cy.wait(4000); // Wait for bookings list to load and vehicle data to fetch

        // Find the first booking card (most recent booking) and click on it
        cy.get('[data-testid^="booking-card-"]', { timeout: 15000 }).first().should('be.visible');
        cy.wait(1000); // Additional wait to ensure card is fully rendered
        cy.get('[data-testid^="booking-card-"]').first().scrollIntoView().click({ force: true });

        // Wait for navigation to booking detail page
        cy.url({ timeout: 10000 }).should('include', '/bookings/');
        cy.get('[data-testid="booking-detail-page"]', { timeout: 10000 }).should('be.visible');

        // Return marker to continue chain
        return 'CONTINUE';
    }).then((result) => {
        // If we already got a booking ID, return it
        if (result !== 'CONTINUE' && result !== vehicleId) {
            return result;
        }
        // Otherwise, we need to get the URL - but we must return a string, not a Chainable
        // So we'll chain another then to extract it
        return cy.url().then((detailUrl) => {
            const parts = detailUrl.split('/bookings/');
            if (parts.length > 1) {
                return parts[1].split('/')[0];
            }
            return vehicleId;
        });
    }) as Cypress.Chainable<string>;
});

export { };
