import { login, sendRequest, initialize, HttpMethod } from '../api/api-client';
import {
    DataTable,
    Given,
    Then,
    When,
} from '@badeball/cypress-cucumber-preprocessor';
import { medicationUrls } from '../../fixtures/endpoints';
import {
    parsedPayload,
    payload,
    responseHandler,
} from '../../fixtures/test-data';
import { prescriptionIdFrom } from '../utils/filters';
import {
    fetchTestDataFrom,
    collectGivenTestDataTo,
    replacePlaceholders,
    evaluateExpressions,
    replacePlaceholdersIfFound,
    values,
} from '../utils/test-utils';
import { checkPayload, checkStatusCode } from '../utils/checkers';

let actualResponse: Record<string, any> = null;
let dataBaseQueryResults: any[] = [];
const testDataStorage: Map<string, string> = new Map<string, string>();

Given('I am authenticated on {string} app', function (appName: string) {
    login(appName).then((token: string) => initialize(appName, token));
});
Given(
    'I am authenticated on {string} app using the following data:',
    function (appName: string, dataTable: DataTable) {
        collectGivenTestDataTo(testDataStorage, dataTable);
        const { practice_id, patient_id, user_id } = dataTable.hashes()[0];
        login(appName, +practice_id, +patient_id, +user_id).then(
            (token: string) => initialize(appName, token),
        );
    },
);

When(
    'I create a new prescription with/using provided parameters',
    function (dataTable: DataTable) {
        collectGivenTestDataTo(testDataStorage, dataTable);
        const { prescription_id, patient_id, note_id } =
            fetchTestDataFrom(testDataStorage);
        const url: string = medicationUrls('createPrescription', {
            patient_id,
            prescription_id,
            note_id,
        });
        sendRequest(
            'POST',
            url,
            payload('createPrescriptionPayload', { noteId: note_id }),
        ).then((response: any) => {
            actualResponse = response;
            testDataStorage.set(
                'prescription_id',
                response.body['id'] as string,
            );
            testDataStorage.set(
                'medication_id',
                response.body['medId'] as string,
            );
        });
    },
);

When(
    'I create a new medication with/using provided parameters',
    function (dataTable: DataTable) {
        collectGivenTestDataTo(testDataStorage, dataTable);
        const { prescription_id, patient_id, note_id, rmi_id } =
            fetchTestDataFrom(testDataStorage);
        const url: string = medicationUrls('createMedication', {
            patient_id,
            prescription_id,
            note_id,
        });

        sendRequest(
            'POST',
            url,
            payload('createMedicationPayload', { rmiId: +rmi_id }),
        ).then((response: any) => {
            actualResponse = response;
            testDataStorage.set('medication_id', response.body['id'] as string);
            testDataStorage.set('med_id', response.body['medId'] as string);
        });
    },
);

When(
    'I send post api request with empty body on {string} endpoint',
    function (endpoint: string, dataTable: DataTable) {
        collectGivenTestDataTo(testDataStorage, dataTable);
        const { patient_id, prescription_id, note_id } =
            fetchTestDataFrom(testDataStorage);
        const url: string = medicationUrls(endpoint, {
            patient_id,
            prescription_id,
            note_id,
        });
        sendRequest('POST', url, {}).then(
            (response: any) => (actualResponse = response),
        );
    },
);

Then(
    'I should get the response with a json body',
    function (fromDataTable: DataTable) {
        collectGivenTestDataTo(testDataStorage, fromDataTable);
        const { response_body, status_code, practice_id, prescription_id } =
            fetchTestDataFrom(testDataStorage, [
                'practice_id',
                'note_id',
                'prescription_id',
                ...fromDataTable.raw().slice(0, 1)[0],
            ]);
        const expectedResponse = responseHandler(
            response_body,
            prescription_id,
            practice_id,
        );
        expect(status_code, 'statusCode').to.equal(
            actualResponse.status.toString(),
        );
        expect(prescriptionIdFrom(expectedResponse), 'body').to.equal(
            prescriptionIdFrom(actualResponse.body),
        );
    },
);

