import {
    extractKeyword,
    extractValues,
    findPropertyValueLength,
    findValueInJson,
    hasProperty,
} from './test-utils';

const checkPayload = (
    expectedData: string,
    actualData: Record<string, any>,
) => {
    if (![null, ''].includes(expectedData)) {
        switch (extractKeyword(expectedData)) {
            case 'length':
                const { field, value } = Object(extractValues(expectedData));
                expect(
                    findPropertyValueLength(actualData, field),
                    `${findPropertyValueLength(actualData, field)} length`,
                ).to.equal(value);
                break;
            case 'property':
                const propertyName = extractValues(expectedData).toString();
                expect(
                    hasProperty(actualData, propertyName),
                    `body have "${propertyName}" field`,
                ).true;
                break;
            case 'json':
                expect(actualData.body).to.deep.equal(
                    JSON.parse(expectedData.replace(/'/g, '"')),
                );
                break;
            case null:
                ['true', 'false'].includes(expectedData.toLowerCase())
                    ? expectedData.toLowerCase() == 'true'
                        ? expect(expectedData.toLowerCase(), 'value').to.equal(
                              'true',
                          )
                        : expect(expectedData.toLowerCase(), 'value').to.equal(
                              'false',
                          )
                    : expect(
                          findValueInJson(actualData, expectedData),
                          `"${expectedData}" exists in payload`,
                      ).true;
                break;
            default:
                break;
        }
    }
};

const checkStatusCode = (expectedCode: string, actualCode: number) => {
    +expectedCode > 0 &&
        expect(+expectedCode, 'statusCode').to.equal(actualCode);
};

export { checkPayload, checkStatusCode };
