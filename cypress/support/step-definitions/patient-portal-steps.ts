import {
    When,
    Then,
    Given,
    DataTable,
    Before,
    BeforeStep,
} from '@badeball/cypress-cucumber-preprocessor';
import { BasePage } from '../some_app_name/page-objects/basePage';
import PatientPortal from '../some_app_name/patient-portal';
import { LoginPage } from '../some_app_name/page-objects/loginPage';
import { HomePage } from '../some_app_name/page-objects/homePage';
import { MedicalConditionsPage } from '../some_app_name/page-objects/medical-information/medicalConditionsPage';
import billingQuestionPage from '../some_app_name/page-objects/messaging/billingQuestionPage';
import { pageUrls } from '../../fixtures/test-data';
import sentPage from '../some_app_name/page-objects/messaging/messagesSentPage';
import errors from '../some_app_name/page-objects/messaging/messagesErrors';
import subject from '../some_app_name/page-objects/messaging/messagesSubject';
import refill from '../some_app_name/page-objects/messaging/prescriptionRefill';
import appointments from '../some_app_name/page-objects/messaging/requestAppointment';
import reply from '../some_app_name/page-objects/messaging/messagesReply';
import common from '../some_app_name/page-objects/messaging/messagesCommon';
import commonMedicalInformation from '../some_app_name/page-objects/medical-information/medicalInformationCommon';
import medicalConditions from '../some_app_name/page-objects/medical-information/medicalConditions';
import allergies from '../some_app_name/page-objects/medical-information/allergies';
import search from '../some_app_name/page-objects/messaging/messagesSearch';
import { createAppointment, getSessionToken } from '../api/api-pp-client';
import { values } from '../utils/test-utils';
import { initializeAwsLogsClient, runLogsInsightsQuery } from '../api/aws-logs';
import { initialize } from '../api/api-client';
import messagesInboxPage from '../some_app_name/page-objects/messaging/messages-inbox-page';

const base = new BasePage();
const loginPage: LoginPage = new LoginPage();
const homePage: HomePage = new HomePage();
const medicalConditionsPage: MedicalConditionsPage =
    new MedicalConditionsPage();
const defaultPracticeId = Cypress.env('practice_id');
const { defaultEmail, defaultPassword } = Cypress.env('some_app_name');

Before({ tags: '@ui' }, () => {
    cy.loginPatient('PP');
    initialize('some_app_name', null);
});

BeforeStep({ tags: '@ui-communication' }, () => {
    getSessionToken();
    initializeAwsLogsClient();
});

Then('I skip the guide tour', function () {
    homePage.skipGuideTour();
});
When(
    'I expand {string} from {string} menu',
    function (navigationMenu: string, navigationType: string) {
        let navigation =
            navigationType === 'side' ? homePage.sideNavigation : homePage;
        navigation.expandNavigationMenu(navigationMenu);
    },
);

When(
    'I expand {string} of {string} from {string} menu',
    function (
        navigationItem: string,
        navigationMenu: string,
        navigationType: string,
    ) {
        let navigation =
            navigationType === 'side' ? homePage.sideNavigation : homePage;
        navigation.expandNavigationMenu(navigationMenu);
        // subNavigation Item
        switch (navigationType) {
            case 'main':
                homePage.clickOnNavigationItem(navigationItem);
                break;
            case 'side':
                medicalConditionsPage.sideNavigation.clickOnNavigationItem(
                    navigationItem,
                );
                break;
            default:
                break;
        }
    },
);

When(
    'I click on {string} navigation {string} menu item',
    function (navigationItem: string, navigationType: string) {
        switch (navigationType) {
            case 'main':
                homePage.clickOnNavigationItem(navigationItem);
                break;
            case 'side':
                medicalConditionsPage.sideNavigation.clickOnNavigationItem(
                  navigationItem,
                );
                break;
            default:
                break;
        }
    },
);

Then(
    /I (?:should be|am) redirected (?:on|to) "([^"]*)" page/,
    function (page: string) {
        PatientPortal.isOnPage(page);
    },
);

