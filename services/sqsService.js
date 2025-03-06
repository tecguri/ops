const sqs = require('../config/awsConfig');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

const pushOrderToSQS = async (order) => {
    const params = {
        QueueUrl: process.env.AWS_SQS_QUEUE_URL,
        MessageBody: JSON.stringify(order)
    };

    try {
        const command = new SendMessageCommand(params);
        const response = await sqsClient.send(command);
        
        console.log(`Order ${order.orderId} pushed to SQS`);
    } catch (error) {
        console.error(`Error pushing order to SQS: ${error.message}`);
    }
};

module.exports = { pushOrderToSQS };