Given(
    'This number {string} as an invalid {string}',
    function (numberAsId: string, name: string) {
        const data: string[][] = [[name], [numberAsId]];
        const fromDataTable = new DataTable(data);
        collectGivenTestDataTo(testDataStorage, fromDataTable);
    },
);

Given('I have set the input data as:', function (fromDataTable: DataTable) {
    collectGivenTestDataTo(testDataStorage, fromDataTable);
});

Given('I delete all existing prescriptions', function () {
    const { endpoint, patient_id, note_id, note_id_2 } =
        fetchTestDataFrom(testDataStorage);
    const fetchEndpoint: string = medicationUrls('getPrescriptions', {
        patient_id,
        note_id,
    });
    [note_id, note_id_2].forEach((note) => {
        sendRequest('GET', fetchEndpoint).then((response: any) => {
            actualResponse = response;
            response.body['prescriptions'].forEach(
                (prescription: Record<string, any>) => {
                    const prescriptionId = prescription.notePrescription.id;
                    const deleteEndpoint: string = medicationUrls(endpoint, {
                        patient_id,
                        prescription_id: prescriptionId,
                        note_id: note,
                    });
                    sendRequest('DELETE', deleteEndpoint).then(
                        (response: any) => (actualResponse = response),
                    );
                },
            );
        });
    });
});

Given('I have following input test data', function (dataTable: DataTable) {
    dataTable
        .hashes()
        .forEach(({ first_widget_id, second_widget_id, last_widget_id }) => {
            const innerDataTable = new DataTable([
                ['second_widget_id', 'last_widget_id'][
                    (evaluateExpressions(
                        replacePlaceholders(second_widget_id, {
                            first_widget_id: first_widget_id,
                        }),
                    ),
                    evaluateExpressions(
                        replacePlaceholders(last_widget_id, {
                            first_widget_id: first_widget_id,
                        }),
                    ))
                ],
            ]);
            collectGivenTestDataTo(testDataStorage, innerDataTable);
        });
});

Given(
    'I execute a database query as follows',
    function (databaseQuery: string) {
        const { last_widget_id, user_id, practice_id, note_id } =
            fetchTestDataFrom(testDataStorage);
        for (let i = 1; i <= Number(last_widget_id); i++) {
            cy.task(
                'queryDb',
                replacePlaceholders(databaseQuery, {
                    record: i.toString(),
                    user_id: user_id,
                    practice_id: practice_id,
                    note_id: note_id,
                }),
            ).then((results) => {
                dataBaseQueryResults.push(results);
            });
        }
    },
);

Given('I execute a query database as follows', function (dataTable: DataTable) {
    for (const { query } of dataTable.hashes()) {
        cy.task(
            'queryDb',
            replacePlaceholdersIfFound(
                query,
                fetchTestDataFrom(testDataStorage),
            ),
        ).then((results) => dataBaseQueryResults.push(results));
    }
});

When(
    'I send api request on {string} endpoint',
    function (endpoint: string, dataTable: DataTable) {
        const {
            invalid_token,
            first_widget_id,
            second_widget_id,
            user_id,
            patient_id,
        } = fetchTestDataFrom(testDataStorage);
        const endpointUrl = endpoint.replace('{patient_id}', patient_id);
        for (const { method, payload } of dataTable.hashes()) {
            const correctPayload = ['GET', 'DELETE'].includes(method)
                ? undefined
                : parsedPayload(
                      evaluateExpressions(
                          replacePlaceholders(payload, {
                              first_widget_id: first_widget_id,
                              second_widget_id: second_widget_id,
                              user_id: user_id,
                          }),
                      ),
                  );
            sendRequest(
                method as HttpMethod,
                endpointUrl,
                correctPayload,
                invalid_token,
            ).then((response: any) => (actualResponse = response));
        }
    },
);

Then('I should obtain the following response', function (dataTable: DataTable) {
    for (const { expectedCode, expectedResponse } of dataTable.hashes()) {
        checkStatusCode(expectedCode, actualResponse.status);
        checkPayload(
            replacePlaceholdersIfFound(
                expectedResponse,
                fetchTestDataFrom(testDataStorage),
            ),
            actualResponse,
        );
    }
});