Given('I am on {string} page', function (pageName: string) {
    PatientPortal.openPage(pageName);
    PatientPortal.isOnPage(pageName);
});
Then('The navigation item url should be {string}', function (pageUrl: string) {
    homePage.navigationItemUrlShouldBe(pageUrl);
});
Then(
    'The confirmation modal {string} is displayed',
    function (modalName: string) {
        homePage.theConfirmationModalIsOpened(modalName);
    },
);
Given('I am logged out', function () {
    homePage.headerBar.clickOnLogoutIcon();
});
When(
    'I use authentication {string} with following credentials',
    function (authMethod: string, dataTable: DataTable) {
        const [email, password] = dataTable.rows()[0];
        PatientPortal.chooseAuthMethod(authMethod);
        loginPage.fillLoginForm(email, password);
    },
);
Given('I am logged in Patient Portal', function () {
    PatientPortal.openPage(`/login?id=${defaultPracticeId}`);
    PatientPortal.chooseAuthMethod('Login with password');
    loginPage.fillLoginForm(defaultEmail, defaultPassword);
    homePage.isOpened();
});
Given('I navigate to {string} page', function (pageName: string) {
    PatientPortal.openPage(pageUrls[pageName]);
    PatientPortal.isOnPage(pageUrls[pageName]);
});

When(
    'I fill {string} form with the following details',
    function (pageName: string, datatable: DataTable) {
        cy.get('div[width]').should('not.exist');
        cy.get('button[disabled]').should('not.exist');
        const data = datatable.hashes();
        for (const { fieldName, fieldValue } of data) {
            if (fieldName === 'Date of Service') {
                const [month, day, year] = fieldValue.split(' ');
                billingQuestionPage.setDateOfService([
                    {
                        Month: month,
                        Day: day,
                        Year: year,
                    },
                ]);
            } else if (fieldName.includes('Request Date')) {
                const [month, day, year] = fieldValue.split(' ');
                billingQuestionPage.setDateOfService([
                    {
                        Month: month,
                        Day: day,
                        Year: year,
                    },
                ]);
            } else if (fieldName === 'Question/Comments...') {
                billingQuestionPage.fillMessageTextField(fieldName, fieldValue);
            } else if (fieldName === 'Question...') {
                billingQuestionPage.fillMessageTextField(fieldName, fieldValue);
            } else if (fieldName === 'Comments') {
                billingQuestionPage.fillAppointmentMessageTextField(
                    fieldName,
                    fieldValue,
                );
            } else if (fieldName === 'Reason for Referral...') {
                billingQuestionPage.fillMessageTextField(fieldName, fieldValue);
            } else if (fieldName === 'Additional Information..') {
                billingQuestionPage.fillMessageTextField(fieldName, fieldValue);
            } else {
                billingQuestionPage.selectOptionFrom(fieldName, fieldValue);
            }
        }
    },
);
When('I click on {string} button', function (buttonName: string) {
    billingQuestionPage.clickNamedButton(buttonName);
    this.currentTime = new Date().toLocaleString('en-US', { timeZone: 'GMT' });
});
Then(
    'I should see confirmation pop-up window with message {string}',
    function (message: string) {
        messagesInboxPage.popUpWindowIsVisible(message);
    },
);

Then('I should see appointment confirmation pop-up window', function () {
    messagesInboxPage.appointmentPopUpWindowIsVisible();
});

When(/^I login with valid credentials$/, function () {
    cy.loginPatient('login');
});
When("I'm redirected on {string} page", function (pageUrl: string) {
    PatientPortal.openPage(pageUrl);
});

Then('set pause', function () {
    PatientPortal.setPause();
});

Then('I click on  {string} subject', function (subjectName: string) {
    subject.subjectSelect(subjectName);
});

Then('I should see date error', function () {
    errors.dateErrorIsVisible();
});

Then('I should see comment field error', function () {
    errors.commentErrorIsVisible();
});

Then('I should see billing comment field error', function () {
    errors.commentErrorIsVisibleBilling();
});

