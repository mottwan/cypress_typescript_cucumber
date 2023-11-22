// dependency imports
import 'cypress-iframe';
import { load } from 'cheerio';
import 'cypress-wait-until';
import 'cypress-real-events/support';

// commands imports
import './ehr-components/patient-registration-commands';
import './ehr-components/common-ehr-commands';

// function imports
import {
    patientPortal2FaCodeQuery,
    practice2FaCodeQuery,
} from './utils/sql-utils';
import { authEhrPayload } from '../fixtures/test-data';

// type imports
import { Method, RouteHandler, RouteMatcher } from 'cypress/types/net-stubbing';
import { contextMenuOptions } from './utils/test-utils';

const practiceId = Cypress.env('practice_id');
let expiration: number;
const REFRESH_TOKEN_SAFETY = 60;
const tokens: Record<any, any> = {};

const patientPortalEnvironment = Cypress.env('some_app_name');
const ehrEnvironment = Cypress.env('ehr');

const loginPatient = (sessionId: string) => {
    cy.session(
        sessionId,
        () => {
            cy.request({
                method: 'GET',
                url: `${patientPortalEnvironment.baseUrl}/login`,
                qs: {
                    id: practiceId,
                },
            }).then((response) => {
                const responseHTML = load(response.body);
                const csrfToken = responseHTML('meta[name="csrf-token"]').attr(
                    'content',
                );

                cy.request({
                    method: 'POST',
                    url: `${patientPortalEnvironment.baseUrl}/login`,
                    qs: {
                        id: practiceId,
                    },
                    body: {
                        _token: csrfToken,
                        email: patientPortalEnvironment.username,
                        password: patientPortalEnvironment.password,
                    },
                    timeout: 120000,
                }).then((response) => {
                    const responseHTML = load(response.body);
                    const csrfToken = responseHTML(
                        'meta[name="csrf-token"]',
                    ).attr('content');

                    cy.request({
                        method: 'POST',
                        url: `${patientPortalEnvironment.baseUrl}/2fa/send`,
                        form: true,
                        body: {
                            _token: csrfToken,
                            'otp-type': 'email',
                        },
                    }).then((response) => {
                        const responseHTML = load(response.body);
                        const deliveryMessage = responseHTML(
                            'input[name="deliveryAddressMsg"]',
                        ).attr('value');

                        cy.task(
                            'queryDb',
                            patientPortal2FaCodeQuery(
                                patientPortalEnvironment.username,
                            ),
                        ).then((twoFaCodes: any) => {
                            const code: string = twoFaCodes[0].code;

                            cy.request({
                                method: 'POST',
                                form: true,
                                url: `${patientPortalEnvironment.baseUrl}/2fa/verify`,
                                body: {
                                    _token: csrfToken,
                                    deliveryAddressMsg: deliveryMessage,
                                    code,
                                    'remember-device': 1,
                                },
                            }).then((response) => {
                                const responseHTML = load(response.body);
                                const dataUserHash = responseHTML(
                                    'div[id="firstTimeModal"]',
                                ).attr('data-user-hash');
                                const currentDate = new Date();

                                cy.visit(
                                    `${patientPortalEnvironment.baseUrl}/home`,
                                    {
                                        onBeforeLoad(win: Cypress.AUTWindow) {
                                            win.localStorage.setItem(
                                                `@wrshealth/firstVisit/${dataUserHash}`,
                                                `${currentDate}`,
                                            );
                                        },
                                    },
                                );
                            });
                        });
                    });
                });
            });
        },
        { cacheAcrossSpecs: true },
    );
};

// this function create a session for Wrs Health Training practice with Bailey Miranda as healthcare provider
const loginPractice = (sessionId: string) => {
    cy.session(
        sessionId,
        () => {
            cy.request({
                method: 'GET',
                url: 'https://authehr.app.wrs.dev/ehrlogin',
                headers: {
                    Referer: 'https://ehr.wrs.dev/',
                },
                qs: {
                    response_type: 'code',
                    client_id: 'ehr_user_dev',
                    redirect_uri:
                        'https://ehr.wrs.dev/practice_new/login-authehr.wrs',
                },
            }).then((response) => {
                const responseHTML = load(response.body);
                const csrfToken: string = responseHTML(
                    '[name="_csrf_token"]',
                ).attr('value');

                cy.request({
                    method: 'POST',
                    url: 'https://authehr.app.wrs.dev/login',
                    form: true,
                    headers: {
                        cookie: response.requestHeaders.cookie,
                    },
                    body: {
                        _csrf_token: csrfToken,
                        username: ehrEnvironment.username,
                        password: ehrEnvironment.password,
                    },
                }).then((response) => {
                    const responseHTML = load(response.body);
                    const csrfToken: string = responseHTML(
                        '[name="_csrf_token"]',
                    ).attr('value');

                    cy.request({
                        method: 'POST',
                        url: 'https://authehr.app.wrs.dev/2fa/send',
                        form: true,
                        body: {
                            _csrf_token: csrfToken,
                            'otp-type': 'email',
                        },
                    }).then((response) => {
                        const responseHTML = load(response.body);
                        const csrfToken: string = responseHTML(
                            '[name="_csrf_token"]',
                        ).attr('value');

                        cy.task('queryDb', practice2FaCodeQuery(14318)).then(
                            (twoFaCodes: any) => {
                                const authCode: string = twoFaCodes[0].code;
                                cy.request({
                                    method: 'POST',
                                    url: 'https://authehr.app.wrs.dev/2fa/verify',
                                    form: true,
                                    body: {
                                        _csrf_token: csrfToken,
                                        code: authCode,
                                    },
                                }).then(() => {
                                    cy.request({
                                        method: 'POST',
                                        url: 'https://ehr.wrs.dev/practice_new/SelectLoginLocation.wrs',
                                        form: true,
                                        body: {
                                            loginLocation: 1692559,
                                        },
                                    });
                                });
                            },
                        );
                    });
                });
            });
        },
        { cacheAcrossSpecs: true },
    );
};

