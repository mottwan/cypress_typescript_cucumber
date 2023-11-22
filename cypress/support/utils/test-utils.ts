import { DataTable } from '@badeball/cypress-cucumber-preprocessor';

type JsonObject = Record<string, any> | Record<string, any>[];

/**
 * Merges test data into a Map and updates it with new values based on provided data sources.
 *
 * @param dataStorage - The Map where the collected test data will be stored.
 * @param source - (Optional) A DataTable source to merge additional data.
 * @param fields - An array of objects representing key-value pairs to merge into the data.
 * @returns The updated dataStorage Map with merged data.
 *
 * @example
 * // Initialize a Map to store test data
 * const dataStorage = new Map<string, string>();
 *
 * // Define a source DataTable
 * const sourceData = new DataTable();
 * sourceData.addRows([
 *   { key: "city", value: "New York" },
 *   { key: "country", value: "USA" },
 * ]);
 *
 * // Define an array of field data
 * const fieldData = [
 *   { city: "Los Angeles" },
 *   { population: "8 million" },
 * ];
 *
 * // Call collectGivenTestDataTo to merge data
 * collectGivenTestDataTo(dataStorage, sourceData, fieldData);
 *
 * // The dataStorage Map now contains merged data:
 * // "city" -> "Los Angeles", "country" -> "USA", "population" -> "8 million"
 */
const collectGivenTestDataTo = (
    dataStorage: Map<string, string>,
    source?: DataTable,
    fields: Record<string, string>[] = [],
) => {
    // Merge all the field data together, starting with defaultUserData
    let mergedData = {
        ...{
            practice_id: Cypress.env('practice_id'),
            patient_id: Cypress.env('patient_id'),
        },
    };
    for (const fieldData of fields) {
        mergedData = { ...mergedData, ...fieldData };
    }

    // If there's a source, merge its data into mergedData
    if (source) {
        const sourceMap = dataTableToMap(source);
        for (const [key, value] of sourceMap) {
            mergedData[key] = value;
        }
    }

    // Update dataStorage with mergedData
    for (const [key, value] of Object.entries(mergedData)) {
        dataStorage.set(key, value.toString());
    }

    return dataStorage;
};

const dataTableToMap = (sourceDataTable: DataTable) => {
    const targetMap: Map<string, string> = new Map<string, string>();
    for (const data of sourceDataTable.hashes()) {
        for (const [key, value] of Object.entries(data)) {
            targetMap.set(key, value);
        }
    }
    return targetMap;
};

const fetchTestDataFrom = (
    sourceData: Map<string, string>,
    fields?: string[],
) => {
    let fieldsData: Record<string, string> = {};
    for (const [key, value] of sourceData.entries()) {
        fieldsData[key] = value;
        if (fields) {
            for (const field of fields) {
                if (key === field) fieldsData[key] = value;
            }
        }
    }
    return fieldsData;
};

const replacePlaceholders = (
    str: string,
    replacements: Record<string, string>,
) => {
    let result: string = str;
    for (let key in replacements) {
        const placeholder = `{${key}}`;
        result = result.replace(
            new RegExp(placeholder, 'g'),
            replacements[key],
        );
    }
    return result;
};

const evaluateExpressions = (str: string) => {
    const regex = /(\d+ [\+\-\*\/] \d+)/g;
    return str.replace(regex, (match) => eval(match));
};

const valueMatchesTarget = (value: any, target: string | number): boolean => {
    if (typeof value === 'string' && typeof target === 'string') {
        return value.includes(target);
    } else if (typeof value === 'number' && typeof target === 'number') {
        return value === target;
    }
    return false;
};

const findValueInJson = (
    json: JsonObject,
    targetValue: string | number,
): boolean => {
    if (Array.isArray(json)) {
        for (const item of json) {
            if (findValueInJson(item, targetValue)) {
                return true;
            }
        }
    } else if (typeof json === 'object' && json !== null) {
        for (const key in json) {
            if (valueMatchesTarget(json[key], targetValue)) {
                return true;
            }

            if (findValueInJson(json[key], targetValue)) {
                return true;
            }
        }
    } else {
        return valueMatchesTarget(json, targetValue);
    }
    return false;
};

