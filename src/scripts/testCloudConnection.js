const mongoose = require('mongoose');

async function testCloudConnection() {
  // URLs a probar
  const connectionUrls = [
    // Sin especificar base de datos
    'mongodb://mongo:cJrciyxmQIhPvZXGZFKKuOeBuXLjiwtD@interchange.proxy.rlwy.net:30276',
    // Con base de datos específica
    'mongodb://mongo:cJrciyxmQIhPvZXGZFKKuOeBuXLjiwtD@interchange.proxy.rlwy.net:30276/dental-clinic'
  ];
  
  for (let i = 0; i < connectionUrls.length; i++) {
    const mongoUri = connectionUrls[i];
    const hasDatabase = mongoUri.includes('/dental-clinic');
    
    try {
      console.log(`\n🔄 Probando conexión ${i + 1}/${connectionUrls.length}...`);
      console.log(`📍 URI: ${mongoUri.replace(/:[^:@]*@/, ':****@')}`);
      console.log(`📊 Base de datos: ${hasDatabase ? 'dental-clinic' : 'default'}`);
      
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
      
      console.log('✅ ¡Conectado exitosamente a MongoDB en Railway!');
      
      // Probar operaciones básicas
      console.log('\n🔍 Probando operaciones básicas...');
      
      // Listar bases de datos
      const admin = mongoose.connection.db.admin();
      const dbs = await admin.listDatabases();
      console.log('📊 Bases de datos disponibles:', dbs.databases.map(db => `${db.name} (${(db.sizeOnDisk / 1024).toFixed(2)} KB)`));
      
      // Si no estamos conectados a dental-clinic, cambiar a esa base de datos
      let targetDb;
      if (!hasDatabase) {
        console.log('\n🔄 Cambiando a base de datos dental-clinic...');
        targetDb = mongoose.connection.db.db('dental-clinic');
      } else {
        targetDb = mongoose.connection.db;
      }
      
      // Listar colecciones en dental-clinic
      const collections = await targetDb.listCollections().toArray();
      console.log('📋 Colecciones en dental-clinic:', collections.map(col => col.name));
      
      // Contar documentos en cada colección
      if (collections.length > 0) {
        console.log('\n📊 Documentos por colección:');
        for (const collection of collections) {
          const count = await targetDb.collection(collection.name).countDocuments();
          console.log(`   • ${collection.name}: ${count} documentos`);
        }
      } else {
        console.log('📋 No hay colecciones en dental-clinic (base de datos vacía)');
      }
      
      // Probar una operación de escritura simple
      console.log('\n🧪 Probando operación de escritura...');
      const testCollection = targetDb.collection('connection_test');
      const testDoc = { 
        message: 'Test de conexión exitoso', 
        timestamp: new Date(),
        from: 'local_script',
        connection_url: hasDatabase ? 'con_database' : 'sin_database'
      };
      
      const insertResult = await testCollection.insertOne(testDoc);
      console.log('✅ Documento de prueba insertado:', insertResult.insertedId);
      
      // Leer el documento insertado
      const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
      console.log('✅ Documento leído:', foundDoc.message);
      
      // Limpiar el documento de prueba
      await testCollection.deleteOne({ _id: insertResult.insertedId });
      console.log('🧹 Documento de prueba eliminado');
      
      console.log('\n🎉 ¡Conexión y operaciones exitosas!');
      console.log('💡 La base de datos en Railway está funcionando correctamente');
      
      // Si llegamos aquí, la conexión fue exitosa
      break;
      
    } catch (error) {
      console.error(`❌ Error con URL ${i + 1}:`);
      console.error('   Mensaje:', error.message);
      
      if (error.message.includes('ENOTFOUND')) {
        console.log('   💡 Hostname no encontrado - verificar URL');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('   💡 Conexión rechazada - verificar puerto y firewall');
      } else if (error.message.includes('Authentication failed')) {
        console.log('   💡 Error de autenticación - verificar credenciales');
      } else if (error.message.includes('timeout')) {
        console.log('   💡 Timeout de conexión - verificar conectividad de red');
      }
      
      // Si es la última URL, mostrar ayuda
      if (i === connectionUrls.length - 1) {
        console.log('\n🔧 Posibles soluciones:');
        console.log('   1. Verificar que el servicio MongoDB esté activo en Railway');
        console.log('   2. Verificar las credenciales de conexión');
        console.log('   3. Verificar la conectividad de red');
        console.log('   4. Intentar desde el CLI de Railway: railway connect MongoDB');
      }
      
    } finally {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
      }
    }
  }
}

// Ejecutar el test
if (require.main === module) {
  testCloudConnection();
}

module.exports = testCloudConnection; 