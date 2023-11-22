import { ApiClient, apiClient } from './api-client';

function extractValueByName(arr: Array<Record<any, any>>, name: string) {
    const objByName = arr.find((obj) => obj.name === name);
    return objByName ? objByName.value : null;
}

function extractInfo(data: any, providerId: number) {
    for (const appointment of data) {
        if (appointment.provider.id === providerId) {
            const dateInfo = appointment.date;
            return {
                date: dateInfo.date,
                startTime: dateInfo.startTime,
                endTime: dateInfo.endTime,
            };
        }
    }
    return null;
}

let sessionToken: string;
export const getSessionToken = async () => {
    try {
        const sessionData = await Cypress.session.getSession('PP');
        sessionToken = extractValueByName(sessionData.cookies, 'key');
    } catch (error) {
        console.error('Error:', error);
        return;
    }
};

const createAppointment = () => {
    const api: ApiClient = apiClient({
        token: sessionToken,
        appUrl: Cypress.env('some_app_name').baseUrl,
    });

    return api
        .get('api/appointment/default')
        .its('body')
        .then((response: Record<string, any>) => {
            const { date, startTime, endTime } = extractInfo(
                response.availableTimes,
                response.providers[0].id,
            );

            return api
                .post('api/appointment/create', {
                    date,
                    startTime,
                    endTime,
                    locationId: response.locations[0].id,
                    providerId: response.providers[0].id,
                    appointmentTypeId: 4,
                })
                .its('body.appointmentId');
        });
};

export { createAppointment };
