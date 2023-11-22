const patientPortal2FaCodeQuery = (email: string) => {};
const practice2FaCodeQuery = (practiceId: number) => {};

const messageID = (id: string) => {};

const activateMedication = (patientId: number, medicationId: number) => {};

const deactivateMedication = (patientId: number, medicationId: number) => {};

const addPharmacy = (userId: number, pharmacyId: number) => {};

const removePharmacy = (userId: number, pharmacyId: number) => {}

const oAuth2Client = (clientId: string) => {}

const deleteAllNotes = (patientId: number) => {}

export {
    patientPortal2FaCodeQuery,
    practice2FaCodeQuery,
    messageID,
    activateMedication,
    deactivateMedication,
    addPharmacy,
    removePharmacy,
    oAuth2Client,
    deleteAllNotes,
};
