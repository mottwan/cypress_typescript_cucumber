const util = require('util');
const cypress = require('cypress');
const chalk = require('chalk');
const { program } = require('commander');
const { readFileSync, writeFileSync } = require('fs');
const exec = util.promisify(require('child_process').exec);
const { join, resolve } = require('path');

const parentDir = resolve(__dirname, '..');
// Define the path for the cypress environment file
const cypressEnvFilePath = join(parentDir, 'cypress.env.json');

program
    .storeOptionsAsProperties(true)
    .option('-s, --spec <path>', 'Spec file(s) to run', '**/*')
    .option('--service <service>', 'Service name')
    .parse(process.argv);

const programOptions = program.opts();
if (program.args.length) {
    programOptions.spec = program.args[0];
}
const getServiceBaseUrl = (serviceName) => {
    // If the service is "aws," return as the aws baseUrl is handled in the client (see aws-client.ts)
    if (serviceName === 'aws') {
        return;
    }

    // Read the Cypress environment file
    const cypressEnv = JSON.parse(readFileSync(cypressEnvFilePath, 'utf8'));

    // Check if the service name exists in the environment file
    if (cypressEnv[serviceName] && cypressEnv[serviceName].baseUrl) {
        return cypressEnv[serviceName].baseUrl;
    } else {
        console.error(
            `Service '${serviceName}' not found in the Cypress environment file.`,
        );
        process.exit(1);
    }
};

async function clearCypressReports() {
    try {
        // delete all existing report files
        await new Promise((resolve, reject) => {
            exec('rm -rf cypress/reports/**', (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    } catch (error) {
        console.error('Error while removing existing report files:', error);
        process.exit(1);
    }
    console.log('Successfully removed all existing report files.');
}
async function mergeJunitReports(results) {
    const { totalTests, totalPassed, totalPending, totalFailed, totalSkipped } =
        results;
    const stats = [
        ['totalTests', totalTests],
        ['totalPassed', totalPassed],
        ['totalPending', totalPending],
        ['totalFailed', totalFailed],
        ['totalSkipped', totalSkipped],
    ];
    console.table(stats);
    try {
        await new Promise(async (resolve, reject) => {
            try {
                // Execute the first command: npm run report:merge:junit
                const { stdout, stderr } = await exec(
                    'npm run report:merge:junit',
                );
                console.log('Merge junit report stdout:', stdout);
                console.error('Merge junit report stderr:', stderr);

                // Execute the second command: npm run report:merge:mochawesome
                const { stdout: mochawesomeStdout, stderr: mochawesomeStderr } =
                    await exec('npm run postcy:run');
                console.log(
                    'Merge mochawesome report stdout:',
                    mochawesomeStdout,
                );
                console.error(
                    'Merge mochawesome report stderr:',
                    mochawesomeStderr,
                );

                resolve();
            } catch (error) {
                reject(error);
            }
        });
        console.log('Successfully merged junit and mochawesome report files.');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

const runCypress = async (config) => {
    await clearCypressReports();
    config.baseUrl = getServiceBaseUrl(program.service);

    const reporterConfig = JSON.parse(
        readFileSync('cypress-reporter-config.json', 'utf-8'),
    );

    // Append the custom report title to the mochawesomeReporterOptions object
    reporterConfig.mochawesomeReporterOptions = {
        ...reporterConfig.mochawesomeReporterOptions,
        reportTitle: `Test report for ${program.service.toUpperCase()} service`,
    };

    // Write the modified configuration back to the file
    writeFileSync(
        'cypress-reporter-config.json',
        JSON.stringify(reporterConfig, null, 2),
    );

    // return the JSON result from cypress.run, the process exit code will be the number of failed tests
    // await mergeJunitReports();

    const results = await cypress.run({
        config,
        reporter: 'cypress-multi-reporters',
        reporterOptions: {
            configFile: 'cypress-reporter-config.json',
        },
        browser: 'electron',
        ...programOptions,
    });

    await mergeJunitReports(results);
    console.log(
        'XML report is saved to',
        chalk.bold.green('cypress/reports/junit'),
    );

    return results;
};

(async () => {
    const config = JSON.parse(
        readFileSync(join(parentDir, 'cypress.config.json'), 'utf8'),
    );
    const result = await runCypress(config);
    if ('status' in result) {
        console.log(
            'Cypress is finished with',
            result.totalFailed,
            'failing tests. Now exiting.',
        );

        process.exit(Math.min(result.totalFailed, 255));
    }
})();
