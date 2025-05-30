require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

async function checkCredentials() {
  try {
    console.log('🔐 VERIFICANDO CREDENCIALES EN LA BASE DE DATOS...');
    console.log('=' .repeat(60));
    
    // Conectar a la base de datos
    await connectDB();
    
    // Obtener todos los usuarios
    const users = await User.find({}).select('name email role password');
    
    console.log(`\n👥 USUARIOS ENCONTRADOS: ${users.length}`);
    console.log('-'.repeat(60));
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n${i + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Rol: ${user.role}`);
      console.log(`   🔑 Password hash: ${user.password ? 'Sí' : 'No'}`);
      
      // Verificar si es el admin
      if (user.role === 'admin') {
        console.log(`   🎯 USUARIO ADMIN PRINCIPAL`);
        
        // Probar la contraseña del admin
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024!';
        console.log(`   🧪 Probando contraseña: ${adminPassword}`);
        
        if (user.password) {
          const isValidPassword = await bcrypt.compare(adminPassword, user.password);
          console.log(`   ✅ Contraseña válida: ${isValidPassword ? 'SÍ' : 'NO'}`);
          
          if (!isValidPassword) {
            console.log(`   ⚠️  La contraseña en .env no coincide con la BD`);
          }
        } else {
          console.log(`   ❌ Usuario sin contraseña hash`);
        }
      }
    }
    
    console.log('\n🔍 CREDENCIALES PARA LOGIN:');
    console.log('-'.repeat(60));
    console.log('📧 Email: admin@odontologos.com');
    console.log('🔑 Password: Admin@2024!');
    
    console.log('\n🌐 CONFIGURACIÓN DEL FRONTEND:');
    console.log('-'.repeat(60));
    console.log('🔗 Backend URL: http://localhost:5001');
    console.log('🔗 Frontend URL: http://localhost:3001');
    console.log('📡 API Base: http://localhost:5001/api');
    
    // Verificar si el backend está ejecutándose
    console.log('\n🚀 VERIFICANDO BACKEND:');
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch('http://localhost:5001/api/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend está ejecutándose');
        console.log(`   📊 Status: ${data.status}`);
        console.log(`   🕐 Timestamp: ${data.timestamp}`);
      } else {
        console.log('❌ Backend responde pero con error');
      }
    } catch (error) {
      console.log('❌ Backend NO está ejecutándose');
      console.log('💡 Ejecuta: npm start (en otra terminal)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  checkCredentials();
}

module.exports = checkCredentials; 