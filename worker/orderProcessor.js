const mongoose = require("mongoose");
const connectDB = require("../config/db");


const sqs = require('../config/awsConfig');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderEmail } = require('../services/sesService');
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");


// Ensure MongoDB is connected before processing
(async () => {
    await connectDB();
})();


const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});


async function processOrders() {
    try {
        const params = {
            QueueUrl: process.env.AWS_SQS_QUEUE_URL,
            MaxNumberOfMessages: 1,  // Process one order at a time
            WaitTimeSeconds: 5,      // Long polling for efficiency
        };

        const command = new ReceiveMessageCommand(params);
        const response = await sqsClient.send(command);

        if (!response.Messages || response.Messages.length === 0) {
            console.log("No new orders in queue.");
            return;
        }

        const message = response.Messages[0];
        const orderData = JSON.parse(message.Body);

        // Checking MongoDB connection before processing
        if (mongoose.connection.readyState !== 1) {
            console.error("MongoDB not connected. Skipping order processing.");
            return;
        }

        // Simulate order validation
        const order = await Order.findById(orderData._id);
        if (!order) {
            console.error("Order not found.");
            return;
        }

        // Update order status
        order.status = "Processed";
        await order.save();
        console.log(`Order ${order._id} processed successfully.`);

        // Delete processed message from SQS
        const deleteParams = {
            QueueUrl: process.env.AWS_SQS_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
        };
        await sqsClient.send(new DeleteMessageCommand(deleteParams));
        console.log(`Order ${order._id} removed from SQS queue.`);

    } catch (error) {
        console.error("Error processing orders:", error);
    }
}

// Runs after every 10 seconds
setInterval(processOrders, 10000);
