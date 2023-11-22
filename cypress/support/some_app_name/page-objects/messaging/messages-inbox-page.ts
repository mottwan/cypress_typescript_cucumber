import { BasePage } from '../basePage';

class MessagesInboxPage extends BasePage {
    popUpWindowIsVisible(message: string) {
        cy.contains(message).should('be.visible');
    }

    appointmentPopUpWindowIsVisible() {
        cy.contains('span', 'Appointment Details').should('be.visible');
        cy.contains(
            'span',
            'Your appointment request has been submitted.',
        ).should('be.visible');
        cy.contains(
            'span',
            'Once scheduled, you will receive a confirmation message.',
        ).should('be.visible');
        cy.contains(
            'span',
            'Appointment will be available after confirmation.',
        ).should('be.visible');
        cy.contains('button', 'OK').click({ force: true });
    }

    deleteMessage(nthMessage: number) {
        cy.get('[data-icon="trash-can"]').eq(nthMessage).click();
    }
}

export default new MessagesInboxPage();