Then('I should see referral comment field error', function () {
    errors.commentErrorIsVisibleReferral();
});

Then('I should see referral dropdown field error', function () {
    errors.dropdownErrorIsVisibleReferral();
});

Then('I should see this message in sent messages', function () {
    sentPage.getSentMessage();
});

Then(
    'I should see a message with {string} subject in database',
    function (pageName: string, datatable: DataTable) {
        sentPage.getSentMessageDB(pageName, datatable);
    },
);

Then('I wait a sec', function () {
    cy.wait(2000);
});

Then('I should see {string} on the page', function (text: string) {
    base.assertOnPage(text);
});

Then(
    'deactivate medication {int} id of patient {int} id',
    function (medicationId: number, patientId: number) {
        refill.deactivateMedication(medicationId, patientId);
    },
);

Then(
    'activate medication {int} id of patient {int} id',
    function (medicationId: number, patientId: number) {
        refill.activateMedication(medicationId, patientId);
    },
);

Then(
    'add pharmacy {int} id of user {int} id',
    function (pharmacyId: number, userId: number) {
        refill.addPharmacy(userId, pharmacyId);
    },
);

Then(
    'remove pharmacy {int} id of user {int} id',
    function (pharmacyId: number, userId: number) {
        refill.removePharmacy(userId, pharmacyId);
    },
);

Then('I verify that "Pharmacy" field has the data', function () {
    refill.pharmacyPopulated();
});

Then('I verify that "Medication" field has the data', function () {
    refill.medicationPopulated();
});

Then('No pharmacy message displayed', function () {
    refill.pharmacyWarning();
});

Then('The {string} button should be disabled', function (button: string) {
    base.buttonDisabled(button);
});

Then('I adding a pharmacy', function () {
    refill.addingPharmacy();
});

Then('"Prescription Refill" subject should be disabled', function () {
    refill.refillDisabled();
});

Then(
    'I changing month to February to make 31 date invalid and check that"day" drop down field reset to default "Day" value',
    function () {
        appointments.dateResetToDefault();
    },
);

Then(
    'I check that there are no 30,31 options in "day" drop down field and select valid value',
    function () {
        appointments.dateSelectValid();
    },
);

Then('I check and select 3 request dates', function () {
    appointments.selectRequestedDates();
});

Then(
    "I check that only 2nd and 3rd request dates have trash bin icon and 1st don't have it",
    function () {
        appointments.checkTrashBinIcons();
    },
);

Then('I delete 2nd and 3rd request dates', function () {
    appointments.deleteRequestedDates();
});

Then('I click on the first message and message detail displayed', function () {
    reply.getFirstMessage();
});

Then('"To" and "Subject" should be written', function () {
    reply.checkPopulatedFields();
});

Then('I search for a message by {string}', function (searchRequest) {
    common.searchMessage(searchRequest);
});

Then('I add text {string}', function (text) {
    reply.addText(text);
});

Then('I should see reply message in sent messages', function () {
    reply.getReplySentMessage();
});

Then('I click on the {string} button', function (styleButton) {
    reply.clickStyleButton(styleButton);
});

Then(
    'The text inside the message should be written in {string} text',
    function (style) {
        reply.checkTextIs(style);
    },
);

Then('I attach file it was attached', function () {
    reply.attachFile();
});

Then('The message should be sent with attached files', function () {
    reply.getReplySentMessageWithAttachment();
});

Then('I click X icon to delete attached file', function () {
    reply.deleteFile();
});

Then(
    'I search for a message {string} and search is not performed',
    function (searchRequest) {
        search.checkNoRequest(searchRequest);
    },
);

Then('displayed {string} messages', function (numberOfMessages) {
    search.checkSearchResults(numberOfMessages);
});

Then('I clear search field clicking on X icon and check result', function () {
    search.clearSearch();
});

Then(
    'I search message with long name {string} and search is not performed',
    function (searchRequest) {
        search.failingSearch(searchRequest);
    },
);

Then('I click "here" link', function () {
    common.clickPolicyLink();
});

Then('A pop up window with Practice Privacy Policy should open', function () {
    common.policyPopUp();
});

