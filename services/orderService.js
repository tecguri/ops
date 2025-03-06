const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');
const { checkStockAvailability, updateStockAfterOrder } = require('./inventoryService');
const { pushOrderToSQS } = require('./sqsService');

const User = require('../models/User');
const { sendOrderEmail } = require('../services/sesService');

const createOrder = async (userId, items) => {

    const stockCheck = await checkStockAvailability(items);
    if (!stockCheck.success) {
        throw new Error(stockCheck.message);
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
        orderId: uuidv4(),
        userId,
        items,
        totalAmount,
        status: 'Pending'
    });

    await newOrder.save();
    await updateStockAfterOrder(items);
    await pushOrderToSQS(newOrder);

    // Fetch user email
    const user = await User.findById(userId);
    if (user) {
        await sendOrderEmail(user.email, newOrder);
    } else {
        console.error(`User not found for order ${newOrder.orderId}`);
    }


    return newOrder;
};

const getOrderById = async (orderId) => {
    return await Order.findOne({ orderId }).populate('userId', 'username email');
};

module.exports = { createOrder, getOrderById };
