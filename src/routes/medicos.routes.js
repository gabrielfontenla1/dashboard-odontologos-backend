const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const path = require('path');
const fs = require('fs');

// Get all doctors (public route for landing page)
router.get('/public', async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor', 
      active: true 
    }).select('name specialization primarySpecialization licenseNumber experience email phone photo availability');
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

// Upload doctor photo
router.post('/:id/photo', protect, authorize('admin'), upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const doctor = await User.findOne({ 
            _id: req.params.id, 
            role: 'doctor' 
        });

        if (!doctor) {
            // Eliminar archivo subido si el doctor no existe
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Eliminar foto anterior si existe
        if (doctor.photo) {
            const oldPhotoPath = path.join(__dirname, '../../uploads/photos', path.basename(doctor.photo));
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Actualizar doctor con nueva foto
        const photoUrl = `/api/medicos/photo/${req.file.filename}`;
        doctor.photo = photoUrl;
        await doctor.save();

        res.json({
            message: 'Foto subida exitosamente',
            photoUrl: photoUrl
        });
    } catch (err) {
        // Eliminar archivo subido en caso de error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: err.message });
    }
});

// Serve photo files
router.get('/photo/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const photoPath = path.join(__dirname, '../../uploads/photos', filename);
        
        if (!fs.existsSync(photoPath)) {
            return res.status(404).json({ message: 'Foto no encontrada' });
        }

        res.sendFile(photoPath);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete doctor photo
router.delete('/:id/photo', protect, authorize('admin'), async (req, res) => {
    try {
        const doctor = await User.findOne({ 
            _id: req.params.id, 
            role: 'doctor' 
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        if (!doctor.photo) {
            return res.status(400).json({ message: 'El doctor no tiene foto' });
        }

        // Eliminar archivo físico
        const photoPath = path.join(__dirname, '../../uploads/photos', path.basename(doctor.photo));
        if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
        }

        // Actualizar doctor
        doctor.photo = null;
        await doctor.save();

        res.json({ message: 'Foto eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 