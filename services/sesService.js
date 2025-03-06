const { ses } = require('../config/awsConfig');

const sendOrderEmail = async (userEmail, order) => {
    const orderDetails = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');

    const params = {
        Source: process.env.AWS_SES_EMAIL,
        Destination: {
            ToAddresses: [userEmail]
        },
        Message: {
            Subject: {
                Data: `Order Confirmation - Order #${order.orderId}`
            },
            Body: {
                Text: {
                    Data: `Thank you for your purchase!\n\nOrder ID: ${order.orderId}\nItems: ${orderDetails}\nStatus: ${order.status}`
                },
                Html: {
                    Data: `
                        <h2>Order Confirmation</h2>
                        <p><b>Order ID:</b> ${order.orderId}</p>
                        <p><b>Items:</b> ${orderDetails}</p>
                        <p><b>Status:</b> ${order.status}</p>
                        <p>Thank you for shopping with us!</p>
                    `
                }
            }
        }
    };

    try {
        await ses.sendEmail(params).promise();
        console.log(`Email sent to ${userEmail} for Order #${order.orderId}`);
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
    }
};

module.exports = { sendOrderEmail };
