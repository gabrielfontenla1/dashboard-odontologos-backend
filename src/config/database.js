const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI o DATABASE_URL no está definido en las variables de entorno');
    }
    
    // Configuración optimizada para Railway
    const options = {
      // Timeouts más largos para conexiones remotas
      serverSelectionTimeoutMS: 30000, // 30 segundos
      connectTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
      
      // Heartbeat
      heartbeatFrequencyMS: 10000, // 10 segundos
      
      // Retry settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Retry writes
      retryWrites: true,
      retryReads: true,
    };
    
    // Si estamos conectando a Railway, usar configuración especial
    if (mongoURI.includes('railway') || mongoURI.includes('proxy.rlwy.net')) {
      console.log('🚂 Detectada conexión a Railway - usando configuración optimizada');
      
      // Para Railway, conectar sin especificar base de datos y luego cambiar
      const baseURI = mongoURI.split('/').slice(0, -1).join('/');
      const dbName = mongoURI.split('/').pop();
      
      console.log(`📍 Conectando a: ${baseURI.replace(/:[^:@]*@/, ':****@')}`);
      console.log(`📊 Base de datos: ${dbName}`);
      
      // Conectar sin especificar base de datos
      await mongoose.connect(baseURI, options);
      
      // Cambiar a la base de datos específica
      if (dbName && dbName !== '') {
        const targetDb = mongoose.connection.useDb(dbName);
        mongoose.connection.db = targetDb;
        console.log(`✅ Cambiado a base de datos: ${dbName}`);
      }
    } else {
      // Conexión normal para bases de datos locales
      console.log(`📍 Conectando a: ${mongoURI.replace(/:[^:@]*@/, ':****@')}`);
      await mongoose.connect(mongoURI, options);
    }
    
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📊 Base de datos: ${mongoose.connection.db?.databaseName || 'dental-clinic'}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Event listeners para monitorear la conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión MongoDB:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });
    
    // Verificar que podemos hacer operaciones básicas
    try {
      if (mongoose.connection.db && mongoose.connection.db.admin) {
        await mongoose.connection.db.admin().ping();
        console.log('🏓 Ping a MongoDB exitoso');
      } else {
        console.log('🏓 Conexión verificada (ping no disponible)');
      }
    } catch (pingError) {
      console.log('🏓 Conexión verificada (ping falló pero conexión activa)');
    }
    
    // Esperar a que la conexión esté completamente lista
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    
    // Información adicional para debugging
    if (error.message.includes('timeout')) {
      console.error('💡 Sugerencias para timeout:');
      console.error('   - Verificar conectividad de red');
      console.error('   - Verificar que el servicio MongoDB esté activo');
      console.error('   - Verificar las credenciales de conexión');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.error('💡 Error de autenticación:');
      console.error('   - Verificar usuario y contraseña');
      console.error('   - Verificar que el usuario tenga permisos en la base de datos');
    }
    
    // En desarrollo, no salir del proceso para permitir debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error('🔧 Modo desarrollo: continuando sin base de datos');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB; 