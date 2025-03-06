const Inventory = require('../models/Inventory');

const checkStockAvailability = async (items) => {
    for (let item of items) {
        const product = await Inventory.findOne({ productId: item.productId });

        if (!product) {
            return { success: false, message: `Product ${item.name} not found` };
        }

        if (product.stock < item.quantity) {
            return { success: false, message: `${item.name} is Out of Stock. Please check back later!` };
        }
    }
    return { success: true };
};

const updateStockAfterOrder = async (items) => {
    for (let item of items) {
        await Inventory.updateOne(
            { productId: item.productId },
            { $inc: { stock: -item.quantity } }
        );
    }
};

module.exports = { checkStockAvailability, updateStockAfterOrder };
