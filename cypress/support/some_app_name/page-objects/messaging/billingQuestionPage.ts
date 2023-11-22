import { BasePage } from '../basePage';

class BillingQuestionPage extends BasePage {
    fillProviderTextField(value: string) {
        this.fillMessageTextField('', value);
    }

    setDateOfService(date: any[]) {
        this.setDate(date);
    }
}
export default new BillingQuestionPage();
