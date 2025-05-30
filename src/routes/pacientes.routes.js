const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// Get all patients
router.get('/', protect, async (req, res) => {
  try {
    const { creadosDesde, count } = req.query;
    
    let query = {};
    
    // Filtrar por fecha de creación si se proporciona
    if (creadosDesde) {
      const fromDate = new Date(creadosDesde);
      query.createdAt = { $gte: fromDate };
    }
    
    if (count === 'true') {
      // Si solo queremos el conteo
      const patientCount = await Patient.countDocuments(query);
      res.json({ count: patientCount });
    } else {
      // Devolver los pacientes completos
      const patients = await Patient.find(query);
      res.json(patients);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single patient
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new patient
router.post('/', protect, async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update patient
router.put('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete patient
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search patients
router.get('/search/:query', protect, async (req, res) => {
  try {
    const query = req.params.query;
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { documentNumber: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search patient by document number (exact match)
router.get('/document/:documentNumber', protect, async (req, res) => {
  try {
    const documentNumber = req.params.documentNumber;
    const patient = await Patient.findByDocument(documentNumber);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado con ese número de documento' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 