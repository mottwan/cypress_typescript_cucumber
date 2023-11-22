import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import browserify from '@badeball/cypress-cucumber-preprocessor/browserify';
import { sqlClient } from './cypress/support/utils/sql-client';
import { defineConfig } from 'cypress';
import { join, resolve } from 'path';
import { readFileSync } from 'fs';

const cypressConfig = JSON.parse(
    readFileSync(join(resolve(__dirname, '.'), 'cypress.config.json'), 'utf8'),
);

export default defineConfig({
    ...cypressConfig,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'cypress-reporter-config.json',
    },
    browser: 'electron',
    e2e: {
        chromeWebSecurity: false,
        experimentalFetchPolyfill: true,
        trashAssetsBeforeRuns: true,
        retries: {
            runMode: 2,
        },
        specPattern: ['cypress/**/*.{feature,features}'],
        supportFile: 'cypress/support/commands.ts',
        async setupNodeEvents(
            on: Cypress.PluginEvents,
            config: Cypress.PluginConfigOptions,
        ): Promise<Cypress.PluginConfigOptions> {
            await addCucumberPreprocessorPlugin(on, config);
            on(
                'file:preprocessor',
                browserify(config, {
                    typescript: require.resolve('typescript'),
                }),
            );
            on('task', {
                queryDb: (query) => sqlClient(query, config.env.db),
            });

            return config;
        },
    },
});
