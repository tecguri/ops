const { createOrder, getOrderById } = require('../services/orderService');
const redis = require("../utils/redisClient");


const createOrderController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order items cannot be empty" });
        }

        const order = await createOrder(userId, items);
        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getOrderController = async (req, res) => {
    const { id } = req.params;

    // Check if order exists in Redis cache
    const cachedOrder = await redis.get(`order:${id}`);
    if (cachedOrder) {
        console.log("Order retrieved from cache");
        return res.status(200).json(JSON.parse(cachedOrder));
    }

    try {
        const order = await getOrderById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Store in Redis for future requests
        await redis.set(`order:${id}`, JSON.stringify(order), "EX", 600);

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createOrderController, getOrderController };
