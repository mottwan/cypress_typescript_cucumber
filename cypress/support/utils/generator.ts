import { faker, fakerEN_US } from '@faker-js/faker';

export const firstName: string = faker.person.firstName();
export const lastName: string = faker.person.lastName();
export const email: string = faker.internet.email();
export const month: string = faker.date.month();
export const randomDay: number = faker.number.int({ min: 1, max: 28 });
export const randomYear: number = faker.number.int({ min: 1949, max: 1997 });
export const address: string = faker.location.streetAddress(true);
export const zipCode: string = fakerEN_US.location.zipCode({ state: 'DE' });

const generator = {
    firstName,
    lastName,
    email,
    month,
    randomDay,
    randomYear,
    address,
    zipCode,
};

export default generator;
