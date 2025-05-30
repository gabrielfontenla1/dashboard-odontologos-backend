const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  documentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  documentType: {
    type: String,
    enum: ['DNI', 'NIE', 'Pasaporte', 'Cedula'],
    default: 'DNI'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  medicalHistory: {
    allergies: [String],
    conditions: [String],
    medications: [String],
    notes: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  lastVisit: {
    type: Date
  },
  nextAppointment: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Índices para búsqueda
patientSchema.index({ 
  name: 'text', 
  documentNumber: 'text', 
  email: 'text' 
});

// Método estático para buscar por documento
patientSchema.statics.findByDocument = function(documentNumber) {
  return this.findOne({ documentNumber: documentNumber.trim() });
};

// Método estático para búsqueda general
patientSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { name: searchRegex },
      { documentNumber: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ]
  });
};

module.exports = mongoose.model('Patient', patientSchema); 