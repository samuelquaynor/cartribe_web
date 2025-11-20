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
             * Custom command to verify farms are present
             * @example cy.verifyFarmsPresent(['Farm 1', 'Farm 2'])
             */
            verifyFarmsPresent(farmNames: string[]): Chainable<void>;

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
             * Custom command to create a farm with all details
             * @example cy.createFarm('My Farm', 'A test farm', 'crop', '123 Main St', 40.7128, -74.0060, 10, 4)
             */
            createFarm(name: string, description: string, type: string, address?: string, lat?: number, lng?: number, acres?: number, hectares?: number): Chainable<string>;

            /**
             * Custom command to navigate to farms page
             * @example cy.navigateToFarms()
             */
            navigateToFarms(): Chainable<void>;


            /**
             * Custom command to get farm ID from current URL
             * @example cy.getFarmIdFromUrl()
             */
            getFarmIdFromUrl(): Chainable<string>;
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
            }>): Chainable<string>;
            /**
             * Custom command to navigate to bookings page
             */
            navigateToBookings(): Chainable<void>;
            /**
             * Custom command to create a booking via API request
             */
            createBooking(vehicleId: string, overrides?: Partial<{ startDate: string; endDate: string; message?: string }>): Chainable<string>;
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

// Custom command to verify farms are present
Cypress.Commands.add('verifyFarmsPresent', (farmNames: string[]) => {
    // Should be on farms page
    cy.url().should('include', '/farms');
    cy.contains('Farms').should('be.visible');

    // Verify each farm name is present
    farmNames.forEach(farmName => {
        cy.contains(farmName).should('be.visible');
    });
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

// Custom command to create a farm with all details
Cypress.Commands.add('createFarm', (name: string, description: string, type: string, address?: string, lat?: number, lng?: number, acres?: number, hectares?: number) => {
    cy.get('[data-testid="create-farm-button"]').click();
    cy.get('[data-testid="farm-name-input"]').type(name);
    cy.get('[data-testid="farm-description-input"]').type(description);
    cy.get('[data-testid="farm-type-select"]').select(type);

    // Fill in location fields with provided values or defaults
    const farmAddress = address || '123 Farm Road, Farm City, Farm State, Farm Country';
    const farmLat = lat || 34.0522;
    const farmLng = lng || -118.2437;
    const farmAcres = acres || 100;
    const farmHectares = hectares || 40.47;

    cy.get('[data-testid="farm-location-address-input"]').type(farmAddress);
    cy.get('[data-testid="farm-latitude-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = farmLat;
        cy.wrap($input).trigger('input');
    });
    cy.get('[data-testid="farm-longitude-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = farmLng;
        cy.wrap($input).trigger('input');
    });
    cy.get('[data-testid="farm-size-acres-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = farmAcres;
        cy.wrap($input).trigger('input');
    });
    cy.get('[data-testid="farm-size-hectares-input"]').then(($input) => {
        ($input[0] as HTMLInputElement).valueAsNumber = farmHectares;
        cy.wrap($input).trigger('input');
    });

    // Wait a moment for form state to update
    cy.wait(500);

    cy.get('[data-testid="farm-submit-button"]').click();

    // Wait for farm to be created and redirected to farm detail page
    cy.url({ timeout: 10000 }).should('include', '/farms/');
    cy.url().should('not.include', '/farms/create');
    cy.get('[data-testid="farm-detail-page"]').should('be.visible');

    // Return the farm ID from URL
    return cy.url().then((url) => {
        const urlParts = url.split('/');
        const farmId = urlParts[urlParts.length - 1];
        return farmId;
    });
});


// Custom command to navigate to farms page
Cypress.Commands.add('navigateToFarms', () => {
    cy.get('[data-testid="farms-sidebar-button"]').click();
    cy.url().should('include', '/farms');
    cy.get('[data-testid="farms-page"]').should('be.visible');
});


// Custom command to get farm ID from current URL
Cypress.Commands.add('getFarmIdFromUrl', () => {
    return cy.url().then((url) => {
        const urlParts = url.split('/');
        const farmId = urlParts[urlParts.length - 1];
        return farmId;
    });
});

Cypress.Commands.add('navigateToVehicles', () => {
    cy.get('[data-testid="my-vehicles-sidebar-button"]').click();
    cy.url().should('include', '/vehicles');
    cy.get('[data-testid="vehicles-page"]').should('be.visible');
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

Cypress.Commands.add('createBooking', (vehicleId: string, overrides = {}) => {
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

    if (message) {
        cy.get('[data-testid="booking-message-input"]').scrollIntoView().clear().type(message);
    }

    // Submit the booking form
    cy.get('[data-testid="booking-submit-button"]').scrollIntoView().should('be.visible').click();

    // Wait for booking to be created and redirect to bookings page
    cy.url({ timeout: 10000 }).should('include', '/bookings');
    cy.get('[data-testid="bookings-page"]', { timeout: 10000 }).should('be.visible');

    // Wait for the bookings list to load and vehicle data to fetch
    cy.wait(4000);

    // Find the first booking card (most recent booking) and click on it
    // The new UI shows cards instead of a table, so we click the first booking card
    cy.get('[data-testid^="booking-card-"]', { timeout: 15000 }).first().should('be.visible');
    cy.wait(1000); // Additional wait to ensure card is fully rendered
    cy.get('[data-testid^="booking-card-"]').first().scrollIntoView().click({ force: true });

    // Wait for navigation to booking detail page
    cy.url({ timeout: 10000 }).should('include', '/bookings/');
    cy.get('[data-testid="booking-detail-page"]', { timeout: 10000 }).should('be.visible');

    // Extract booking ID from the URL
    return cy.url().then((url) => {
        const parts = url.split('/bookings/');
        if (parts.length > 1) {
            const bookingId = parts[1].split('/')[0];
            return bookingId;
        }
        // Fallback - return vehicleId if we can't extract booking ID
        return vehicleId;
    });
});

export { };