Given('I have {string} app up and running', function (appName: string) {
    initialize(appName, null);
});

Given('I break db connection on purpose', function () {
    return 'skipped';
});

When(
    'I send a {string} request on {string} endpoint',
    function (httpVerb: string, endpoint: string, dataTable: DataTable) {
        collectGivenTestDataTo(testDataStorage, dataTable);
        const {
            prescription_id,
            patient_id,
            note_id,
            note_id_2,
            medication_id,
            archived_medication_id,
        } = fetchTestDataFrom(testDataStorage);
        const { payloadName } = dataTable
            ? dataTable.hashes()[0]
            : new DataTable([['payloadName'], ['']]).hashes()[0];
        sendRequest(
            httpVerb.toUpperCase() as HttpMethod,
            medicationUrls(endpoint, {
                patient_id,
                prescription_id,
                note_id: note_id_2 ? note_id_2 : note_id,
            }),
            payload(payloadName, {
                medicationId: archived_medication_id
                    ? +archived_medication_id
                    : +medication_id,
            }),
        ).then((response: any) => (actualResponse = response));
    },
);

When(/^(when\s)?I retrieve the list of archived medications$/, function () {
    sendRequest(
        'GET',
        medicationUrls(
            'getArchivedMedications',
            fetchTestDataFrom(testDataStorage),
        ),
    ).then((response: any) => {
        actualResponse = response;
        testDataStorage.set(
            'archived_medication_id',
            response.body.medications[0].id,
        );
    });
});

When(
    /^(when\s)?I retrieve the list of current medication$/,
    function (_, dataTable: DataTable) {
        collectGivenTestDataTo(testDataStorage, dataTable);
        sendRequest(
            'GET',
            medicationUrls(
                'getCurrentMedications',
                fetchTestDataFrom(testDataStorage),
            ),
        ).then((response: any) => {
            actualResponse = response;
            testDataStorage.set(
                'medication_id',
                response.body.medications[0].id as string,
            );
        });
    },
);

Then(
    /^database and api fields should equals$/,
    function (dataTable: DataTable) {
        for (const { api, database } of dataTable.hashes()) {
            actualResponse.body['icds'].forEach(
                (icd: string, index: number) => {
                    expect(icd[api]).to.equal(
                        dataBaseQueryResults[0][index][database],
                    );
                },
            );
        }
    },
);

Then(
    /^database and api results length should ([^"]*)$/,
    function (comparison: string) {
        switch (comparison) {
            case 'eq':
            case 'equal':
            case 'equals':
                expect(dataBaseQueryResults[0].length).to.equal(
                    actualResponse.body['icds'].length,
                );
                break;
            case 'not eq':
            case 'not equal':
            case 'not equals':
            case 'does not eq':
            case 'does not equal':
            case 'does not equals':
                expect(dataBaseQueryResults[0].length).to.not.equal(
                    actualResponse.body['icds'].length,
                );
                break;
        }
    },
);

Given(
    /^the sql "([^"]*)" field should have value "([^"]*)"$/,
    function (fieldName: string, value: string) {
        expect(
            dataBaseQueryResults[1][0][fieldName],
            `${fieldName} field`,
        ).to.equal(value);
    },
);

Then(
    'I pickup {string} medication id from the archived medication list',
    function (order: string) {
        const dataTable: DataTable = new DataTable([
            ['archived_medication_id'][
                actualResponse.body.medications[values[order]].id
            ],
        ]);
        collectGivenTestDataTo(testDataStorage, dataTable);
    },
);

Then(/^I should find medication Id in current medication list$/, function () {
    const { med_id } = fetchTestDataFrom(testDataStorage);
    sendRequest(
        'GET',
        medicationUrls(
            'getCurrentMedications',
            fetchTestDataFrom(testDataStorage),
        ),
    ).then((response: any) => {
        actualResponse = response;
        expect(actualResponse.body.medications[0].medication.id).to.equal(
            med_id,
        );
    });
});
