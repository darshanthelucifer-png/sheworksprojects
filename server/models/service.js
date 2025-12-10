// backend/models/service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },                 // main category/service (e.g., Embroidery)
  subservices: [{ type: String }],                         // array of chosen subservices
  description: { type: String },
  price: { type: Number },
  location: { type: String },

  // provider reference + snapshot fields (so profile shows name/email/contact quickly)
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerName: { type: String },
  providerEmail: { type: String },
  providerContact: { type: String },

  // uploaded image paths (stored under /uploads)
  images: [{ type: String }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);
