const mongoose = require('mongoose');

// Importar modelos para probar con Mongoose
const Service = require('../models/service.model');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');

async function finalConnectionTest() {
  try {
    console.log('🔄 Conectando a MongoDB en Railway...');
    
    // Conectar sin especificar base de datos y luego cambiar a dental-clinic
    await mongoose.connect('mongodb://mongo:cJrciyxmQIhPvZXGZFKKuOeBuXLjiwtD@interchange.proxy.rlwy.net:30276', {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    console.log('✅ Conectado exitosamente a MongoDB en Railway');
    
    // Cambiar a la base de datos dental-clinic
    console.log('\n🔄 Cambiando a base de datos dental-clinic...');
    const dentalClinicDb = mongoose.connection.useDb('dental-clinic');
    
    // Configurar mongoose para usar la nueva base de datos
    mongoose.connection.db = dentalClinicDb;
    
    console.log('✅ Usando base de datos dental-clinic');
    
    // Probar con los modelos de Mongoose
    console.log('\n🧪 PROBANDO CON MODELOS DE MONGOOSE:');
    
    // Contar documentos usando los modelos
    const serviceCount = await Service.countDocuments();
    const userCount = await User.countDocuments();
    const patientCount = await Patient.countDocuments();
    
    console.log(`📊 Servicios: ${serviceCount}`);
    console.log(`📊 Usuarios: ${userCount}`);
    console.log(`📊 Pacientes: ${patientCount}`);
    
    // Obtener algunos datos de ejemplo
    console.log('\n🔍 DATOS DE EJEMPLO:');
    
    // Admin user
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`👨‍💼 Admin: ${admin.name} (${admin.email})`);
    }
    
    // Doctores
    const doctors = await User.find({ role: 'doctor' }).limit(2);
    console.log('👨‍⚕️ Doctores:');
    doctors.forEach(doctor => {
      console.log(`   • ${doctor.name} - ${doctor.specialization.join(', ')}`);
    });
    
    // Servicios
    const services = await Service.find({}).limit(3);
    console.log('🦷 Servicios:');
    services.forEach(service => {
      console.log(`   • ${service.name} - $${service.price}`);
    });
    
    // Pacientes
    const patients = await Patient.find({}).limit(3);
    console.log('🏥 Pacientes:');
    patients.forEach(patient => {
      console.log(`   • ${patient.name} - ${patient.documentType}: ${patient.documentNumber}`);
    });
    
    // Probar una operación de escritura
    console.log('\n🧪 PROBANDO OPERACIÓN DE ESCRITURA...');
    const testService = new Service({
      name: 'Test de Conexión',
      description: 'Servicio de prueba para verificar conexión',
      duration: 30,
      price: 1,
      category: 'general',
      isActive: false,
      requirements: [],
      benefits: ['Test exitoso']
    });
    
    const savedService = await testService.save();
    console.log(`✅ Servicio de prueba creado: ${savedService.name} (ID: ${savedService._id})`);
    
    // Eliminar el servicio de prueba
    await Service.findByIdAndDelete(savedService._id);
    console.log('🧹 Servicio de prueba eliminado');
    
    console.log('\n🎉 ¡CONEXIÓN Y OPERACIONES EXITOSAS!');
    console.log('\n💡 CONFIGURACIÓN PARA TU APLICACIÓN:');
    console.log('📝 Variables de entorno:');
    console.log('   MONGODB_URI=mongodb://mongo:cJrciyxmQIhPvZXGZFKKuOeBuXLjiwtD@interchange.proxy.rlwy.net:30276/dental-clinic');
    console.log('   DATABASE_URL=mongodb://mongo:cJrciyxmQIhPvZXGZFKKuOeBuXLjiwtD@interchange.proxy.rlwy.net:30276/dental-clinic');
    
    console.log('\n🔑 CREDENCIALES DE ACCESO:');
    console.log('   Admin: admin@odontologos.com / Admin@2024!');
    console.log('   Doctor: carlos.mendoza@clinica.com / Doctor123!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el test
if (require.main === module) {
  finalConnectionTest();
}

module.exports = finalConnectionTest; 