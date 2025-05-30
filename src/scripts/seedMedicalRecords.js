const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/patient.model');
const Doctor = require('../models/user.model'); // Doctors are stored in user.model

// Sample medical records data
const sampleMedicalRecords = [
  {
    symptoms: "Dolor intenso en muela superior derecha, sensibilidad al frío y calor",
    diagnosis: "Caries profunda en primer molar superior derecho",
    treatment: "Endodoncia y corona dental",
    notes: "Paciente refiere dolor nocturno. Se recomienda evitar alimentos muy fríos o calientes.",
    medications: [
      {
        name: "Ibuprofeno",
        dosage: "400mg",
        frequency: "Cada 8 horas",
        duration: "5 días"
      },
      {
        name: "Amoxicilina",
        dosage: "500mg",
        frequency: "Cada 8 horas",
        duration: "7 días"
      }
    ],
    procedures: [
      {
        name: "Endodoncia",
        tooth: "16",
        description: "Tratamiento de conducto en primer molar superior derecho"
      }
    ],
    allergies: [],
    status: "active"
  },
  {
    symptoms: "Sangrado de encías durante el cepillado, mal aliento",
    diagnosis: "Gingivitis moderada",
    treatment: "Limpieza dental profunda y mejora de higiene oral",
    notes: "Se recomienda uso de hilo dental diario y enjuague bucal antibacterial.",
    medications: [
      {
        name: "Clorhexidina",
        dosage: "0.12%",
        frequency: "2 veces al día",
        duration: "14 días"
      }
    ],
    procedures: [
      {
        name: "Profilaxis dental",
        tooth: "Todos",
        description: "Limpieza dental completa con ultrasonido"
      }
    ],
    allergies: [],
    status: "completed"
  },
  {
    symptoms: "Fractura de diente frontal por traumatismo",
    diagnosis: "Fractura coronaria de incisivo central superior izquierdo",
    treatment: "Restauración con resina compuesta",
    notes: "Traumatismo deportivo. Se evaluará necesidad de endodoncia en próxima cita.",
    medications: [],
    procedures: [
      {
        name: "Restauración estética",
        tooth: "21",
        description: "Reconstrucción con resina compuesta fotopolimerizable"
      }
    ],
    allergies: [
      {
        allergen: "Penicilina",
        reaction: "Erupción cutánea",
        severity: "moderate"
      }
    ],
    status: "follow-up",
    nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días desde hoy
  },
  {
    symptoms: "Dolor en articulación temporomandibular, dificultad para abrir la boca",
    diagnosis: "Disfunción temporomandibular (DTM)",
    treatment: "Placa de relajación nocturna y fisioterapia",
    notes: "Paciente presenta bruxismo nocturno. Se recomienda evitar alimentos duros.",
    medications: [
      {
        name: "Relajante muscular",
        dosage: "10mg",
        frequency: "Antes de dormir",
        duration: "30 días"
      }
    ],
    procedures: [
      {
        name: "Toma de impresiones",
        tooth: "Ambas arcadas",
        description: "Para confección de placa de relajación"
      }
    ],
    allergies: [],
    status: "active"
  },
  {
    symptoms: "Revisión de rutina, sin molestias",
    diagnosis: "Estado dental satisfactorio",
    treatment: "Limpieza dental preventiva y aplicación de flúor",
    notes: "Paciente mantiene excelente higiene oral. Próxima revisión en 6 meses.",
    medications: [],
    procedures: [
      {
        name: "Profilaxis",
        tooth: "Todos",
        description: "Limpieza dental de rutina"
      },
      {
        name: "Aplicación de flúor",
        tooth: "Todos",
        description: "Tratamiento preventivo con flúor tópico"
      }
    ],
    allergies: [],
    status: "completed"
  }
];

async function seedMedicalRecords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/dental-clinic');
    console.log('Connected to MongoDB');

    // Clear existing medical records
    await MedicalRecord.deleteMany({});
    console.log('Cleared existing medical records');

    // Get existing patients and doctors
    const patients = await Patient.find().limit(5);
    const doctors = await Doctor.find({ role: 'doctor' }).limit(3);

    if (patients.length === 0 || doctors.length === 0) {
      console.log('No patients or doctors found. Please seed patients and doctors first.');
      process.exit(1);
    }

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

    // Create medical records
    const medicalRecords = [];
    
    for (let i = 0; i < sampleMedicalRecords.length; i++) {
      const recordData = sampleMedicalRecords[i];
      const patient = patients[i % patients.length];
      const doctor = doctors[i % doctors.length];
      
      const medicalRecord = new MedicalRecord({
        ...recordData,
        patientId: patient._id,
        doctorId: doctor._id,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });

      medicalRecords.push(medicalRecord);
    }

    // Save all medical records
    const savedRecords = await MedicalRecord.insertMany(medicalRecords);
    console.log(`Created ${savedRecords.length} medical records`);

    // Display created records
    console.log('\nCreated Medical Records:');
    for (const record of savedRecords) {
      const patient = patients.find(p => p._id.equals(record.patientId));
      const doctor = doctors.find(d => d._id.equals(record.doctorId));
      console.log(`- ${patient.name} - ${record.diagnosis} (Dr. ${doctor.name})`);
    }

    console.log('\nMedical records seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding medical records:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedMedicalRecords(); 