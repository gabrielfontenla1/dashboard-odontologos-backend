require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Service = require('../models/service.model');
const Appointment = require('../models/appointment.model');

async function initTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic');
    console.log('Connected to MongoDB');

    // Drop existing collections
    await Promise.all([
      User.collection.drop(),
      Patient.collection.drop(),
      Service.collection.drop(),
      Appointment.collection.drop()
    ]).catch(err => {
      if (err.code !== 26) {
        console.error('Error dropping collections:', err);
      }
    });
    console.log('Dropped existing collections');

    // Create test doctor
    const doctor = await User.create({
      email: 'doctor@odontologos.com',
      password: 'Doctor@2024!',
      name: 'Dr. John Doe',
      role: 'doctor',
      specialization: ['general', 'orthodontics'],
      licenseNumber: 'MED123456',
      experience: 10,
      availability: new Map([
        ['monday', { start: '09:00', end: '17:00', isAvailable: true }],
        ['tuesday', { start: '09:00', end: '17:00', isAvailable: true }],
        ['wednesday', { start: '09:00', end: '17:00', isAvailable: true }],
        ['thursday', { start: '09:00', end: '17:00', isAvailable: true }],
        ['friday', { start: '09:00', end: '17:00', isAvailable: true }]
      ])
    });
    console.log('Created test doctor:', doctor.name, '(ID:', doctor._id, ')');

    // Create test patient
    const patient = await Patient.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+34623456789',
      dateOfBirth: new Date('1990-05-15'),
      status: 'active'
    });
    console.log('Created test patient:', patient.name, '(ID:', patient._id, ')');

    // Create test services
    const services = await Service.create([
      {
        name: 'Limpieza Dental',
        description: 'Limpieza dental profesional',
        duration: 60,
        price: 80,
        category: 'general',
        active: true
      },
      {
        name: 'Ortodoncia',
        description: 'Tratamiento de ortodoncia',
        duration: 45,
        price: 150,
        category: 'orthodontics',
        active: true
      }
    ]);
    console.log('Created test services:', services.map(s => `${s.name} (ID: ${s._id})`).join(', '));

    // Create test appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      service: services[0]._id,
      date: new Date('2024-03-25T14:00:00.000Z'),
      duration: 60,
      status: 'scheduled',
      paymentStatus: 'pending'
    });
    console.log('Created test appointment:', appointment._id);

    console.log('Test data initialization completed successfully');
  } catch (error) {
    console.error('Error initializing test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initTestData(); 