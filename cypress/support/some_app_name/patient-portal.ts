import { LoginPage } from './page-objects/loginPage';
const { practiceId, baseUrl } = Cypress.env('some_app_name');

export class PatientPortal {
    open() {
        return cy.visit(`${baseUrl}/login?id=${practiceId}`);
    }

    chooseAuthMethod(authMethod: string) {
        cy.contains('a', authMethod).click();
        return new LoginPage();
    }

    isOnPage(pageName: string) {
        return cy.url().should('contain', pageName);
    }

    setPause() {
        cy.pause();
    }

    openPage(pageName: string) {
        cy.visit(`${baseUrl}/${pageName}`);
        cy.wait(500);
    }
    checkForAvailableTimeSlots() {
        // the pagination set by default 10 cards per page
        cy.getByTestId('card').should('be.visible').and('have.length', 10);
    }

    selectAvailableTimeSlot(nthSlot: number) {
        cy.getByTestId('card')
            .eq(nthSlot)
            .within(($el) => {
                cy.wrap($el).getByTestId('select').click();
            });
    }

    appointmentDetailsModal() {
        cy.getByTestId('appointment-confirm').should('be.visible');
    }
    submitApointmentModal(confirm: string) {
        cy.getByTestId('appointment-confirm').within(($el) => {
            cy.wrap($el).getByTestId(confirm).click();
        });
    }
    appointmentConfirmationDetails(
        provider: string,
        date: string,
        time: string,
    ) {
        cy.getByTestId('appointment-details').within(($el): void => {
            cy.wrap($el).should(
                'contain.text',
                `Your appointment with ${provider} is scheduled on ${date} at ${time}.`,
            );
        });
    }
}

export default new PatientPortal();