Then('I click Close button to close pop up', function () {
    common.policyPopUpClose();
});

Then('the default text on the top of the form should present', function () {
    common.topText();
});

Then('the attention text should present', function () {
    common.attentionText();
});

Then('the policy text should present', function () {
    common.policyText();
});

Then('I click on {string} nav button', function (pageName) {
    common.messageNavBar(pageName);
});

When('When I click on {string} link', function (text: string) {
    base.clickNamedLink(text);
});

Then('I click on arrow left icon', function () {
    common.redirectHomePage();
});

Then('I click on "Messages" icon', function () {
    common.clickMessageIcon();
});

Then('I see a list of matching {string}', function (searchRequest) {
    allergies.checkSearchResult(searchRequest);
});

Then('nothing was found', function () {
    allergies.nothingFound;
});

Then('I skip an {string}', function (allergy) {
    allergies.addAllergyNoReaction(allergy);
});

Then('I add an {string} with {string}', function (allergy, reaction) {
    allergies.addAllergyWithReaction(allergy, reaction);
});

Then(
    'I add an {string} with {string} and {string}',
    function (allergy, reaction, option) {
        allergies.addAllergyWithOtherReaction(allergy, reaction, option);
    },
);

Then('I see added {string}', function (allergy) {
    allergies.checkAddedAllergy(allergy);
});

Then("I don't see skipped {string}", function (allergy) {
    allergies.checkSkippedAllergy(allergy);
});

Then('I see the list off allergies', function (datatable: DataTable) {
    allergies.checkListOfAllergies(datatable);
});

Then(
    'I populate {string} with {string} and {string}',
    function (allergy, reaction, option) {
        allergies.populateFields(allergy, reaction, option);
    },
);

Then('I populate {string} with {string}', function (allergy, reaction) {
    allergies.populateFieldsNoDescription(allergy, reaction);
});

Then('I delete {string} and click Yes', function (allergy) {
    allergies.deleteAllergyYes(allergy);
});

Then('I delete {string} and click No', function (allergy) {
    allergies.deleteAllergyNo(allergy);
});

Then(
    'I check delete icon is absent for allergies added by practice',
    function () {
        allergies.deleteAllergyPractice();
    },
);

Then(
    'I check edit icon is absent for allergies added by practice',
    function () {
        allergies.editAllergyPractice();
    },
);

Then('I check allergy added by practice', function () {
    allergies.checkAllergyPractice();
});

Then('I see the {string} was added by {string}', function (allergy, user) {
    allergies.checkUserDisplayed(allergy, user);
});

Then('I click X icon on search bar', function () {
    allergies.clickXiconSearch();
});

Then(
    'I see "{string} has been deleted successfully" pop-up message is displayed',
    function (allergy) {
        allergies.checkDeletePopup(allergy);
    },
);

Then('I edit {string} with {string}', function (allergy, option) {
    allergies.editAllergy(allergy, option);
});

Then('I edit {string} with other {string}', function (allergy, option) {
    allergies.editAllergyOther(allergy, option);
});

Then(
    'I check that {string} was edited with {string}',
    function (allergy, option) {
        allergies.editAllergyCheck(allergy, option);
    },
);

Then(
    "I check that {string} of {string} wasn't changed",
    function (allergy, reaction) {
        allergies.editAllergyCheckBack(allergy, reaction);
    },
);

Then(
    'I search for an {string} using {string} field',
    function (searchRequest, field) {
        commonMedicalInformation.searchMedicalInformation(searchRequest, field);
    },
);

Then('I see added {string} condition', function (condition) {
    medicalConditions.checkAddedCondition(condition);
});

Then('I delete {string}', function (condition) {
    medicalConditions.deleteCondition(condition);
});

Then(
    'I see Information, Edit and Delete icons on the right side of the {string}',
    function (condition) {
        medicalConditions.checkIcons(condition);
    },
);

