const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const Service = require('../models/service.model');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');

// Servicios dentales completos
const services = [
  {
    name: 'Limpieza Dental',
    description: 'Limpieza profesional y profilaxis dental completa',
    duration: 60,
    price: 80,
    category: 'general',
    isActive: true,
    requirements: ['Evaluación previa'],
    benefits: [
      'Eliminación de placa y sarro',
      'Prevención de enfermedades periodontales',
      'Mejora de la salud bucal general'
    ]
  },
  {
    name: 'Consulta General',
    description: 'Examen dental completo y diagnóstico',
    duration: 45,
    price: 50,
    category: 'general',
    isActive: true,
    requirements: [],
    benefits: [
      'Diagnóstico temprano de problemas',
      'Plan de tratamiento personalizado',
      'Prevención de complicaciones'
    ]
  },
  {
    name: 'Ortodoncia',
    description: 'Tratamiento de corrección dental y alineación',
    duration: 90,
    price: 300,
    category: 'orthodontics',
    isActive: true,
    requirements: ['Radiografías', 'Moldes dentales'],
    benefits: [
      'Mejora de la alineación dental',
      'Corrección de la mordida',
      'Mejora estética y funcional'
    ]
  },
  {
    name: 'Atención de Urgencia',
    description: 'Atención inmediata para emergencias dentales',
    duration: 30,
    price: 120,
    category: 'general',
    isActive: true,
    requirements: [],
    benefits: [
      'Alivio inmediato del dolor',
      'Tratamiento de emergencias',
      'Disponibilidad prioritaria'
    ]
  },
  {
    name: 'Endodoncia',
    description: 'Tratamiento de conducto radicular',
    duration: 120,
    price: 250,
    category: 'surgery',
    isActive: true,
    requirements: ['Radiografías', 'Evaluación previa'],
    benefits: [
      'Salvación del diente natural',
      'Eliminación de infección',
      'Alivio del dolor'
    ]
  },
  {
    name: 'Blanqueamiento Dental',
    description: 'Tratamiento estético para blanquear los dientes',
    duration: 90,
    price: 200,
    category: 'cosmetic',
    isActive: true,
    requirements: ['Limpieza previa'],
    benefits: [
      'Mejora estética significativa',
      'Dientes más blancos y brillantes',
      'Aumento de la confianza'
    ]
  },
  {
    name: 'Extracción Dental',
    description: 'Extracción de dientes dañados o muelas del juicio',
    duration: 60,
    price: 150,
    category: 'surgery',
    isActive: true,
    requirements: ['Radiografías', 'Evaluación previa'],
    benefits: [
      'Eliminación de dolor',
      'Prevención de complicaciones',
      'Mejora de la salud bucal'
    ]
  },
  {
    name: 'Implante Dental',
    description: 'Colocación de implantes dentales de titanio',
    duration: 180,
    price: 800,
    category: 'surgery',
    isActive: true,
    requirements: ['Radiografías 3D', 'Evaluación ósea', 'Planificación quirúrgica'],
    benefits: [
      'Reemplazo permanente de dientes',
      'Funcionalidad natural',
      'Preservación del hueso'
    ]
  }
];

// Doctores/Usuarios
const doctors = [
  {
    name: 'Dr. Carlos Mendoza',
    email: 'carlos.mendoza@clinica.com',
    password: 'Doctor123!',
    role: 'doctor',
    specialization: ['Ortodoncia', 'Odontología General'],
    licenseNumber: 'COL12345',
    experience: 8,
    isActive: true
  },
  {
    name: 'Dra. Ana García',
    email: 'ana.garcia@clinica.com',
    password: 'Doctor123!',
    role: 'doctor',
    specialization: ['Endodoncia', 'Cirugía Oral'],
    licenseNumber: 'COL67890',
    experience: 12,
    isActive: true
  },
  {
    name: 'Dr. Luis Rodríguez',
    email: 'luis.rodriguez@clinica.com',
    password: 'Doctor123!',
    role: 'doctor',
    specialization: ['Implantología', 'Periodoncia'],
    licenseNumber: 'COL11111',
    experience: 15,
    isActive: true
  },
  {
    name: 'Dra. María López',
    email: 'maria.lopez@clinica.com',
    password: 'Doctor123!',
    role: 'doctor',
    specialization: ['Odontología Estética', 'Blanqueamiento'],
    licenseNumber: 'COL22222',
    experience: 6,
    isActive: true
  }
];

// Admin user
const adminUser = {
  name: 'Administrador',
  email: 'admin@odontologos.com',
  password: 'Admin@2024!',
  role: 'admin',
  specialization: [],
  licenseNumber: 'ADMIN001',
  experience: 0,
  isActive: true
};

