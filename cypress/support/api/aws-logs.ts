// @ts-ignore
import AWS from 'aws-sdk';

async function initializeAwsLogsClient() {
    const awsEnv = Cypress.env('aws-sandbox');
    AWS.config.accessKeyId = awsEnv['accessKeyId'];
    AWS.config.secretAccessKey = awsEnv['secretAccessKey'];
    AWS.config.region = awsEnv['region'];
    AWS.config.sessionToken = awsEnv['sessionToken'];
}

async function runLogsInsightsQuery(
    queryString,
    logGroupName,
    startTime,
    endTime,
) {
    const cloudWatchLogs = new AWS.cloudWatchLogs();

    try {
        const params = {
            logGroupName: logGroupName,
            startTime: startTime, // Unix timestamp in milliseconds
            endTime: endTime, // Unix timestamp in milliseconds
            query: queryString,
        };

        const queryResponse = await cloudWatchLogs.startQuery(params).promise();

        // Get the query ID from the response
        const queryId = queryResponse.queryId;

        // Wait for the query to complete
        const waitForQueryResponse = async () => {
            const queryStatusResponse = await cloudWatchLogs
                .getQueryResults({ queryId: queryId })
                .promise();
            if (queryStatusResponse.status === 'Complete') {
                return queryStatusResponse.results;
            } else if (
                queryStatusResponse.status === 'Running' ||
                queryStatusResponse.status === 'Scheduled'
            ) {
                // The query is still running, wait for a while and then check again
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return waitForQueryResponse();
            } else {
                // The query has failed or been canceled
                throw new Error(
                    `Query failed with status: ${queryStatusResponse.status}`,
                );
            }
        };

        // Wait for the query to complete and return the results
        return await waitForQueryResponse();
    } catch (error) {
        console.error('Error running CloudWatch Logs Insights query:', error);
        throw error;
    }
}

const getLogEvents = async () => {
    const cloudWatchLogs = new AWS.cloudWatchLogs();

    const logEmailDispatcherEvents =
        '/aws/lambda/communication-trunk-EmailDispatcherFunction-pnQ70gUWrLAY';

    const params = {
        logEmailDispatcherEvents,
        orderBy: 'LastEventTime',
        descending: true,
        limit: 1,
    };

    try {
        const describeLogStreamsData = await cloudWatchLogs
            .describeLogStreams(params)
            .promise();
        const latestLogStreamName =
            describeLogStreamsData.logStreams[0].logStreamName;

        const getLogEventsParams = {
            logEmailDispatcherEvents,
            logStreamName: latestLogStreamName,
            startFromHead: true,
        };

        const getLogEventsData = await cloudWatchLogs
            .getLogEvents(getLogEventsParams)
            .promise();
        const emailToBeSentLogEvent = getLogEventsData.events.find((event) =>
            event.message.includes('Email to be sent'),
        );

        if (emailToBeSentLogEvent) {
            return emailToBeSentLogEvent.message;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

export { initializeAwsLogsClient, getLogEvents, runLogsInsightsQuery };
