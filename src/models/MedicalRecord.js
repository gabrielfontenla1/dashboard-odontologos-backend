const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false // Opcional, puede ser una entrada independiente
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatment: {
    type: String,
    required: true,
    trim: true
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    type: String // 'image', 'document', 'xray'
  }],
  nextAppointment: {
    type: Date,
    required: false
  },
  symptoms: {
    type: String,
    trim: true
  },
  procedures: [{
    name: String,
    tooth: String, // Número del diente
    description: String
  }],
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String
  },
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'follow-up'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
medicalRecordSchema.index({ patientId: 1, date: -1 });
medicalRecordSchema.index({ doctorId: 1, date: -1 });
medicalRecordSchema.index({ appointmentId: 1 });

// Método para obtener el historial completo de un paciente
medicalRecordSchema.statics.getPatientHistory = function(patientId) {
  return this.find({ patientId })
    .populate('doctorId', 'name specialization')
    .populate('appointmentId', 'date service')
    .sort({ date: -1 });
};

// Método para obtener registros por doctor
medicalRecordSchema.statics.getDoctorRecords = function(doctorId, limit = 50) {
  return this.find({ doctorId })
    .populate('patientId', 'name email phone documentNumber documentType')
    .sort({ date: -1 })
    .limit(limit);
};

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema); 