const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Patient = require('../models/patient.model');

// Function to generate random document numbers
const generateDocumentNumber = (type) => {
  switch (type) {
    case 'DNI':
      return Math.floor(10000000 + Math.random() * 90000000).toString();
    case 'NIE':
      return 'X' + Math.floor(1000000 + Math.random() * 9000000).toString() + 'A';
    case 'Pasaporte':
      return 'P' + Math.floor(100000 + Math.random() * 900000).toString();
    case 'Cedula':
      return Math.floor(100000000 + Math.random() * 900000000).toString();
    default:
      return Math.floor(10000000 + Math.random() * 90000000).toString();
  }
};

async function updatePatientsWithDocuments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/dental-clinic');
    console.log('Connected to MongoDB');

    // Get all patients without document numbers
    const patients = await Patient.find({ documentNumber: { $exists: false } });
    console.log(`Found ${patients.length} patients without document numbers`);

    if (patients.length === 0) {
      console.log('All patients already have document numbers');
      process.exit(0);
    }

    const documentTypes = ['DNI', 'NIE', 'Pasaporte', 'Cedula'];
    const updatedPatients = [];

    for (const patient of patients) {
      const randomType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      let documentNumber;
      let isUnique = false;
      
      // Ensure unique document number
      while (!isUnique) {
        documentNumber = generateDocumentNumber(randomType);
        const existingPatient = await Patient.findOne({ documentNumber });
        if (!existingPatient) {
          isUnique = true;
        }
      }

      // Update patient with document information
      const updatedPatient = await Patient.findByIdAndUpdate(
        patient._id,
        {
          documentNumber: documentNumber,
          documentType: randomType
        },
        { new: true }
      );

      updatedPatients.push(updatedPatient);
      console.log(`Updated ${patient.name} with ${randomType}: ${documentNumber}`);
    }

    console.log(`\nSuccessfully updated ${updatedPatients.length} patients with document numbers`);
    
    // Display updated patients
    console.log('\nUpdated Patients:');
    for (const patient of updatedPatients) {
      console.log(`- ${patient.name}: ${patient.documentType} ${patient.documentNumber}`);
    }

    process.exit(0);

  } catch (error) {
    console.error('Error updating patients:', error);
    process.exit(1);
  }
}

// Run the update function
updatePatientsWithDocuments(); 