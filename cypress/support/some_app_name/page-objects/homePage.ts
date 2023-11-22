import { BasePage } from './basePage';

export class HomePage extends BasePage {
    private guideTourModalSelector = '.modal-dialog .jsStep-1';
    private guideTourHeaderSelector = '.modal-header';
    private guideTourTitleSelector = '.modal-title';
    private closeGuideTourModalSelector = 'button[class=close]';
    private guideTourBodySelector = '.modal-body';
    private guideTourFooterSelector = '.modal-footer';
    private skipTourButtonSelector: string =
        this.namedButtonSelector('Skip tour');
    private nextTourStepButtonSelector: string =
        this.namedButtonSelector('Next');
    private okButtonSelector: string = this.namedButtonSelector('OK');
    private medicalInformationSelectorId = 'medical_heading';
    private billingAndPaymentsSelectorId = 'billing_heading';
    private personalInformationSelectorId = 'profile_heading';
    private appointmentsSelectorId = 'appointments_heading';
    private additionalInformationSelectorId = 'additional_content_heading';
    private peekSelector = '.card-header .sections-peek';
    private navigationTitleSelector = '.card-header .section-title';
    private navigationItemSelector = '.nav-link__name';
    private navigationItemsSelector =
        '#mainMenuAccordion .nav-container .collapsible-container';
    private navigationMenuTitleSelector = '[data-toggle="collapse"]';
    private findCollapsibleById = (collapsibleId: string) =>
        cy.get(`#${collapsibleId}`).find("[data-toggle='collapse']");

    closeGuideTourModal() {
        cy.get(this.closeGuideTourModalSelector).click();
        return this;
    }

    skipGuideTour() {
        cy.wait(2000, { log: false });
        this.clickNamedButton(' Skip tour ');
        return this;
    }

    clickNextTourStep() {
        cy.get(this.nextTourStepButtonSelector).click();
        return this;
    }

    finishGuideTour() {
        cy.get(this.nextTourStepButtonSelector).click();
        return this;
    }

    clickOnNavigationItem(itemName: any) {
        return cy.get(this.navigationItemSelector).contains(itemName).click();
    }

    getNavigationItemsList() {
        return cy.get(this.navigationItemsSelector);
    }

    isCollapsibleExpanded(menuName: string) {
        return cy
            .contains(this.navigationMenuTitleSelector, menuName)
            .invoke('attr', 'aria-expanded')
            .then((isExpanded: string | undefined) => !!isExpanded);
    }

    expandNavigationMenu(menuName: string) {
        this.isCollapsibleExpanded(menuName) &&
            cy.contains(this.navigationMenuTitleSelector, menuName).click();
        return this;
    }

    expandMedicalInformation() {
        this.isCollapsibleExpanded(this.medicalInformationSelectorId) &&
            this.findCollapsibleById(this.medicalInformationSelectorId).click();
        return this;
    }

    collapseMedicalInformation() {
        !this.isCollapsibleExpanded(this.medicalInformationSelectorId) &&
            this.findCollapsibleById(this.medicalInformationSelectorId).click();
        return this;
    }

    expandBillingAndPayments() {
        this.isCollapsibleExpanded(this.billingAndPaymentsSelectorId) &&
            this.findCollapsibleById(this.billingAndPaymentsSelectorId).click();
        return this;
    }

    collapseBillingAndPayments() {
        !this.isCollapsibleExpanded(this.billingAndPaymentsSelectorId) &&
            this.findCollapsibleById(this.billingAndPaymentsSelectorId).click();
        return this;
    }

    expandPersonalInformation() {
        this.isCollapsibleExpanded(this.personalInformationSelectorId) &&
            this.findCollapsibleById(
                this.personalInformationSelectorId,
            ).click();
        return this;
    }

    collapsePersonalInformation() {
        !this.isCollapsibleExpanded(this.personalInformationSelectorId) &&
            this.findCollapsibleById(
                this.personalInformationSelectorId,
            ).click();
        return this;
    }

    expandAdditionalInformation() {
        this.isCollapsibleExpanded(this.additionalInformationSelectorId) &&
            this.findCollapsibleById(
                this.additionalInformationSelectorId,
            ).click();
        return this;
    }

    collapseAdditionalInformation() {
        !this.isCollapsibleExpanded(this.additionalInformationSelectorId) &&
            this.findCollapsibleById(
                this.additionalInformationSelectorId,
            ).click();
        return this;
    }

    expandAppointments() {
        this.isCollapsibleExpanded(this.appointmentsSelectorId) &&
            this.findCollapsibleById(this.appointmentsSelectorId).click();
        return this;
    }

    collapseAppointments() {
        !this.isCollapsibleExpanded(this.additionalInformationSelectorId) &&
            this.findCollapsibleById(
                this.additionalInformationSelectorId,
            ).click();
        return this;
    }

    getNavigationItemTitleByIndex(index: number) {
        return this.getNavigationItemsList()
            .eq(index)
            .find(this.navigationTitleSelector)
            .invoke('text')
            .then((titleText: string) => titleText.trim());
    }

    getNavigationItemIdByIndex(index: number) {
        return this.getNavigationItemsList()
            .eq(index)
            .find(this.navigationTitleSelector)
            .invoke('attr', 'id');
    }

    getNavigationPeekItemsByName(itemName: string) {
        let peekList: any;
        this.getNavigationItemsList()
            .contains(itemName)
            .find(this.peekSelector)
            .invoke('text')
            .then(
                (peekText: string) => (peekList += peekText.trim().split(', ')),
            );
        return peekList;
    }

    isOpened() {
        cy.url().should('contain', '/home');
        return this;
    }

    navigationItemUrlShouldBe(pageUrl: string) {
        throw Error('Step is not implemented!');
    }

    theConfirmationModalIsOpened(modalName: string) {
        cy.get('.modal-content div')
            .should('be.visible')
            .and('contain.text', modalName);
        return this;
    }
}
