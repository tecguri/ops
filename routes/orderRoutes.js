const express = require('express');
const { createOrderController, getOrderController } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, createOrderController);
router.get('/:id', verifyToken, getOrderController);

module.exports = router;

