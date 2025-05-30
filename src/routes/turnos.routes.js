const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const mongoose = require('mongoose');
const EmailService = require('../utils/emailService');

// Transform MongoDB document to frontend format
const transformAppointment = (appointment) => {
  if (!appointment) return null;
  const doc = appointment.toObject();
  
  // Transform main document
  const transformed = {
    id: doc._id.toString(),
    _id: doc._id.toString(),
    ...doc
  };

  // Transform populated fields
  if (doc.patient && typeof doc.patient === 'object') {
    transformed.patient = {
      id: doc.patient._id.toString(),
      _id: doc.patient._id.toString(),
      ...doc.patient
    };
  }
  if (doc.doctor && typeof doc.doctor === 'object') {
    transformed.doctor = {
      id: doc.doctor._id.toString(),
      _id: doc.doctor._id.toString(),
      ...doc.doctor
    };
  }
  if (doc.service && typeof doc.service === 'object') {
    transformed.service = {
      id: doc.service._id.toString(),
      _id: doc.service._id.toString(),
      ...doc.service
    };
  }

  return transformed;
};

// Get all appointments
router.get('/', protect, async (req, res) => {
  try {
    const { limit, sort, estado, fecha } = req.query;
    
    let query = {};
    
    // Filtrar por estado si se proporciona
    if (estado) {
      query.status = estado;
    }
    
    // Filtrar por fecha si se proporciona
    if (fecha) {
      const targetDate = new Date(fecha);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    let appointmentsQuery = Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price');
    
    // Aplicar ordenamiento
    if (sort === 'asc') {
      appointmentsQuery = appointmentsQuery.sort({ date: 1 });
    } else if (sort === 'desc') {
      appointmentsQuery = appointmentsQuery.sort({ date: -1 });
    } else {
      appointmentsQuery = appointmentsQuery.sort({ date: 1 }); // default asc
    }
    
    // Aplicar límite si se proporciona
    if (limit && !isNaN(parseInt(limit))) {
      appointmentsQuery = appointmentsQuery.limit(parseInt(limit));
    }
    
    const appointments = await appointmentsQuery;
    res.json(appointments.map(transformAppointment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointments by date range
router.get('/range', protect, async (req, res) => {
  try {
    const { start, end } = req.query;
    const appointments = await Appointment.find({
      date: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price');
    res.json(appointments.map(transformAppointment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(transformAppointment(appointment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new appointment
router.post('/', protect, async (req, res) => {
  try {
    const { patient, doctor, service, date } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!patient || !doctor || !service || !date) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          patient: !patient ? 'Patient ID is required' : null,
          doctor: !doctor ? 'Doctor ID is required' : null,
          service: !service ? 'Service ID is required' : null,
          date: !date ? 'Date is required' : null
        }
      });
    }

    // Validar que los IDs sean válidos ObjectIds de MongoDB
    if (!mongoose.Types.ObjectId.isValid(patient) || 
        !mongoose.Types.ObjectId.isValid(doctor) || 
        !mongoose.Types.ObjectId.isValid(service)) {
      return res.status(400).json({ 
        message: 'Invalid ID format',
        details: {
          patient: !mongoose.Types.ObjectId.isValid(patient) ? 'Invalid patient ID format' : null,
          doctor: !mongoose.Types.ObjectId.isValid(doctor) ? 'Invalid doctor ID format' : null,
          service: !mongoose.Types.ObjectId.isValid(service) ? 'Invalid service ID format' : null
        }
      });
    }

    // Validate references
    const [patientExists, doctorExists, serviceExists] = await Promise.all([
      mongoose.model('Patient').findById(patient),
      mongoose.model('User').findById(doctor),
      mongoose.model('Service').findById(service)
    ]);

    if (!patientExists || !doctorExists || !serviceExists) {
      return res.status(400).json({ 
        message: 'Invalid references',
        details: {
          patient: !patientExists ? 'Patient not found' : null,
          doctor: !doctorExists ? 'Doctor not found' : null,
          service: !serviceExists ? 'Service not found' : null
        }
      });
    }

    // Check for scheduling conflicts
    const existingAppointment = await Appointment.findOne({
      doctor: doctor,
      date: date,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const appointment = new Appointment(req.body);
    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price');

    // Send confirmation email
    if (populatedAppointment.patient.email) {
      try {
        await EmailService.sendAppointmentConfirmation(
          populatedAppointment,
          populatedAppointment.patient,
          populatedAppointment.doctor,
          populatedAppointment.service
        );
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json(transformAppointment(populatedAppointment));
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update appointment
router.put('/:id', protect, async (req, res) => {
  try {
    const { patient, doctor, service, date } = req.body;

    // Validar que el ID del turno sea válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    // Validar IDs si están presentes en la actualización
    if (patient && !mongoose.Types.ObjectId.isValid(patient)) {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }
    if (doctor && !mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    if (service && !mongoose.Types.ObjectId.isValid(service)) {
      return res.status(400).json({ message: 'Invalid service ID format' });
    }

    // Validar referencias si están presentes
    if (patient || doctor || service) {
      const [patientExists, doctorExists, serviceExists] = await Promise.all([
        patient ? mongoose.model('Patient').findById(patient) : true,
        doctor ? mongoose.model('User').findById(doctor) : true,
        service ? mongoose.model('Service').findById(service) : true
      ]);

      if ((patient && !patientExists) || (doctor && !doctorExists) || (service && !serviceExists)) {
        return res.status(400).json({ 
          message: 'Invalid references',
          details: {
            patient: patient && !patientExists ? 'Patient not found' : null,
            doctor: doctor && !doctorExists ? 'Doctor not found' : null,
            service: service && !serviceExists ? 'Service not found' : null
          }
        });
      }
    }

    if (date && doctor) {
      // Check for scheduling conflicts when updating date
      console.log('🔍 Checking for conflicts:');
      console.log('  - Doctor ID:', doctor);
      console.log('  - New date:', new Date(date));
      console.log('  - Current appointment ID:', req.params.id);
      
      const existingAppointment = await Appointment.findOne({
        doctor: doctor,
        date: date,
        status: { $ne: 'cancelled' },
        _id: { $ne: req.params.id }
      });

      console.log('  - Conflicting appointment found:', existingAppointment ? existingAppointment._id : 'None');

      if (existingAppointment) {
        console.log('❌ Conflict detected! Existing appointment details:');
        console.log('  - ID:', existingAppointment._id);
        console.log('  - Date:', existingAppointment.date);
        console.log('  - Doctor:', existingAppointment.doctor);
        console.log('  - Status:', existingAppointment.status);
        return res.status(400).json({ message: 'Time slot is already booked' });
      }
      
      console.log('✅ No conflicts found, proceeding with update');
    }

    const oldAppointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price');

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Send appropriate email based on what changed
    if (appointment.patient.email) {
      try {
        // If date or time changed, send reschedule email
        if (oldAppointment.date.getTime() !== new Date(appointment.date).getTime()) {
          await EmailService.sendAppointmentReschedule(
            appointment,
            appointment.patient,
            appointment.doctor,
            appointment.service
          );
        }
        // If status changed to confirmed, send confirmation email
        else if (appointment.status === 'confirmed' && oldAppointment.status !== 'confirmed') {
          await EmailService.sendAppointmentConfirmation(
            appointment,
            appointment.patient,
            appointment.doctor,
            appointment.service
          );
        }
      } catch (emailError) {
        console.error('Error sending update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json(transformAppointment(appointment));
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(400).json({ message: err.message });
  }
});

// Cancel appointment
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Send cancellation email
    if (appointment.patient.email) {
      try {
        await EmailService.sendAppointmentCancellation(
          appointment,
          appointment.patient,
          appointment.doctor,
          appointment.service
        );
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json(transformAppointment(appointment));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    console.log('DELETE request received for appointment ID:', req.params.id);
    
    // Validar que el ID del turno sea válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid appointment ID format:', req.params.id);
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    // First, find the appointment to make sure it exists
    const existingAppointment = await Appointment.findById(req.params.id);
    
    if (!existingAppointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Found appointment to delete:', existingAppointment._id);

    // Delete the appointment
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);

    console.log('Appointment deleted successfully:', deletedAppointment._id);

    res.json({ 
      message: 'Appointment deleted successfully',
      deletedAppointment: transformAppointment(deletedAppointment)
    });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ 
      message: 'Internal server error while deleting appointment',
      error: err.message 
    });
  }
});

// Get appointments by patient
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price')
      .sort({ date: -1 });
    res.json(appointments.map(transformAppointment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointments by doctor
router.get('/doctor/:doctorId', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.doctorId })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .populate('service', 'name duration price')
      .sort({ date: 1 });
    res.json(appointments.map(transformAppointment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// QR Code Check-in Route
router.patch('/:id/checkin', async (req, res) => {
  try {
    console.log('🔄 Processing QR check-in for appointment:', req.params.id);
    console.log('📱 QR scan data received:', req.body);
    
    const appointmentId = req.params.id;
    const { qrData, secretaryId, checkInTime } = req.body;
    
    // Verificar que el turno existe
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name documentNumber phone email')
      .populate('doctor', 'name specialization')
      .populate('service', 'name duration price');
      
    if (!appointment) {
      console.log('❌ Appointment not found:', appointmentId);
      return res.status(404).json({ 
        success: false, 
        message: 'Turno no encontrado' 
      });
    }
    
    // Verificar que el QR corresponde al turno
    if (qrData && qrData.appointmentId !== appointmentId) {
      console.log('❌ QR mismatch:', qrData.appointmentId, 'vs', appointmentId);
      return res.status(400).json({ 
        success: false, 
        message: 'El código QR no corresponde a este turno' 
      });
    }
    
    // Verificar que el turno es para hoy o está dentro del rango permitido
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    const diffInDays = Math.abs(appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays > 1) {
      console.log('❌ Appointment not for today:', appointmentDate.toDateString());
      return res.status(400).json({ 
        success: false, 
        message: 'Este turno no está programado para hoy' 
      });
    }
    
    // Actualizar el estado del turno a 'checked-in'
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        status: 'checked-in',
        checkedInAt: checkInTime || new Date(),
        checkedInBy: secretaryId || 'qr-scan'
      },
      { new: true }
    ).populate('patient', 'name documentNumber phone email')
     .populate('doctor', 'name specialization')
     .populate('service', 'name duration price');
    
    console.log('✅ Patient checked in successfully:', {
      appointmentId,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      time: appointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    });
    
    res.json({ 
      success: true, 
      message: 'Paciente registrado exitosamente',
      appointment: updatedAppointment,
      checkInDetails: {
        patientName: appointment.patient.name,
        appointmentTime: appointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        doctorName: appointment.doctor.name,
        serviceName: appointment.service.name,
        checkedInAt: checkInTime || new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ Error in QR check-in:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 