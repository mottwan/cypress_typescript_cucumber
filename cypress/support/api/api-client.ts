import { updatedHeaders } from '../utils/test-utils';

let token: string = null;
let serviceName: string;
type RecordType = Record<string, any>;
type PayloadType = RecordType | string | Array<any>;

export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS';

export type SendRequestType = (
    httpMethod: HttpMethod,
    url: string,
    data?: PayloadType,
    accessToken?: string,
) => Cypress.Chainable;

type RequestData = {
    method: HttpMethod;
    url: string;
    body?: PayloadType;
    failOnStatusCode?: boolean;
};

const sendRequest: SendRequestType = (
    httpMethod: HttpMethod,
    url: string,
    data?: PayloadType,
    accessToken?: string,
) => {
    const tokenAccess: string = accessToken ? accessToken : token;
    const { baseUrl, headers } = Cypress.env(serviceName);
    const payload: PayloadType = ['GET', 'DELETE'].includes(
        httpMethod.toUpperCase(),
    )
        ? undefined
        : data;
    return cy.request({
        method: httpMethod,
        url: `${baseUrl}/${url}`,
        failOnStatusCode: false,
        headers: updatedHeaders(headers, tokenAccess),
        body: payload,
        timeout: 50000,
    });
};

type ApiClientDataType = {
    token: string;
    appUrl: string;
};

export type ApiClient = {
    get: (
        path: string,
        data?: RecordType,
        failOnStatusCode?: boolean,
    ) => ReturnType<typeof cy.request>;
    post: (
        path: string,
        data?: RecordType,
        failOnStatusCode?: boolean,
    ) => ReturnType<typeof cy.request>;
    patch: (
        path: string,
        data: RecordType,
        failOnStatusCode?: boolean,
    ) => ReturnType<typeof cy.request>;
    put: (
        path: string,
        data: RecordType,
        failOnStatusCode?: boolean,
    ) => ReturnType<typeof cy.request>;
    delete: (
        path: string,
        data?: RecordType,
        failOnStatusCode?: boolean,
    ) => ReturnType<typeof cy.request>;
};

const initialize = (appName: string, accessToken: string) => {
    serviceName = appName;
    if (!!accessToken) token = accessToken;
};

const login = (
    appName: string,
    practiceId?: number,
    patientId?: number,
    userId?: number,
) =>
    cy
        .authEhrLogin(appName, practiceId, patientId, userId)
        .then((accessToken: string) => (token = accessToken));

const apiClient = (credentials: ApiClientDataType): ApiClient => {
    const { token, appUrl } = credentials;

    const request = (requestData: RequestData) =>
        cy.request({
            auth: { bearer: token },
            headers: {
                'X-AuthEhr-Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            ...requestData,
        });

    const operations = (baseUrl: string): ApiClient => {
        return {
            get: (
                path: string,
                data?: RecordType,
                failOnStatusCode?: boolean,
            ) =>
                request({
                    method: 'GET',
                    url: `${baseUrl}/${path}`,
                    body: data && undefined,
                    failOnStatusCode,
                }),
            post: (
                path: string,
                data?: RecordType,
                failOnStatusCode?: boolean,
            ) =>
                request({
                    method: 'POST',
                    url: `${baseUrl}/${path}`,
                    body: data,
                    failOnStatusCode,
                }),
            patch: (
                path: string,
                data: RecordType,
                failOnStatusCode?: boolean,
            ) =>
                request({
                    method: 'PATCH',
                    url: `${baseUrl}/${path}`,
                    body: data,
                    failOnStatusCode,
                }),
            put: (path: string, data: RecordType, failOnStatusCode?: boolean) =>
                request({
                    method: 'PUT',
                    url: `${baseUrl}/${path}`,
                    body: data,
                    failOnStatusCode,
                }),
            delete: (
                path: string,
                data?: RecordType,
                failOnStatusCode?: boolean,
            ) =>
                request({
                    method: 'DELETE',
                    url: `${baseUrl}/${path}`,
                    body: data && undefined,
                    failOnStatusCode,
                }),
        };
    };

    return { ...operations(appUrl) };
};

export { initialize, login, apiClient, sendRequest };
