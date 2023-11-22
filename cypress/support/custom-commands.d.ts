declare namespace Cypress {
    interface Chainable<Subject> {
        completeRegistration(
            firstName: string,
            lastName: string,
            year: string,
            month: string,
            day: string,
            email: string,
            password: string,
        ): Chainable<Subject>;

        loginPatient(sessionId: string): Chainable<Subject>;
        loginPractice(sessionId: string): Chainable<Subject>;

        authEhrLogin(
            appName: string,
            practiceId?: number,
            patientId?: number,
            userId?: number,
        ): Chainable<Subject>;

        getToken(): Chainable<Subject>;
        getByTestId(id: string): Chainable<JQuery>;
        getById(id: string): Chainable<Subject>;
        interceptRequest(
            method: string,
            url: string,
            response?: Record<any, any>,
        ): Chainable<Subject>;
        navigationSelect(
            dropdownName: string,
            optionName: string,
        ): Chainable<Subject>;
        patientRegistrationForm(
            firstName: string,
            lastName: string,
            birthMonth: string,
            birthDay: number,
            birthYear: string,
            sex: string,
            ssn: string,
            phone: string,
            email: string,
            streetAddress: string,
            zip: string,
            practiceLocation: string,
        ): Chainable<Subject>;
        submitPatientRegistration(buttonName: string): Chainable<void>;
        assertInsuranceOptions(option: string): Chainable<Subject>;
        selectInsuranceOption(insuranceType: string): Chainable<Subject>;
        assertPatientProfileView(pageName: string): Chainable<Subject>;
        selectContextMenu(
            option: string,
            isIframe: boolean,
        ): Chainable<Subject>;
        waitForRequest(aliases: Array<string>): Chainable<Subject>;
        getByLabel(input: string): Chainable<Subject>;
        sidePanel(panelName: string): Chainable<Subject>;
        getRecentPatient(patientName: string): Chainable<Subject>;
        getSearchedPatient(): Chainable<Subject>;
        assertPatientCreation(pageName: string): Chainable<Subject>;
        dropdownMenu(navigationName?: string): Chainable<Subject>;
        selectDropdown(option?: string): Chainable<Subject>;
        topRightNavBar(navigationName: string): Chainable<Subject>;
        waitForIframeToBeLoaded(iframe: string): Chainable<Subject>;
        getIframe(iframe?: string): Chainable<Subject>;
        findSelectField(label: string): Chainable<Subject>;
        getNoteFormatSelect(): Chainable<Subject>;
        getAppointmentListForCurrentUser(): Chainable<Subject>
    }
}
