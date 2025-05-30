const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// Get all doctors (public route for landing page)
router.get('/public', async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor', 
      active: true 
    }).select('name specialization licenseNumber experience email');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all doctors
router.get('/', protect, async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single doctor
router.get('/:id', protect, async (req, res) => {
    try {
        const doctor = await User.findOne({ 
            _id: req.params.id, 
            role: 'doctor' 
        }).select('-password');
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new doctor (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const doctorData = {
            ...req.body,
            role: 'doctor'
        };

        const doctor = await User.create(doctorData);
        const response = doctor.toObject();
        delete response.password;
        
        res.status(201).json(response);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update doctor
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const doctor = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'doctor' },
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete doctor (hard delete)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const doctor = await User.findOneAndDelete({ 
            _id: req.params.id, 
            role: 'doctor' 
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get doctor's availability
router.get('/:id/availability', protect, async (req, res) => {
    try {
        // Here you would implement the logic to get the doctor's availability
        // This could involve checking their appointments and work schedule
        res.json({
            message: 'Doctor availability endpoint - To be implemented'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 