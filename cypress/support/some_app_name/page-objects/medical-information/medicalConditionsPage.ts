import { BasePage } from '../basePage';

export class MedicalConditionsPage extends BasePage {
    yesCheckboxInputSelector: string = "input[type='checkbox'][value='yes']";
    noCheckboxInputSelector: string = "input[type='checkbox'][value='no']";
    menuItemSelector: string = 'section,.list-group a[href]';
    menuItemStatusSelector: string = '.nav-link__done-status,span';
    // @ts-ignore
    private diseaseRowChainer = (diseaseName: string) =>
        cy.contains('b', diseaseName);

    searchForCondition(searchKeyword: string) {
        // @ts-ignore
        cy.get(this.placeholderSelector('Search for a Condition...')).type(
            searchKeyword,
        );
    }

    selectNoForAllMedicalConditions() {
        // @ts-ignore
        cy.contains('label', 'NO')
            .parent('div')
            .find("input[type='checkbox']")
            .click();
        return this;
    }

    selectYesDisease(diseaseName: string) {
        this.diseaseRowChainer(diseaseName)
            .find(this.yesCheckboxInputSelector)
            .click();
        return this;
    }

    selectNoDisease(diseaseName: string) {
        this.diseaseRowChainer(diseaseName)
            .find(this.noCheckboxInputSelector)
            .click();
        return this;
    }

    clickOnSubmitButton() {
        this.clickNamedButton('SUBMIT');
        return this;
    }

    completeMedicalConditions({
        diseasePresence,
        diseaseAbsence,
    }: {
        diseasePresence: string[];
        diseaseAbsence: string[];
    }) {
        diseasePresence.forEach((presentDisease) => {
            this.selectYesDisease(presentDisease);
        });
        diseaseAbsence.forEach((absentDisease) => {
            this.selectNoDisease(absentDisease);
        });
        this.clickOnSubmitButton();
        return this;
    }

    completeMedicalConditionAsNoDisease() {
        this.selectNoForAllMedicalConditions().clickOnSubmitButton();
        return this;
    }

    clickOnBackButton() {
        this.clickNamedButton('BACK');
        return this;
    }

    medicalConditionsShouldBeComplete() {
        // @ts-ignore
        cy.get(this.menuItemSelector)
            .find(this.menuItemStatusSelector)
            .should('contain.text', 'Complete');
    }
    medicalConditionsShouldNotBeComplete() {
        // @ts-ignore
        cy.get(this.menuItemSelector)
            .find(this.menuItemStatusSelector)
            .should('contain.text', 'Please Complete');
        return this;
    }

    clickOnAddAConditionButton() {
        this.clickNamedButton('ADD A CONDITION');
        return this;
    }

    clickOnEditDiseaseInformation(disease: string) {
        // @ts-ignore
        cy.contains('h3', disease)
            .find("section button svg=[data-icon='pen-to-square']")
            .click();
        return this;
    }

    clickOnShowAndHideDiseaseInformation(disease: string) {
        // @ts-ignore
        cy.contains('h3', disease)
            .find("section button svg=[data-icon='circle-info']")
            .click();
        return this;
    }

    clickOnDeleteDiseaseInformation(disease: string) {
        // @ts-ignore
        cy.contains('h3', disease)
            .find("section button svg=[data-icon='trash-can']")
            .click();
        return this;
    }
}
