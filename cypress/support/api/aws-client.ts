// @ts-ignore
import AWS from 'aws-sdk';

let token: string;
let baseUrl: string;

async function initializeAwsClient() {
    const awsEnv = Cypress.env('aws');
    AWS.config.accessKeyId = awsEnv['accessKeyId'];
    AWS.config.secretAccessKey = awsEnv['secretAccessKey'];
    AWS.config.region = awsEnv['region'];
    try {
        baseUrl = await getAwsBaseUrl();
    } catch (err) {
        console.error('Error initializing AWS base URL:', err);
    }
}

async function getAwsBaseUrl() {
    const apiGateway = new AWS.APIGateway();

    return new Promise<string>((resolve, reject) => {
        apiGateway.getRestApis(
            {},
            (err: any, data: { items: string | any[] }) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (data.items.length === 0) {
                    reject(new Error('No Base Url defined!'));
                    return;
                }

                const awsEndpoint = data.items[0].id;
                const baseUrl = `https://${awsEndpoint}.execute-api.us-east-1.amazonaws.com`;
                resolve(baseUrl);
            },
        );
    });
}

function login() {
    cy.authEhrLogin('communication').then(
        (accessToken: string) => (token = accessToken),
    );
}

function sendRequest(
    httpMethod: string,
    url: string,
    data?: Record<string, any>,
    failOnStatusCode?: boolean,
) {
    if (!baseUrl) {
        console.error('AWS base URL is not available.');
        return;
    }
    const payload = ['GET', 'DELETE'].includes(httpMethod.toUpperCase())
        ? undefined
        : data;
    return cy.request({
        method: httpMethod,
        url: `${baseUrl}${url}`,
        followRedirect: false,
        failOnStatusCode,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            Connection: 'keep-alive',
        },
        body: payload,
    });
}

async function initialize() {
    await initializeAwsClient();
}

export { initialize, login, sendRequest };
