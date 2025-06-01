const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

const User = require('./src/models/user.model');

async function testPrimarySpecialization() {
  try {
    console.log('\n🧪 Probando campo primarySpecialization...\n');

    // Buscar un doctor existente
    let doctor = await User.findOne({ role: 'doctor' });
    
    if (!doctor) {
      console.log('📝 No hay doctores existentes, creando uno de prueba...');
      doctor = await User.create({
        name: 'Dr. Test Especialidad',
        email: 'test.especialidad@test.com',
        role: 'doctor',
        specialization: ['general', 'orthodontics', 'surgery'],
        licenseNumber: 'TEST123',
        experience: 5,
        active: true
      });
      console.log('✅ Doctor de prueba creado');
    }

    console.log('👨‍⚕️ Doctor encontrado:', doctor.name);
    console.log('🔧 Especialidades actuales:', doctor.specialization);
    console.log('⭐ Especialidad principal actual:', doctor.primarySpecialization || 'No definida');

    // Actualizar con especialidad principal
    const updatedDoctor = await User.findByIdAndUpdate(
      doctor._id,
      { 
        primarySpecialization: doctor.specialization[0] // Usar la primera especialidad
      },
      { new: true, runValidators: true }
    );

    console.log('\n✅ Doctor actualizado exitosamente!');
    console.log('⭐ Nueva especialidad principal:', updatedDoctor.primarySpecialization);

    // Probar validación - intentar poner una especialidad que no está en la lista
    try {
      await User.findByIdAndUpdate(
        doctor._id,
        { primarySpecialization: 'invalid_specialization' },
        { new: true, runValidators: true }
      );
      console.log('❌ ERROR: La validación debería haber fallado');
    } catch (validationError) {
      console.log('✅ Validación funcionando correctamente:', validationError.message);
    }

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

testPrimarySpecialization(); 