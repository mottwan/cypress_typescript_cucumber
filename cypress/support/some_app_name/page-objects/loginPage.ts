import { BasePage } from './basePage';
import { patientPortal2FaCodeQuery } from '../../utils/sql-utils';

export class LoginPage extends BasePage {
    private twoFaEmailCheckSelector = 'input[id=emailCheck]';

    enterEmailAddress(email: string) {
        this.fillTextField('email', email);
        return this;
    }

    enterPassword(password: string) {
        this.fillTextField('password', password);
        return this;
    }

    enter2FaCode(email: string) {
        cy.task('queryDb', patientPortal2FaCodeQuery(email)).then(
            (twoFaCodes: any) => {
                const code: string = twoFaCodes[0].code;
                this.fillTextField('code', code);
            },
        );
        return this;
    }

    clickLoginButton() {
        this.clickNamedButton('Login');
        return this;
    }

    clickOnEmailToRadioButton() {
        cy.get(this.twoFaEmailCheckSelector).click();
        return this;
    }

    clickOnSendCodeButton() {
        this.clickNamedButton('Send Code');
        return this;
    }

    clickOnVerifyCodeButton() {
        this.clickNamedButton('Verify Code');
        return this;
    }

    fillLoginForm(email: string, password: string) {
        return this.enterEmailAddress(email)
            .enterPassword(password)
            .clickLoginButton()
            .clickOnEmailToRadioButton()
            .clickOnSendCodeButton()
            .enter2FaCode(email)
            .clickOnVerifyCodeButton();
    }

    fillLoginFormWithout2Fa(email: string, password: string) {
        this.enterEmailAddress(email)
            .enterPassword(password)
            .clickLoginButton()
            .clickOnEmailToRadioButton()
            .clickOnSendCodeButton()
            .clickOnVerifyCodeButton();
        return this;
    }
}
