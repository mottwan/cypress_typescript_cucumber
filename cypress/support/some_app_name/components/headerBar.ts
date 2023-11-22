export class HeaderBar {
    private headerSelector: string = '.header__top';
    private logoutSelector: string = 'a[id="logout"]';
    private messagesSelector: string = 'a[title="Open Messaging"]';
    private avatarInitialsSelector: string = 'span[class="avatar--initials"]';

    clickOnLogoutIcon() {
        cy.get(this.logoutSelector).first().click();
        cy.clearCookies().clearLocalStorage();
        return this;
    }

    clickOnMessages() {
        cy.get(this.messagesSelector).click();
        // return new MessagingModal()
        return this;
    }

    getGreetingMessage() {
        return cy.get(this.messagesSelector).next().invoke('text');
    }
}
