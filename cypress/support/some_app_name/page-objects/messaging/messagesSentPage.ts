import { BasePage } from '../basePage';
import { messageID } from '../../../utils/sql-utils';

class MessagesSentPage extends BasePage {
    getSentMessage() {
        return cy
            .url()
            .should('include', 'sent')
            .get('[data-testid="messages-side-sent"]')
            .click()
            .wait(1000)
            .get('[data-testid="subject"]')
            .first()
            .click()
            .wait(1000)
            .get('[data-testid="message-text"]')
            .should('contain', 'That one message');
    }
    getSentMessageDB(pageName, datatable) {
        cy.url().should('include', 'sent');
        cy.get('[data-testid="messages-side-sent"]').click();
        cy.wait(1000);
        const data = datatable.hashes();
        for (const { messageType } of data) {
            cy.intercept(`**/api/patient-messaging/message*`, 'GET').as('id');
            cy.get('[data-testid="subject"]').first().click();
            cy.wait('@id').then(({ request }) => {
                const id = request.url.match(/\d+/g)[0];
                cy.task('queryDb', messageID(id)).then((subject: any) => {
                    const sub = subject[0].wrsmessages_subject;
                    cy.wrap(sub).should('equal', messageType);
                });
            });
        }
    }
}

export default new MessagesSentPage();
