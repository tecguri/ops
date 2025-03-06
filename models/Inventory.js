const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 10 },
    stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
