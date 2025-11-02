const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// PayPal payment processing
router.post('/paypal/create-payment', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ error: 'Order already paid' });
    }
    
    // Create PayPal payment intent
    const paymentData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: order.total.toString()
        },
        description: `Order #${order._id}`,
        custom_id: order._id.toString()
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`
      }
    };
    
    // In a real implementation, you would make a call to PayPal API here
    // For now, we'll simulate the payment creation
    
    res.json({
      success: true,
      paymentId: `paypal_${Date.now()}`,
      paymentData
    });
  } catch (error) {
    console.error('PayPal payment creation error:', error);
    res.status(500).json({ error: 'Failed to create PayPal payment' });
  }
});

// PayPal payment capture
router.post('/paypal/capture-payment', verifyToken, async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // In a real implementation, you would verify the payment with PayPal API here
    // For now, we'll simulate successful payment capture
    
    // Update order payment status
    order.paymentStatus = 'completed';
    order.paymentId = paymentId;
    order.orderStatus = 'processing';
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment captured successfully',
      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        paymentId: order.paymentId
      }
    });
  } catch (error) {
    console.error('PayPal payment capture error:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

// Telebirr payment processing
router.post('/telebirr/create-payment', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ error: 'Order already paid' });
    }
    
    // Create Telebirr payment request
    const paymentData = {
      merchantId: process.env.TELEBIRR_MERCHANT_ID,
      amount: order.total,
      currency: 'ETB',
      orderId: order._id.toString(),
      description: `Order #${order._id}`,
      returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment-cancelled`
    };
    
    // In a real implementation, you would make a call to Telebirr API here
    // For now, we'll simulate the payment creation
    
    res.json({
      success: true,
      paymentId: `telebirr_${Date.now()}`,
      paymentData
    });
  } catch (error) {
    console.error('Telebirr payment creation error:', error);
    res.status(500).json({ error: 'Failed to create Telebirr payment' });
  }
});

// Telebirr payment verification
router.post('/telebirr/verify-payment', verifyToken, async (req, res) => {
  try {
    const { paymentId, orderId, transactionId } = req.body;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // In a real implementation, you would verify the payment with Telebirr API here
    // For now, we'll simulate successful payment verification
    
    // Update order payment status
    order.paymentStatus = 'completed';
    order.paymentId = transactionId;
    order.orderStatus = 'processing';
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        paymentId: order.paymentId
      }
    });
  } catch (error) {
    console.error('Telebirr payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get payment methods
router.get('/methods', (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with PayPal account or credit card',
        icon: 'fab fa-paypal',
        enabled: true
      },
      {
        id: 'telebirr',
        name: 'Telebirr',
        description: 'Pay with Telebirr mobile money',
        icon: 'fas fa-mobile-alt',
        enabled: true
      },
      {
        id: 'cash_on_delivery',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: 'fas fa-money-bill-wave',
        enabled: true
      }
    ];
    
    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Payment webhook (for production use)
router.post('/webhook/paypal', (req, res) => {
  try {
    // In production, verify the webhook signature from PayPal
    const { event_type, resource } = req.body;
    
    if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      // Handle successful payment
      console.log('PayPal payment completed:', resource.id);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Payment webhook (for production use)
router.post('/webhook/telebirr', (req, res) => {
  try {
    // In production, verify the webhook signature from Telebirr
    const { status, orderId, transactionId } = req.body;
    
    if (status === 'SUCCESS') {
      // Handle successful payment
      console.log('Telebirr payment completed:', transactionId);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Telebirr webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