Then(
    'I check the {string}, {string}, {string} and {string}',
    function (
        condition_began,
        treating_doctor,
        reconciled_by,
        reconciled_date,
    ) {
        medicalConditions.checkAdditionalInformation(
            condition_began,
            treating_doctor,
            reconciled_by,
            reconciled_date,
        );
    },
);

Then('I see {string} added by practice', function (condition) {
    medicalConditions.checkDoctorName(condition);
});

Then('I click on {string} icon for {string}', function (icon, condition) {
    medicalConditions.clickOnIcon(icon, condition);
});

Then(
    'I select {string}, {string}, {string} and {string}',
    function (day, month, year, doctor) {
        medicalConditions.editCondition(day, month, year, doctor);
    },
);

Then('I see {string} is not added', function (condition) {
    medicalConditions.checkConditionNotAdded(condition);
});

Then(
    'I tick the checkbox under the {string} button for the {string}',
    function (answer, condition) {
        medicalConditions.selectAnswer(answer, condition);
    },
);

Then(
    'Modal {string} with id {string} should be open with the details',
    function (title: string, id: string) {
        base.getModal(title, id)
            .should('contain', 'Privacy Policy')
            .and('contain', 'Return/Refund Policy');
    },
);
When(
    'I click on the {string} icon of the {string} message',
    function (action: string, nthElement: string) {
        cy.interceptRequest('POST', `api/patient-messaging/message/delete`).as(
            'deleteMessage',
        );
        messagesInboxPage.deleteMessage(values[nthElement.toLowerCase()]);
        messagesInboxPage.assertOnPage('Are you sure you want to delete?');
    },
);

Then('The message should be deleted', function () {
    cy.wait('@deleteMessage').should(({ response }) => {
        expect(response.statusCode).to.eq(200);
    });
});

When(/^I have an upcoming appointment$/, function () {
    createAppointment().as('appointmentId');
});
When('I navigate to {string} view form', function (pageName: string) {
    PatientPortal.openPage(`${pageUrls[pageName]}${this.appointmentId}`);
    PatientPortal.isOnPage(`${pageUrls[pageName]}${this.appointmentId}`);
});

Then('I should see first 10 available times slots', function () {
    PatientPortal.checkForAvailableTimeSlots();
});
When(
    'The selected {string} timeslot from {string} page',
    function (nthSlot: string, pageName: string) {
        cy.interceptRequest('GET', `api/appointment/getDetails/*`).as(
            'appointmentDetails',
        );
        PatientPortal.openPage(`${pageUrls[pageName]}${this.appointmentId}`);
        PatientPortal.selectAvailableTimeSlot(values[nthSlot.toLowerCase()]);
    },
);

Then('I should receive pop-up with the appointment details', () => {
    PatientPortal.appointmentDetailsModal();
});

When(
    'I confirm the appointment by pressing {string} button from appointment details pop-up',
    function (confirmation: string) {
        cy.intercept('POST', 'api/appointment/reschedule', {
            statusCode: 200,
        }).as('rescheduleRequest');

        PatientPortal.submitApointmentModal(confirmation);
    },
);

Then('I should receive a confirmation pop-up with my reschedule', function () {
    // @ts-ignore
    cy.get('@appointmentDetails').then(({ response }) => {
        const time = response.body.appointment.date.startTime;
        const date = response.body.appointment.date.date;
        const provider = response.body.appointment.provider.name;

        PatientPortal.appointmentConfirmationDetails(provider, date, time);
    });
});
Then('A communication event should be created on AWS', function () {
    const queryString =
        'fields @timestamp, @logStream, @log @message like "contdetst@gmail.com" | sort @timestamp desc | limit 20';
    const logGroupName =
        '/aws/lambda/communication-trunk-EmailDispatcherFunction-pnQ70gUWrLAY';
    const startTime = Date.now() - 3600000;
    const endTime = Date.now();

    runLogsInsightsQuery(queryString, logGroupName, startTime, endTime)
        .then((results) => {
            console.log('Query results:', results);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});
Then('I close the pop-up', function () {
    base.popUpWindowClose();
});

Then('The pop-up window should close', function () {
    base.popUpWindowIsNotVisible();
});