const authEhrLogin = (
    appName: string,
    practiceId?: number,
    patientId?: number,
    userId?: number,
) => {
    authEhrPayload(appName, practiceId, patientId, userId).then(
        ({ path, payload }: Record<string, any>) => {
            const generateToken = () => {
                const endpoint = `https://authehr.app.wrs.dev/${path}`;
                return cy
                    .request({
                        url: endpoint,
                        method: 'POST',
                        followRedirect: false,
                        form: true,
                        body: payload,
                    })
                    .its('body', { log: false });
            };
            const login = () => {
                const existingToken = tokens[payload.client_id];

                return tokenIsValid(existingToken)
                    ? {
                          then: (callback: any) =>
                              callback(tokens[payload.client_id]),
                      }
                    : generateToken().then((response) => {
                          const { access_token, expires_in } = response;
                          expiration = expires_in;
                          tokens[payload.client_id] = access_token;
                          return access_token;
                      });
            };
            return login();
        },
    );
};

const tokenIsValid = (token: string) => {
    if (!token) return false;
    const now = Math.floor(Date.now() / 1000);
    return expiration > now + REFRESH_TOKEN_SAFETY;
};

const getByTestId = (id: string) =>
    cy.get(`[data-testid="${id}"]`, { timeout: 15000 });

const interceptRequest = (
    method: Method = 'GET',
    url: RouteMatcher,
    response?: RouteHandler,
) => {
    cy.intercept(method, url, response);
};

const navigationSelect = (dropdownName: string, optionName: string) => {
    cy.get('#wrs-collapse-1')
        .find('a.clickity')
        .contains(dropdownName)
        .then(($dropdown) => {
            if ($dropdown.length === 1) {
                // Trigger a click event on the dropdown to open it
                cy.wrap($dropdown).click();

                // Find the option within the dropdown and click it
                cy.wrap($dropdown)
                    .next('ul.dropdown-menu')
                    .find('li a.clickity')
                    .contains(optionName)
                    .click();
            } else {
                console.error(`Dropdown ${dropdownName} not found.`);
            }
        });
};

const getById = (id: string) => cy.get(`#${id}`, { timeout: 15000 });

const getSearchedPatient = () => {
    cy.enter('#contentIframe').then((getIframeBody) => {
        getIframeBody()
            .find('[name="form1"]')
            .find('.panel-body')
            .eq(0)
            .find('tbody tr:first');
    });
};

const selectContextMenu = (option: string, isIframe: boolean) => {
    // the cypress fails with uncaught:exception on visiting generated url by the script. Let's blind the Cypress
    Cypress.on('uncaught:exception', () => false);
    isIframe
        ? cy.enter('#contentIframe').then((getIframeBody) => {
              getIframeBody()
                  .find('#rightClick')
                  .find('#rightMenu li')
                  .contains('a', option)
                  .parent()
                  .then(() => {
                      cy.window()
                          .its('checkPatientPolicies')
                          .then((checkPatientPolicies) => {
                              // to refactor this sh*t asap
                              checkPatientPolicies(
                                  2680580,
                                  `goTo('../EMR/${contextMenuOptions[option]}.php?checkPatientPolicy=0&patientID=2680580',0);setLastVisited('EMR',0);setTopMenuSelection(20,'');`,
                              );
                          });
                  })
                  .wait(2500);
          })
        : cy
              .get('#rightClick')
              .find('#rightMenu li')
              .contains('a', option)
              .parent()
              .then(() => {
                  cy.window()
                      .its('checkPatientPolicies')
                      .then((checkPatientPolicies) => {
                          // to refactor this sh*t asap
                          checkPatientPolicies(
                              2680580,
                              `goTo('../EMR/${contextMenuOptions[option]}.php?checkPatientPolicy=0&patientID=2680580',0);setLastVisited('EMR',0);setTopMenuSelection(20,'');`,
                          );
                      });
              })
              .wait(2500);
};

const sidePanel = (panelName: string) => {
    return cy
        .get('#sidePanel')
        .find('.panel')
        .eq(1)
        .contains(panelName)
        .parent()
        .parent();
};

const getRecentPatient = (patientName: string) => {
    cy.sidePanel('Recently Viewed Patients')
        .find('#divPatientListBoxContent')
        .find(`[patientname="${patientName.toUpperCase()}"]`)
        .trigger('contextmenu');
};

const waitForRequest = (aliases: Array<string>) => {
    cy.wait(aliases);
};

const getByLabel = (input: string) => {
    return cy.contains('label', input).then((label) => {
        // Use the label to find the associated input element
        const input = label?.next('input');
        cy.wrap(input);
    });
};

Cypress.Commands.addAll({
    loginPatient,
    loginPractice,
    authEhrLogin,
    getByTestId,
    interceptRequest,
    navigationSelect,
    getById,
    selectContextMenu,
    waitForRequest,
    getByLabel,
    sidePanel,
    getRecentPatient,
    getSearchedPatient,
});
