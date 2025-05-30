const mongoose = require('mongoose');

const appointmentRequestSchema = new mongoose.Schema({
  // Información del servicio solicitado
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  
  // Doctor preferido (puede ser ObjectId o null para cualquier doctor)
  preferredDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Fecha y hora solicitadas
  requestedDate: {
    type: Date,
    required: true
  },
  
  requestedTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Formato HH:MM
  },
  
  // Información del paciente
  patientInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true
    },
    documentType: {
      type: String,
      enum: ['DNI', 'NIE', 'Pasaporte', 'Cedula'],
      required: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Estado de la solicitud
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'converted'],
    default: 'pending'
  },
  
  // Referencia a la cita creada (si fue aprobada)
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  
  // Referencia al paciente creado/encontrado
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  
  // Notas administrativas
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Información de seguimiento
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  processedAt: {
    type: Date,
    default: null
  },
  
  // Información de origen
  source: {
    type: String,
    default: 'landing_page'
  },
  
  // IP del cliente (para seguridad)
  clientIP: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
appointmentRequestSchema.index({ status: 1, createdAt: -1 });
appointmentRequestSchema.index({ 'patientInfo.email': 1 });
appointmentRequestSchema.index({ requestedDate: 1 });

// Método virtual para obtener el nombre completo
appointmentRequestSchema.virtual('patientInfo.fullName').get(function() {
  return `${this.patientInfo.firstName} ${this.patientInfo.lastName}`;
});

// Método estático para obtener solicitudes pendientes
appointmentRequestSchema.statics.getPendingRequests = function() {
  return this.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .populate('patientId', 'name email phone')
    .populate('appointmentId', 'date service status');
};

// Método estático para obtener estadísticas
appointmentRequestSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Método para convertir a cita
appointmentRequestSchema.methods.convertToAppointment = async function(doctorId, appointmentData) {
  const Appointment = mongoose.model('Appointment');
  
  const appointment = new Appointment({
    patientId: this.patientId,
    doctorId: doctorId,
    date: appointmentData.date || this.requestedDate,
    time: appointmentData.time || this.requestedTime,
    service: appointmentData.service || this.service,
    status: 'scheduled',
    notes: appointmentData.notes || this.patientInfo.notes,
    source: 'appointment_request'
  });
  
  await appointment.save();
  
  this.status = 'converted';
  this.appointmentId = appointment._id;
  this.processedAt = new Date();
  
  await this.save();
  
  return appointment;
};

module.exports = mongoose.model('AppointmentRequest', appointmentRequestSchema); 