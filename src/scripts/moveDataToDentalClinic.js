const mongoose = require('mongoose');

async function moveDataToDentalClinic() {
  try {
    console.log('🔄 Conectando a MongoDB en Railway...');
    
    // Conectar sin especificar base de datos
    await mongoose.connect('mongodb://mongo:cJrciyxmQIhPvZXGZFKKuOeBuXLjiwtD@interchange.proxy.rlwy.net:30276', {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    console.log('✅ Conectado exitosamente a MongoDB en Railway');
    
    // Obtener referencias a las bases de datos
    const testDb = mongoose.connection.client.db('test');
    const dentalDb = mongoose.connection.client.db('dental-clinic');
    
    console.log('\n🔄 Moviendo datos de "test" a "dental-clinic"...');
    
    // Colecciones a mover
    const collectionsToMove = ['users', 'services', 'patients'];
    
    for (const collectionName of collectionsToMove) {
      console.log(`\n📋 Procesando colección: ${collectionName}`);
      
      // Obtener todos los documentos de la colección en test
      const sourceCollection = testDb.collection(collectionName);
      const documents = await sourceCollection.find({}).toArray();
      
      console.log(`   📊 Encontrados ${documents.length} documentos en test.${collectionName}`);
      
      if (documents.length > 0) {
        // Limpiar la colección en dental-clinic
        const targetCollection = dentalDb.collection(collectionName);
        await targetCollection.deleteMany({});
        console.log(`   🧹 Limpiada colección dental-clinic.${collectionName}`);
        
        // Insertar documentos en dental-clinic
        await targetCollection.insertMany(documents);
        console.log(`   ✅ Insertados ${documents.length} documentos en dental-clinic.${collectionName}`);
        
        // Verificar la inserción
        const insertedCount = await targetCollection.countDocuments();
        console.log(`   ✓ Verificación: ${insertedCount} documentos en dental-clinic.${collectionName}`);
      } else {
        console.log(`   ⚠️ No hay documentos para mover en ${collectionName}`);
      }
    }
    
    // Verificar el resultado final
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    
    console.log('\n📊 BASE DE DATOS "test":');
    for (const collectionName of collectionsToMove) {
      const count = await testDb.collection(collectionName).countDocuments();
      console.log(`   • ${collectionName}: ${count} documentos`);
    }
    
    console.log('\n📊 BASE DE DATOS "dental-clinic":');
    for (const collectionName of collectionsToMove) {
      const count = await dentalDb.collection(collectionName).countDocuments();
      console.log(`   • ${collectionName}: ${count} documentos`);
    }
    
    // Mostrar algunos datos de ejemplo
    console.log('\n🔍 DATOS DE EJEMPLO EN DENTAL-CLINIC:');
    
    // Mostrar usuarios
    const users = await dentalDb.collection('users').find({}).limit(3).toArray();
    console.log('\n👥 Usuarios:');
    users.forEach(user => {
      console.log(`   • ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Mostrar servicios
    const services = await dentalDb.collection('services').find({}).limit(3).toArray();
    console.log('\n🦷 Servicios:');
    services.forEach(service => {
      console.log(`   • ${service.name} - $${service.price} (${service.category})`);
    });
    
    // Mostrar pacientes
    const patients = await dentalDb.collection('patients').find({}).limit(3).toArray();
    console.log('\n🏥 Pacientes:');
    patients.forEach(patient => {
      console.log(`   • ${patient.name} - ${patient.documentType}: ${patient.documentNumber}`);
    });
    
    console.log('\n🎉 ¡DATOS MOVIDOS EXITOSAMENTE A DENTAL-CLINIC!');
    console.log('\n💡 Ahora tu aplicación puede usar la URL:');
    console.log('mongodb://mongo:cJrciyxmQIhPvZXGZFKKuOeBuXLjiwtD@interchange.proxy.rlwy.net:30276/dental-clinic');
    
  } catch (error) {
    console.error('❌ Error al mover datos:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
if (require.main === module) {
  moveDataToDentalClinic();
}

module.exports = moveDataToDentalClinic; 