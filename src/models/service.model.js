const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 30
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'orthodontics', 'surgery', 'cosmetic', 'pediatric', 'other']
  },
  active: {
    type: Boolean,
    default: true
  },
  requiredEquipment: [{
    type: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema); 