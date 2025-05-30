const mongoose = require('mongoose');
require('dotenv').config();

// Importar el modelo de Service
const Service = require('../models/service.model');

// Servicios dentales completos para la clínica
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

async function seedServicesCloud() {
  try {
    // Conectar a MongoDB Atlas usando la variable de entorno
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error('❌ Error: No se encontró MONGODB_URI o DATABASE_URL en las variables de entorno');
      console.log('💡 Asegúrate de tener configurada la variable MONGODB_URI con tu string de conexión de MongoDB Atlas');
      process.exit(1);
    }

    console.log('🔄 Conectando a MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado exitosamente a MongoDB Atlas');

    // Verificar si ya existen servicios
    const existingServices = await Service.countDocuments();
    console.log(`📊 Servicios existentes en la base de datos: ${existingServices}`);

    if (existingServices > 0) {
      console.log('⚠️  Ya existen servicios en la base de datos.');
      console.log('🔄 Eliminando servicios existentes para evitar duplicados...');
      await Service.deleteMany({});
      console.log('✅ Servicios existentes eliminados');
    }

    // Insertar los nuevos servicios
    console.log('🔄 Insertando servicios en MongoDB Atlas...');
    const insertedServices = await Service.insertMany(services);
    
    console.log('✅ ¡Servicios insertados exitosamente en MongoDB Atlas!');
    console.log(`📊 Total de servicios creados: ${insertedServices.length}`);
    
    // Mostrar resumen de servicios creados
    console.log('\n📋 SERVICIOS CREADOS:');
    insertedServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} - $${service.price} (${service.category})`);
    });

    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log('💡 Los servicios están ahora disponibles en tu aplicación');

  } catch (error) {
    console.error('❌ Error al insertar servicios:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Verifica tus credenciales de MongoDB Atlas');
    } else if (error.message.includes('network')) {
      console.log('💡 Verifica tu conexión a internet y la configuración de red de MongoDB Atlas');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Verifica que tu IP esté en la whitelist de MongoDB Atlas');
    }
    
    process.exit(1);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
if (require.main === module) {
  seedServicesCloud();
}

module.exports = seedServicesCloud; 