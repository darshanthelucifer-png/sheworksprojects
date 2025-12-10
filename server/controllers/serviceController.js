const Service = require('../models/service');
const User = require('../models/user');

// ---------------- Helper: normalize subservices ----------------
const normalizeSubs = (body) => {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return body.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

// ---------------- CREATE SERVICE (Provider Profile) ----------------
exports.createService = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      service,
      subservices,
      description,
      price,
      location,
    } = req.body;

    if (!service)
      return res.status(400).json({ message: 'Service title required' });

    const providerId = req.user?.id;
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res
        .status(403)
        .json({ message: 'Only providers can create services' });
    }

    // Prevent multiple profiles per provider
    const existingService = await Service.findOne({ provider: provider._id });
    if (existingService) {
      return res
        .status(400)
        .json({ message: 'Profile already exists. Please edit instead.' });
    }

    const subs = normalizeSubs(
      subservices || req.body['subservices[]'] || req.body['subservices']
    );

    // Store all uploaded files as portfolio images
    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

    // ✅ Save first uploaded image as provider profileImage
    if (images.length > 0) {
      provider.profileImage = images[0];
      await provider.save();
    }

    const newService = new Service({
      title: service,
      subservices: subs,
      description,
      price: price ? Number(price) : undefined,
      location,
      provider: provider._id,
      providerName: name || provider.name,
      providerEmail: email || provider.email,
      providerContact: contact || '',
      images, // ✅ portfolio images
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    console.error('createService error', err);
    res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
};

// ---------------- UPDATE SERVICE (Edit Profile / Upload Work) ----------------
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Authorization check
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update editable fields
    const {
      name,
      email,
      contact,
      service: serviceTitle,
      subservices,
      description,
      price,
      location,
    } = req.body;

    if (serviceTitle) service.title = serviceTitle;
    if (description) service.description = description;
    if (price) service.price = Number(price);
    if (location) service.location = location;
    if (name) service.providerName = name;
    if (email) service.providerEmail = email;
    if (contact) service.providerContact = contact;

    const subs = normalizeSubs(
      subservices || req.body['subservices[]'] || req.body['subservices']
    );
    if (subs && subs.length) service.subservices = subs;

    // Append new uploaded images (portfolio)
    if (req.files && req.files.length) {
      const uploaded = req.files.map((f) => `/uploads/${f.filename}`);
      service.images = service.images.concat(uploaded);

      // ✅ Update provider profile image if any new image uploaded
      if (uploaded.length > 0) {
        await User.findByIdAndUpdate(req.user.id, {
          profileImage: uploaded[0],
        });
      }
    }

    await service.save();
    res.json(service);
  } catch (err) {
    console.error('updateService error', err);
    res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
};

// ---------------- GET ALL SERVICES FOR A PROVIDER ----------------
exports.getServicesByProvider = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const services = await Service.find({ provider: providerId }).populate(
      'provider',
      'name email role profileImage'
    );
    res.json(services);
  } catch (err) {
    console.error('getServicesByProvider', err);
    res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
};

// ---------------- GET SERVICE BY ID ----------------
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate(
      'provider',
      'name email role profileImage'
    );
    if (!service)
      return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error('getServiceById', err);
    res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
};

// ---------------- DELETE SERVICE ----------------
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('deleteService error', err);
    res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
};
