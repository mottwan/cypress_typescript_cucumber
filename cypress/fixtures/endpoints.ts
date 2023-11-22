import { camelCase } from 'lodash';

const medicationUrls = (urlName: string, options?: Record<string, any>) => {
    const regexp = new RegExp('[0-9\\p{P}\\p{S}\\s+]', 'gu');
    const { patient_id, prescription_id, note_id } = options;
    switch (camelCase(urlName).replace(regexp, '')) {
        case 'saxs':
            return ``;
        case 'sss':
            return ``;
        case 'asjhds':
            return ``;
        case 'dsjkdsjkdsjkdsjkds':
            return ``;
        case 'sdkdskjdskjsadkjdsjksdf':
            return ``;
        case 'sdjsdjdsklaskjsd':
            return ``;
        case 'sdkjsdjksdjkds':
            return ``;
        case 'dsnsdhjkdsjhds':
            return ``;
        case 'dkjsdkjdsajhas':
            return ``;
        case 'sdjksdkjds':
            return ``;
        case 'sdlkdsjkds':
            return ``;
        case 'sdlkjkhjsadjkh':
            return ``;
        case 'sdjkhfsjsd':
            return ``;
        default:
            throw Error(`There is no such endpoint defined ${urlName}`);
    }
};

export { medicationUrls };
