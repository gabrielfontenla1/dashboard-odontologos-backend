const express = require('express');
const router = express.Router();
const AppointmentRequest = require('../models/AppointmentRequest');
const { protect, authorize } = require('../middleware/auth.middleware');

// Create new appointment request (public route for landing page)
router.post('/', async (req, res) => {
  try {
    const {
      service,
      preferredDoctor,
      requestedDate,
      requestedTime,
      firstName,
      lastName,
      phone,
      email,
      documentNumber,
      documentType,
      notes
    } = req.body;

    // Validate required fields
    if (!service || !requestedDate || !requestedTime || !firstName || !lastName || !phone || !email || !documentNumber || !documentType) {
      return res.status(400).json({
        message: 'Todos los campos requeridos deben ser completados',
        required: ['service', 'requestedDate', 'requestedTime', 'firstName', 'lastName', 'phone', 'email', 'documentNumber', 'documentType']
      });
    }

    // Create appointment request
    const appointmentRequest = new AppointmentRequest({
      service,
      preferredDoctor: preferredDoctor || null,
      requestedDate: new Date(requestedDate),
      requestedTime,
      patientInfo: {
        firstName,
        lastName,
        phone,
        email,
        documentNumber,
        documentType,
        notes: notes || ''
      },
      status: 'pending'
    });

    const savedRequest = await appointmentRequest.save();

    // Populate the saved request for response
    const populatedRequest = await AppointmentRequest.findById(savedRequest._id)
      .populate('service', 'name description duration price')
      .populate('preferredDoctor', 'name specialization');

    res.status(201).json({
      message: 'Solicitud de cita creada exitosamente',
      appointmentRequest: populatedRequest
    });

  } catch (error) {
    console.error('Error creating appointment request:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all appointment requests (protected route for admin/staff)
router.get('/', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'service', select: 'name description duration price' },
        { path: 'preferredDoctor', select: 'name specialization' },
        { path: 'appointmentId', select: 'date status' },
        { path: 'patientId', select: 'name email phone' }
      ]
    };

    const requests = await AppointmentRequest.paginate(filter, options);
    res.json(requests);

  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes de citas' });
  }
});

// Get appointment request by ID (protected route)
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await AppointmentRequest.findById(req.params.id)
      .populate('service', 'name description duration price')
      .populate('preferredDoctor', 'name specialization')
      .populate('appointmentId', 'date status')
      .populate('patientId', 'name email phone');

    if (!request) {
      return res.status(404).json({ message: 'Solicitud de cita no encontrada' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching appointment request:', error);
    res.status(500).json({ message: 'Error al obtener solicitud de cita' });
  }
});

// Update appointment request status (protected route)
router.patch('/:id/status', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'converted'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const request = await AppointmentRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(notes && { notes: notes })
      },
      { new: true }
    ).populate('service', 'name description duration price')
     .populate('preferredDoctor', 'name specialization');

    if (!request) {
      return res.status(404).json({ message: 'Solicitud de cita no encontrada' });
    }

    res.json({
      message: 'Estado de solicitud actualizado exitosamente',
      appointmentRequest: request
    });

  } catch (error) {
    console.error('Error updating appointment request status:', error);
    res.status(500).json({ message: 'Error al actualizar estado de solicitud' });
  }
});

// Convert appointment request to actual appointment (protected route)
router.post('/:id/convert', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { doctorId, finalDate, finalTime } = req.body;

    const request = await AppointmentRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Solicitud de cita no encontrada' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Solo se pueden convertir solicitudes aprobadas' });
    }

    // Convert to appointment using the model method
    const appointment = await request.convertToAppointment(doctorId, finalDate, finalTime);

    res.json({
      message: 'Solicitud convertida a cita exitosamente',
      appointment
    });

  } catch (error) {
    console.error('Error converting appointment request:', error);
    res.status(500).json({ message: 'Error al convertir solicitud a cita' });
  }
});

// Get statistics (protected route)
router.get('/stats/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await AppointmentRequest.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching appointment request stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

module.exports = router; 