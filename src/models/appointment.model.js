const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 30
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'checked-in', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  // Campos para check-in via QR
  checkedInAt: {
    type: Date
  },
  checkedInBy: {
    type: String // ID de la secretaria o 'qr-scan'
  },
  qrCode: {
    generated: {
      type: Boolean,
      default: false
    },
    generatedAt: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial'],
    default: 'pending'
  },
  amount: {
    type: Number
  },
  reminder: {
    sent: {
      type: Boolean,
      default: false
    },
    scheduledFor: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
appointmentSchema.index({ date: 1, doctor: 1 });
appointmentSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema); 