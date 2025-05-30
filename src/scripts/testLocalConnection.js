require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/user.model');
const Service = require('../models/service.model');
const Patient = require('../models/patient.model');

async function testLocalConnection() {
  try {
    console.log('🧪 PROBANDO CONEXIÓN LOCAL AL BACKEND...');
    console.log('=' .repeat(50));
    
    // Mostrar información de configuración
    console.log('\n🔧 CONFIGURACIÓN:');
    console.log(`   • NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`   • MONGODB_URI: ${process.env.MONGODB_URI ? 'definido' : 'undefined'}`);
    console.log(`   • DATABASE_URL: ${process.env.DATABASE_URL ? 'definido' : 'undefined'}`);
    
    // Conectar usando la nueva configuración
    await connectDB();
    
    console.log('\n🔍 PROBANDO OPERACIONES BÁSICAS:');
    
    // Test 1: Contar usuarios
    console.log('\n1️⃣ Contando usuarios...');
    const userCount = await User.countDocuments();
    console.log(`   ✅ Usuarios encontrados: ${userCount}`);
    
    // Test 2: Buscar admin
    console.log('\n2️⃣ Buscando usuario admin...');
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`   ✅ Admin encontrado: ${admin.name} (${admin.email})`);
    } else {
      console.log('   ⚠️ No se encontró usuario admin');
    }
    
    // Test 3: Contar servicios
    console.log('\n3️⃣ Contando servicios...');
    const serviceCount = await Service.countDocuments();
    console.log(`   ✅ Servicios encontrados: ${serviceCount}`);
    
    // Test 4: Contar pacientes
    console.log('\n4️⃣ Contando pacientes...');
    const patientCount = await Patient.countDocuments();
    console.log(`   ✅ Pacientes encontrados: ${patientCount}`);
    
    // Test 5: Buscar algunos doctores
    console.log('\n5️⃣ Buscando doctores...');
    const doctors = await User.find({ role: 'doctor' }).limit(3);
    console.log(`   ✅ Doctores encontrados: ${doctors.length}`);
    doctors.forEach(doctor => {
      console.log(`      • ${doctor.name} - ${doctor.specialization?.join(', ') || 'Sin especialización'}`);
    });
    
    // Test 6: Operación de escritura (crear y eliminar)
    console.log('\n6️⃣ Probando operación de escritura...');
    const testPatient = new Patient({
      name: 'Test Connection Patient',
      documentType: 'DNI',
      documentNumber: '99999999',
      phone: '999-999-999',
      email: 'test@connection.com',
      dateOfBirth: new Date('1990-01-01'),
      address: {
        street: 'Test Street 123',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345'
      }
    });
    
    const savedPatient = await testPatient.save();
    console.log(`   ✅ Paciente de prueba creado: ${savedPatient.name} (ID: ${savedPatient._id})`);
    
    // Eliminar el paciente de prueba
    await Patient.findByIdAndDelete(savedPatient._id);
    console.log('   🧹 Paciente de prueba eliminado');
    
    console.log('\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
    console.log('✅ La conexión local al backend funciona correctamente');
    console.log('✅ Las operaciones CRUD funcionan correctamente');
    console.log('✅ Los modelos Mongoose están operativos');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 SOLUCIONES PARA TIMEOUT:');
      console.error('   1. Verificar conectividad de red');
      console.error('   2. Verificar que Railway esté activo');
      console.error('   3. Verificar las credenciales en .env');
      console.error('   4. Intentar reiniciar el servicio de Railway');
    }
    
    if (error.message.includes('Authentication')) {
      console.error('\n💡 SOLUCIONES PARA AUTENTICACIÓN:');
      console.error('   1. Verificar MONGODB_URI en .env');
      console.error('   2. Verificar usuario y contraseña');
      console.error('   3. Verificar que la base de datos existe');
    }
    
    console.error('\n🔧 INFORMACIÓN DE DEBUG:');
    console.error(`   • NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.error(`   • MONGODB_URI: ${process.env.MONGODB_URI ? 'definido' : 'undefined'}`);
    console.error(`   • Error completo:`, error.stack);
    
  } finally {
    // Cerrar conexión
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar el test
if (require.main === module) {
  testLocalConnection();
}

module.exports = testLocalConnection; 