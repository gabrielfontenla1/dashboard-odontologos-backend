const mongoose = require('mongoose');
const Service = require('../models/service.model');

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic');
    console.log('Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Create services that match the landing page
    const services = [
      {
        name: 'Limpieza Dental',
        description: 'Limpieza profesional y profilaxis dental',
        duration: 60,
        price: 80,
        category: 'general',
        active: true,
        requiredEquipment: ['Ultrasonido', 'Curetas'],
        notes: 'Incluye fluorización'
      },
      {
        name: 'Consulta General',
        description: 'Evaluación general y diagnóstico',
        duration: 30,
        price: 50,
        category: 'general',
        active: true,
        requiredEquipment: ['Espejo dental', 'Sonda'],
        notes: 'Incluye radiografías si es necesario'
      },
      {
        name: 'Ortodoncia',
        description: 'Tratamiento de alineación dental',
        duration: 45,
        price: 150,
        category: 'orthodontics',
        active: true,
        requiredEquipment: ['Brackets', 'Arcos'],
        notes: 'Consulta inicial incluye plan de tratamiento'
      },
      {
        name: 'Atención de Urgencia',
        description: 'Atención inmediata para emergencias dentales',
        duration: 30,
        price: 100,
        category: 'general',
        active: true,
        requiredEquipment: ['Kit de emergencia'],
        notes: 'Disponible fuera de horario regular'
      },
      {
        name: 'Endodoncia',
        description: 'Tratamiento de conducto radicular',
        duration: 90,
        price: 200,
        category: 'surgery',
        active: true,
        requiredEquipment: ['Limas endodónticas', 'Localizador de ápice'],
        notes: 'Puede requerir múltiples sesiones'
      },
      {
        name: 'Blanqueamiento Dental',
        description: 'Tratamiento estético de blanqueamiento',
        duration: 60,
        price: 120,
        category: 'cosmetic',
        active: true,
        requiredEquipment: ['Gel blanqueador', 'Lámpara LED'],
        notes: 'Incluye kit para casa'
      },
      {
        name: 'Extracción Dental',
        description: 'Extracción simple o quirúrgica',
        duration: 45,
        price: 80,
        category: 'surgery',
        active: true,
        requiredEquipment: ['Fórceps', 'Elevadores'],
        notes: 'Incluye medicación post-operatoria'
      },
      {
        name: 'Implante Dental',
        description: 'Colocación de implante dental',
        duration: 120,
        price: 800,
        category: 'surgery',
        active: true,
        requiredEquipment: ['Implante titanio', 'Kit quirúrgico'],
        notes: 'Incluye corona provisional'
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`Created ${createdServices.length} services:`);
    createdServices.forEach(service => {
      console.log(`- ${service.name} (${service.category}) - $${service.price}`);
    });

    console.log('Services seeded successfully');
  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
if (require.main === module) {
  seedServices();
}

module.exports = seedServices; 