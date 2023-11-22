export const prescriptionIdFrom = (
    data: any,
    prescriptionIndex: number = 0,
) => {
    return Number(data.prescription[prescriptionIndex].notePrescription.id);
};
