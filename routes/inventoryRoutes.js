const express = require('express');
const Inventory = require('../models/Inventory');
const router = express.Router();

router.get('/', async (req, res) => {
    const inventory = await Inventory.find();
    
    if (inventory.length === 0) {
        return res.status(404).json({ message: "No Product Found" });
    }

    res.json(inventory);
});

router.post('/add', async (req, res) => {
    const { productId, name, price, stock } = req.body;

    const existingProduct = await Inventory.findOne({ productId });
    if (existingProduct) {
        return res.status(400).json({ message: "Product already exists" });
    }

    const newProduct = new Inventory({ productId, name, price, stock });
    await newProduct.save();

    res.status(201).json({ message: "Product added to inventory", newProduct });
});


router.put('/update/:productId', async (req, res) => {
    const { productId } = req.params;
    const { name, price, stock } = req.body;

    try {
        const updatedProduct = await Inventory.findOneAndUpdate(
            { productId },
            { name, price, stock },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
});


module.exports = router;
