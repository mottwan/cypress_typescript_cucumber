import { HeaderBar } from '../components/headerBar';
import { SideNavigation } from '../components/sideNavigation';
import { Footer } from '../components/footer';

export class BasePage {
    protected placeholderSelector = (placeholderName: string) =>
        `input[placeholder='${placeholderName}']`;
    protected namedButtonSelector = (name: string) =>
        `button:contains(${name})`;
    headerBar: HeaderBar = new HeaderBar();
    sideNavigation: SideNavigation = new SideNavigation();
    footer: Footer = new Footer();
    private selectOption: string = "[role='listbox'] [role='option']";

    fillTextField(field: string, value: string) {
        return cy.get(`input[name="${field.toLowerCase()}"]`).type(value);
    }
    fillMessageTextField(field: string, value: string) {
        // @ts-ignore
        cy.get(`textarea[placeholder="${field}"]`).type(value);
        return this;
    }

    fillAppointmentMessageTextField(field: string, value: string) {
        return cy.get(`input[placeholder="${field}"]`).type(value);
    }
    clickNamedButton(btnName: string) {
        cy.wait(2000);
        return cy.contains('button', btnName).click();
    }
    clickNamedLink(linkName: string) {
        return cy.contains('a', linkName).click();
    }

    clickOnRadioButton(radioBtnName: string) {
        return cy.get('input[type="radio"]').click();
    }

    setDate(data: object) {
        for (const [key, value] of Object.entries(data[0])) {
            cy.get(this.placeholderSelector(key)).click();
            cy.get(this.selectOption).contains(`${value}`).click();
        }

        return this;
    }

    selectOptionFrom(selectElement: string, option: string) {
        cy.get(`[placeholder="${selectElement}"]`).click();
        cy.get('[role="option"]').contains(option).click();
        return this;
    }

    buttonDisabled(button: string) {
        cy.contains('button', `${button}`).should('be.disabled');
        return this;
    }

    assertOnPage(text: string) {
        cy.contains(text);
    }

    getModal(title: string, id: string) {
        cy.get(`#${id} .modal-title`).should('contain', title);

        return cy.get(`#${id}`).should('be.visible');
    }

    popUpWindowClose() {
        // to be refactored after SQM-378 is merged
        cy.get('.sc-eItWsw').contains('button', 'OK').click();
    }

    popUpWindowIsNotVisible() {
        cy.get('.sc-eItWsw').should('not.exist');
    }
}
