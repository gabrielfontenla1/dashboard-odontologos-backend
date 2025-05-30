const mongoose = require('mongoose');

async function verifyDatabases() {
  try {
    console.log('🔄 Conectando a MongoDB en Railway...');
    
    // Conectar sin especificar base de datos
    await mongoose.connect('mongodb://mongo:cJrciyxmQIhPvZXGZFKKuOeBuXLjiwtD@interchange.proxy.rlwy.net:30276', {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    console.log('✅ Conectado exitosamente a MongoDB en Railway');
    
    // Listar todas las bases de datos
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('\n📊 Bases de datos disponibles:');
    dbs.databases.forEach(db => {
      console.log(`   • ${db.name} (${(db.sizeOnDisk / 1024).toFixed(2)} KB)`);
    });
    
    // Verificar base de datos 'test'
    console.log('\n🔍 VERIFICANDO BASE DE DATOS "test":');
    const testDb = mongoose.connection.client.db('test');
    const testCollections = await testDb.listCollections().toArray();
    
    if (testCollections.length > 0) {
      console.log('📋 Colecciones en test:', testCollections.map(col => col.name));
      for (const collection of testCollections) {
        const count = await testDb.collection(collection.name).countDocuments();
        console.log(`   • ${collection.name}: ${count} documentos`);
      }
    } else {
      console.log('📋 No hay colecciones en test');
    }
    
    // Verificar base de datos 'dental-clinic'
    console.log('\n🔍 VERIFICANDO BASE DE DATOS "dental-clinic":');
    const dentalDb = mongoose.connection.client.db('dental-clinic');
    const dentalCollections = await dentalDb.listCollections().toArray();
    
    if (dentalCollections.length > 0) {
      console.log('📋 Colecciones en dental-clinic:', dentalCollections.map(col => col.name));
      for (const collection of dentalCollections) {
        const count = await dentalDb.collection(collection.name).countDocuments();
        console.log(`   • ${collection.name}: ${count} documentos`);
      }
    } else {
      console.log('📋 No hay colecciones en dental-clinic (base de datos vacía)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
if (require.main === module) {
  verifyDatabases();
}

module.exports = verifyDatabases; 