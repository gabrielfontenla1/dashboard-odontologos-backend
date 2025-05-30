const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Patient = require('../models/patient.model');

const samplePatients = [
  {
    name: "Carlos Rodríguez",
    documentNumber: "12345678Z",
    documentType: "DNI",
    email: "carlos.rodriguez@email.com",
    phone: "+34612345678",
    dateOfBirth: new Date("1985-03-20"),
    address: {
      street: "Calle Mayor 123",
      city: "Madrid",
      state: "Madrid",
      zipCode: "28001"
    },
    status: "active"
  },
  {
    name: "María García",
    documentNumber: "87654321X",
    documentType: "DNI",
    email: "maria.garcia@email.com",
    phone: "+34687654321",
    dateOfBirth: new Date("1992-07-15"),
    address: {
      street: "Avenida de la Paz 456",
      city: "Barcelona",
      state: "Cataluña",
      zipCode: "08001"
    },
    status: "active"
  },
  {
    name: "John Anderson",
    documentNumber: "P123456",
    documentType: "Pasaporte",
    email: "john.anderson@email.com",
    phone: "+34698765432",
    dateOfBirth: new Date("1988-11-30"),
    address: {
      street: "Plaza España 789",
      city: "Valencia",
      state: "Valencia",
      zipCode: "46001"
    },
    status: "active"
  },
  {
    name: "Ana Martínez",
    documentNumber: "Y9876543B",
    documentType: "NIE",
    email: "ana.martinez@email.com",
    phone: "+34634567890",
    dateOfBirth: new Date("1995-01-10"),
    address: {
      street: "Calle del Sol 321",
      city: "Sevilla",
      state: "Andalucía",
      zipCode: "41001"
    },
    status: "active"
  },
  {
    name: "Roberto Silva",
    documentNumber: "123456789",
    documentType: "Cedula",
    email: "roberto.silva@email.com",
    phone: "+34645678901",
    dateOfBirth: new Date("1980-09-25"),
    address: {
      street: "Paseo de Gracia 654",
      city: "Barcelona",
      state: "Cataluña",
      zipCode: "08002"
    },
    status: "active"
  }
];

async function seedMorePatients() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/dental-clinic');
    console.log('Connected to MongoDB');

    // Check if patients already exist
    for (const patientData of samplePatients) {
      const existingPatient = await Patient.findOne({ 
        documentNumber: patientData.documentNumber 
      });
      
      if (existingPatient) {
        console.log(`Patient with document ${patientData.documentNumber} already exists: ${existingPatient.name}`);
        continue;
      }

      // Create new patient
      const patient = await Patient.create(patientData);
      console.log(`Created patient: ${patient.name} (${patient.documentType}: ${patient.documentNumber})`);
    }

    console.log('\nPatient seeding completed!');
    
    // Show all patients
    const allPatients = await Patient.find({}, 'name documentType documentNumber email');
    console.log('\nAll patients in database:');
    allPatients.forEach(patient => {
      console.log(`- ${patient.name}: ${patient.documentType} ${patient.documentNumber} (${patient.email})`);
    });

    process.exit(0);

  } catch (error) {
    console.error('Error seeding patients:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedMorePatients(); 