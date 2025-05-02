const express = require('express');
const router = express.Router();
const Logistic = require('../models/Logistic');

// GET all logistics
router.get('/', async (req, res) => {
  try {
    const logistics = await Logistic.find();
    res.json(logistics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single logistic by ID
router.get('/:id', async (req, res) => {
  try {
    const logistic = await Logistic.findById(req.params.id);
    if (!logistic) return res.status(404).json({ message: 'Logistic not found' });
    res.json(logistic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new logistic
router.post('/', async (req, res) => {
  const logistic = new Logistic({
    shipmentId: req.body.shipmentId,
    origin: req.body.origin,
    destination: req.body.destination,
    status: req.body.status,
    estimatedDelivery: req.body.estimatedDelivery,
  });

  try {
    const newLogistic = await logistic.save();
    res.status(201).json(newLogistic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a logistic
router.put('/:id', async (req, res) => {
  try {
    const logistic = await Logistic.findById(req.params.id);
    if (!logistic) return res.status(404).json({ message: 'Logistic not found' });

    logistic.shipmentId = req.body.shipmentId || logistic.shipmentId;
    logistic.origin = req.body.origin || logistic.origin;
    logistic.destination = req.body.destination || logistic.destination;
    logistic.status = req.body.status || logistic.status;
    logistic.estimatedDelivery = req.body.estimatedDelivery || logistic.estimatedDelivery;

    const updatedLogistic = await logistic.save();
    res.json(updatedLogistic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a logistic
router.delete('/:id', async (req, res) => {
  try {
    const logistic = await Logistic.findById(req.params.id);
    if (!logistic) return res.status(404).json({ message: 'Logistic not found' });

    await logistic.remove();
    res.json({ message: 'Logistic deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;