// Pacientes de ejemplo
const patients = [
  {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+34 666 111 222',
    documentNumber: '12345678A',
    documentType: 'DNI',
    dateOfBirth: new Date('1985-03-15'),
    address: {
      street: 'Calle Mayor 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001'
    },
    medicalHistory: {
      allergies: ['Penicilina'],
      conditions: [],
      medications: [],
      notes: 'Paciente regular, sin complicaciones'
    }
  },
  {
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+34 666 333 444',
    documentNumber: 'X1234567L',
    documentType: 'NIE',
    dateOfBirth: new Date('1990-07-22'),
    address: {
      street: 'Avenida de la Paz 456',
      city: 'Barcelona',
      state: 'Cataluña',
      zipCode: '08001'
    },
    medicalHistory: {
      allergies: [],
      conditions: ['Bruxismo'],
      medications: [],
      notes: 'Usa protector nocturno'
    }
  },
  {
    name: 'Carlos Martín',
    email: 'carlos.martin@email.com',
    phone: '+34 666 555 666',
    documentNumber: 'P123456789',
    documentType: 'Pasaporte',
    dateOfBirth: new Date('1978-11-08'),
    address: {
      street: 'Plaza España 789',
      city: 'Valencia',
      state: 'Valencia',
      zipCode: '46001'
    },
    medicalHistory: {
      allergies: ['Látex'],
      conditions: ['Diabetes tipo 2'],
      medications: ['Metformina'],
      notes: 'Requiere cuidados especiales por diabetes'
    }
  },
  {
    name: 'Ana Rodríguez',
    email: 'ana.rodriguez@email.com',
    phone: '+34 666 777 888',
    documentNumber: '87654321B',
    documentType: 'DNI',
    dateOfBirth: new Date('1995-01-30'),
    address: {
      street: 'Calle Libertad 321',
      city: 'Sevilla',
      state: 'Andalucía',
      zipCode: '41001'
    },
    medicalHistory: {
      allergies: [],
      conditions: [],
      medications: [],
      notes: 'Paciente joven, primera consulta'
    }
  },
  {
    name: 'Roberto Silva',
    email: 'roberto.silva@email.com',
    phone: '+34 666 999 000',
    documentNumber: '123456789',
    documentType: 'Cedula',
    dateOfBirth: new Date('1982-09-12'),
    address: {
      street: 'Calle del Sol 654',
      city: 'Bilbao',
      state: 'País Vasco',
      zipCode: '48001'
    },
    medicalHistory: {
      allergies: ['Ibuprofeno'],
      conditions: ['Hipertensión'],
      medications: ['Enalapril'],
      notes: 'Control de presión arterial antes de procedimientos'
    }
  }
];

async function seedAllDataCloud() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error('❌ Error: No se encontró MONGODB_URI o DATABASE_URL en las variables de entorno');
      process.exit(1);
    }

    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado exitosamente a MongoDB');

    // 1. SERVICIOS
    console.log('\n📋 INSERTANDO SERVICIOS...');
    await Service.deleteMany({});
    const insertedServices = await Service.insertMany(services);
    console.log(`✅ ${insertedServices.length} servicios creados`);

    // 2. USUARIOS (ADMIN + DOCTORES)
    console.log('\n👨‍⚕️ INSERTANDO USUARIOS...');
    await User.deleteMany({});
    
    // Crear admin
    const hashedAdminPassword = await bcrypt.hash(adminUser.password, 10);
    const admin = await User.create({
      ...adminUser,
      password: hashedAdminPassword
    });
    console.log(`✅ Admin creado: ${admin.email}`);

    // Crear doctores
    const doctorsWithHashedPasswords = await Promise.all(
      doctors.map(async (doctor) => ({
        ...doctor,
        password: await bcrypt.hash(doctor.password, 10)
      }))
    );
    
    const insertedDoctors = await User.insertMany(doctorsWithHashedPasswords);
    console.log(`✅ ${insertedDoctors.length} doctores creados`);

    // 3. PACIENTES
    console.log('\n👥 INSERTANDO PACIENTES...');
    await Patient.deleteMany({});
    const insertedPatients = await Patient.insertMany(patients);
    console.log(`✅ ${insertedPatients.length} pacientes creados`);

    // RESUMEN FINAL
    console.log('\n🎉 ¡TODOS LOS DATOS INSERTADOS EXITOSAMENTE!');
    console.log('\n📊 RESUMEN:');
    console.log(`• Servicios: ${insertedServices.length}`);
    console.log(`• Usuarios: ${insertedDoctors.length + 1} (${insertedDoctors.length} doctores + 1 admin)`);
    console.log(`• Pacientes: ${insertedPatients.length}`);

    console.log('\n🔑 CREDENCIALES DE ACCESO:');
    console.log('👨‍💼 ADMIN:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    
    console.log('\n👨‍⚕️ DOCTORES:');
    doctors.forEach((doctor, index) => {
      console.log(`   ${index + 1}. ${doctor.name}`);
      console.log(`      Email: ${doctor.email}`);
      console.log(`      Password: ${doctor.password}`);
      console.log(`      Especialidad: ${doctor.specialization.join(', ')}`);
    });

    console.log('\n📋 SERVICIOS DISPONIBLES:');
    insertedServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} - $${service.price} (${service.category})`);
    });

    console.log('\n👥 PACIENTES DE EJEMPLO:');
    insertedPatients.forEach((patient, index) => {
      console.log(`   ${index + 1}. ${patient.name} - ${patient.documentType}: ${patient.documentNumber}`);
    });

    console.log('\n💡 ¡Ya puedes usar tu aplicación con todos los datos!');

  } catch (error) {
    console.error('❌ Error al insertar datos:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
if (require.main === module) {
  seedAllDataCloud();
}

module.exports = seedAllDataCloud; 