const hasProperty = (json: JsonObject, targetProperty: string): boolean => {
    if (Array.isArray(json)) {
        // Handle arrays: iterate over each element
        for (const item of json) {
            if (hasProperty(item, targetProperty)) return true;
        }
    } else if (typeof json === 'object' && json !== null) {
        // Handle objects
        if (json.hasOwnProperty(targetProperty)) {
            return true; // Found target property
        }

        // If the current value is an object or an array, search inside it
        for (let key in json) {
            const value = json[key];
            if (typeof value === 'object' && value !== null) {
                if (hasProperty(value, targetProperty)) return true;
            }
        }
    }

    return false; // Property not found
};

const findPropertyValueLength = (
    json: JsonObject,
    targetProperty: string,
): number | undefined => {
    if (Array.isArray(json)) {
        for (const item of json) {
            const length = findPropertyValueLength(item, targetProperty);
            if (length !== undefined) {
                return length;
            }
        }
    } else if (typeof json === 'object' && json !== null) {
        for (const key in json) {
            if (key === targetProperty) {
                const value = json[key];
                return typeof value === 'string' || Array.isArray(value)
                    ? value.length
                    : undefined;
            }

            const length = findPropertyValueLength(json[key], targetProperty);
            if (length !== undefined) {
                return length;
            }
        }
    }

    return undefined;
};

const extractKeyword = (
    input: string,
): 'json' | 'length' | 'property' | null => {
    let match: RegExpMatchArray = null;
    const regex = /\b(length|property)\b/;
    if (input !== undefined && input.startsWith('{') && input.endsWith('}')) {
        return 'json';
    } else if (
        input !== undefined &&
        !input.startsWith('{') &&
        !input.endsWith('}')
    ) {
        match = input.match(regex);
        return match ? (match[0] as 'length' | 'property') : null;
    } else return null;
};

function extractValues(input: string): Record<string, any> | string | null {
    // This regex captures text, length, and hasProperty patterns
    const pattern = /length\(([^,]+),\s*([\d]+)\)|property\(([^)]+)\)/;
    const match = input.match(pattern);

    if (match) {
        // Checks if length pattern was matched
        if (match[1] && match[2]) {
            return {
                field: match[1].trim(),
                value: parseInt(match[2].trim()),
            };
        }
        // Checks if property pattern was matched
        if (match[3]) {
            return match[3].trim();
        }
    }
    return null;
}

const extractServiceName = (service: string): string => {
    const regex = new RegExp(
        'aws[0-9\\p{P}\\p{S}\\s+]*?(?=communication)',
        'iu',
    );
    return service.toLowerCase().replace(regex, '');
};

const getEnv = (envName: string, defaultValue: number | undefined) =>
    defaultValue !== Cypress.env(envName) ? defaultValue : Cypress.env(envName);

const updatedHeaders = (headers: Record<string, string>, token: string) => {
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase().includes('authorization')) {
            headers[key] = value.toString().replace('{token}', token);
        }
    }
    return headers;
};

const values = {
    first: 0,
    second: 1,
    third: 2,
    fourth: 3,
    fifth: 4,
    sixth: 5,
    seventh: 6,
    eighth: 7,
    ninth: 8,
    tenth: 9,
};

function hasPlaceholder(inputString: string): boolean {
    const regex = /'{[^']*}'/g;
    return regex.test(inputString);
}

function replacePlaceholdersIfFound(
    inputString: string,
    data: Record<string, string>,
) {
    return hasPlaceholder(inputString)
        ? replacePlaceholders(inputString, data)
        : inputString;
}

const contextMenuOptions = {};

const sidePanelSection = {};
export {
    replacePlaceholdersIfFound,
    collectGivenTestDataTo,
    fetchTestDataFrom,
    replacePlaceholders,
    evaluateExpressions,
    findPropertyValueLength,
    extractServiceName,
    findValueInJson,
    updatedHeaders,
    extractKeyword,
    hasPlaceholder,
    extractValues,
    hasProperty,
    getEnv,
    contextMenuOptions,
    values,
    sidePanelSection,
};
