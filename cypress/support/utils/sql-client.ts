// @ts-ignore
import mysql from 'mysql';

const sqlClient = (query: string, config: any) => {
    const connection = mysql.createConnection(config);
    connection.connect();
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error) reject(error);
            else {
                connection.end();
                return resolve(results);
            }
        });
    });
};

export { sqlClient };
