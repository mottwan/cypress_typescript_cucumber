#!/usr/bin/env node

const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const path = require('path');
const fs = require('fs');

const rawData = fs.readFileSync('cypress.env.json');
const { url, token, org, bucket } = JSON.parse(rawData.toString())['influx'];
const client = new InfluxDB({ url: url, token: token });
const writeApi = client.getWriteApi(org, bucket);

function getMochawesomeReportFileContent(fileName) {
    const result = JSON.parse(
        fs.readFileSync(path.join(__dirname, fileName), 'utf8'),
    );
    const {
        suites,
        tests,
        passes,
        pending,
        failures,
        passPercent,
        pendingPercent,
        skipped,
        duration,
    } = result['stats'];
    return {
        suites,
        tests,
        passes,
        pending,
        failures,
        passPercent,
        pendingPercent,
        skipped,
        duration,
    };
}

function publishData(data) {
    let points = [];
    Object.entries(data).forEach(([key, value]) => {
        const point = new Point('cypress_tests')
            .tag('cypress_tests', '')
            .floatField(key, value);
        points.push(point);
    });
    writeApi.writePoints(points);
    writeApi
        .close()
        .then(() => {
            console.log('Artifacts published successfully 🚀');
        })
        .catch((e) => {
            console.error(e);
            console.log('Artifacts publishing failed 🔴');
        });
}

publishData(
    getMochawesomeReportFileContent(
        '../cypress/reports/mochawesome/report.json',
    ),
);
