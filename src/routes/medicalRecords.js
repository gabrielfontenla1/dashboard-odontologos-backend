const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { protect } = require('../middleware/auth.middleware');

// Obtener todos los registros médicos (con paginación)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const records = await MedicalRecord.find()
      .populate('patientId', 'name email phone documentNumber documentType')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date service')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalRecord.countDocuments();

    res.json({
      records,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ message: 'Error al obtener registros médicos' });
  }
});

// Obtener historial médico de un paciente específico
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await MedicalRecord.getPatientHistory(patientId);
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ message: 'Error al obtener historial del paciente' });
  }
});

// Obtener registros de un doctor específico
router.get('/doctor/:doctorId', protect, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const records = await MedicalRecord.getDoctorRecords(doctorId, limit);
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching doctor records:', error);
    res.status(500).json({ message: 'Error al obtener registros del doctor' });
  }
});

// Obtener un registro médico específico
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patientId', 'name email phone documentNumber documentType')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date service');

    if (!record) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({ message: 'Error al obtener registro médico' });
  }
});

// Crear nuevo registro médico
router.post('/', protect, async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      treatment,
      medications,
      notes,
      symptoms,
      procedures,
      vitalSigns,
      allergies,
      nextAppointment,
      status
    } = req.body;

    // Validaciones básicas
    if (!patientId || !doctorId || !diagnosis || !treatment) {
      return res.status(400).json({ 
        message: 'Paciente, doctor, diagnóstico y tratamiento son requeridos' 
      });
    }

    const newRecord = new MedicalRecord({
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      treatment,
      medications: medications || [],
      notes,
      symptoms,
      procedures: procedures || [],
      vitalSigns,
      allergies: allergies || [],
      nextAppointment,
      status: status || 'active'
    });

    const savedRecord = await newRecord.save();
    
    // Populate para devolver datos completos
    const populatedRecord = await MedicalRecord.findById(savedRecord._id)
      .populate('patientId', 'name email phone documentNumber documentType')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date service');

    res.status(201).json(populatedRecord);
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ message: 'Error al crear registro médico' });
  }
});

// Actualizar registro médico
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remover campos que no se deben actualizar
    delete updateData._id;
    delete updateData.createdAt;

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('patientId', 'name email phone documentNumber documentType')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date service');

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ message: 'Error al actualizar registro médico' });
  }
});

// Eliminar registro médico
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecord = await MedicalRecord.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    res.json({ message: 'Registro médico eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ message: 'Error al eliminar registro médico' });
  }
});

// Buscar registros médicos
router.get('/search/:query', protect, async (req, res) => {
  try {
    const { query } = req.params;
    const searchRegex = new RegExp(query, 'i');

    const records = await MedicalRecord.find({
      $or: [
        { diagnosis: { $regex: query, $options: 'i' } },
        { treatment: { $regex: query, $options: 'i' } },
        { symptoms: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('patientId', 'name email phone documentNumber documentType')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date service')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error('Error searching medical records:', error);
    res.status(500).json({ message: 'Error al buscar registros médicos' });
  }
});

module.exports = router; 