import { oAuth2Client } from '../support/utils/sql-utils';
import { extractServiceName, getEnv } from '../support/utils/test-utils';

type RecordType = Record<string, any>;
const remainders = {};

const communicationPayload = {};

function createMedicationPayload(rmiId?: number) {
    return rmiId
        ? {"if is true": true}
        : {};
}

const authEhrPayload = (
    service: string,
    practiceId?: number,
    patientId?: number,
    userId?: number,
) => {
    let userData: Record<string, any> = {};

    if (practiceId) userData.practice_id = getEnv('practice_id', practiceId);
    if (patientId) userData.patient_id = getEnv('patient_id', patientId);
    if (userId) userData.user_id = getEnv('user_id', userId);
    const defaultData =
        extractServiceName(service) === 'communication'
            ? { path: 'token', payload: { client_id: 'aws_communication' } }
            : {
                  path: 'client_token',
                  payload: {
                      client_id: 'some_client_id',
                      ...userData,
                  },
              };

    return cy
        .task('queryDb', oAuth2Client(defaultData.payload.client_id))
        .then((result: any) => {
            const [firstResult] = result;
            return {
                path: defaultData.path,
                payload: {
                    client_secret: firstResult['secret'],
                    grant_type: firstResult['grants'],
                    ...defaultData.payload,
                },
            } as RecordType;
        });
};
const createPrescriptionPayload = (noteId: string, medicationId: number) => {
    return noteId
        ? {"some_valid_payload": {}}
        : {};
};
const updatePrescriptionPayload = (medicationId: number) => {
    return medicationId
        ? {"valid_payload": {}}
        : {};
};

const responseHandler = (
    response: string,
    prescriptionId?: string,
    practiceId?: string,
    patientId?: string,
    medicationId?: string,
) => {
    const regexExp = new RegExp('[0-9\\p{P}\\p{S}\\s]|s(?=$)', 'gu');
    switch (response.toLowerCase().replace(regexExp, '')) {
        case 'prescription':
        case 'getprescription':
            return prescriptionsResponse(
                prescriptionId,
                practiceId,
                patientId,
                medicationId,
            );
        default:
            throw Error(`There is no such response defined ${response}`);
    }
};

const prescriptionsResponse = (
    prescriptionId?: string,
    practiceId?: string,
    patientId?: string,
    medicationId?: string,
) => {
    return {};
};

const parsedPayload = (payload: string) => {
    if (payload.startsWith(`'`)) {
        return payload;
    } else if (payload.includes('{}')) {
        return {};
    } else if (payload.includes('[]')) {
        return [];
    } else {
        return JSON.parse(payload);
    }
};

const pageUrls = {};

const payload = (
    payloadName: string,
    {
        noteId,
        medicationId,
        rmiId,
    }: {
        noteId?: string;
        medicationId?: number;
        rmiId?: number;
    },
) => {
    switch (payloadName) {
        case 'createPrescriptionPayload':
            return createPrescriptionPayload(noteId, medicationId);
        case 'createMedicationPayload':
            return createMedicationPayload(rmiId);
        case 'updatePrescriptionPayload':
            return updatePrescriptionPayload(medicationId);
        case 'archiveMedicationPayload':
            return archiveMedicationPayload(medicationId);
        case 'unArchiveMedicationPayload':
            return unArchiveMedicationPayload(medicationId);
        default:
            return {};
    }
};

function archiveMedicationPayload(medicationId: number) {
    return {};
}

function unArchiveMedicationPayload(medicationId: number) {
    return {};
}

export {
    remainders,
    communicationPayload,
    authEhrPayload,
    payload,
    responseHandler,
    parsedPayload,
    pageUrls,
};
