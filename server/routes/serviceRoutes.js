const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const serviceController = require('../controllers/serviceController');
const categories = require('../data/categories');
const Service = require('../models/service');
const User = require('../models/user');
const mongoose = require('mongoose');

// ----------------- Service Routes -----------------

// Create new service (Provider)
router.post('/', protect, upload.array('images', 6), serviceController.createService);

// Update existing service
router.put('/:id', protect, upload.array('images', 6), serviceController.updateService);

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('provider', 'name email location profileImage');
    res.json(services);
  } catch (err) {
    console.error('Get all services error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get service categories
router.get('/categories', (req, res) => {
  res.json(categories);
});

// Get services by category & subservice
router.get('/category/:category/subservice/:subservice', async (req, res) => {
  try {
    const { category, subservice } = req.params;
    const categoryRegex = new RegExp(category, 'i');
    const subRegex = new RegExp(subservice, 'i');

    // Match subservices whether stored as array or as a single string
    const services = await Service.find({
      title: categoryRegex,
      $or: [
        { subservices: { $in: [subRegex] } }, // when subservices is array
        { subservices: { $regex: subRegex } }, // when subservices is string
      ],
    }).populate('provider', 'name email location profileImage');
    res.json(services);
  } catch (err) {
    console.error('Get services by category/subservice error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all services for a provider
router.get('/provider/:providerId', serviceController.getServicesByProvider);

// ----------------- DEV: Seed DB with example providers/services -----------------
// NOTE: Development helper only. Remove or protect in production.
router.get('/seed/dev-populate', async (req, res) => {
  try {
    const created = [];

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const providerEmail = `provider_${i + 1}@example.com`;

      // create or find provider user
      let provider = await User.findOne({ email: providerEmail });
      if (!provider) {
        provider = new User({
          name: `Provider ${i + 1}`,
          email: providerEmail,
          password: `password${i + 1}`,
          role: 'provider',
        });
        await provider.save();
      }

      // create one service for this category using first subservice
      const firstSub = (cat.subservices && cat.subservices[0]) || 'General';

      // Avoid duplicate identical services
      const exists = await Service.findOne({ provider: provider._id, title: cat.category });
      if (exists) {
        created.push({ provider: provider.email, service: exists._id, skipped: true });
        continue;
      }

      const newService = new Service({
        title: cat.category,
        subservices: [firstSub],
        description: `Sample ${cat.category} provider offering ${firstSub}`,
        price: 100 + i * 50,
        location: 'Demo City',
        provider: provider._id,
        providerName: provider.name,
        providerEmail: provider.email,
        providerContact: '9999999999',
        images: [],
      });

      await newService.save();
      created.push({ provider: provider.email, service: newService._id });
    }

    res.json({ ok: true, created });
  } catch (err) {
    console.error('seed error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get single service by ID
router.get('/:id', serviceController.getServiceById);

// Delete a service
router.delete('/:id', protect, serviceController.deleteService);

module.exports = router;
