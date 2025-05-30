require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('🔐 RESETEANDO CONTRASEÑA DEL ADMIN...');
    console.log('=' .repeat(50));
    
    // Conectar a la base de datos
    await connectDB();
    
    // Buscar el usuario admin
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ No se encontró usuario admin');
      return;
    }
    
    console.log(`\n👤 Admin encontrado: ${admin.name} (${admin.email})`);
    
    // Nueva contraseña desde .env
    const newPassword = process.env.ADMIN_PASSWORD || 'Admin@2024!';
    console.log(`🔑 Nueva contraseña: ${newPassword}`);
    
    // Hashear la nueva contraseña
    console.log('\n🔄 Hasheando nueva contraseña...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Actualizar la contraseña en la base de datos
    console.log('💾 Actualizando contraseña en la base de datos...');
    await User.findByIdAndUpdate(admin._id, { 
      password: hashedPassword 
    });
    
    // Verificar que la actualización fue exitosa
    console.log('🧪 Verificando nueva contraseña...');
    const updatedAdmin = await User.findById(admin._id);
    const isValidPassword = await bcrypt.compare(newPassword, updatedAdmin.password);
    
    if (isValidPassword) {
      console.log('✅ ¡CONTRASEÑA ACTUALIZADA EXITOSAMENTE!');
      console.log('\n🎉 CREDENCIALES PARA LOGIN:');
      console.log('-'.repeat(40));
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Password: ${newPassword}`);
      console.log('-'.repeat(40));
      console.log('🌐 URL del dashboard: http://localhost:3001/login');
    } else {
      console.log('❌ Error: La verificación de contraseña falló');
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
  resetAdminPassword();
}

module.exports = resetAdminPassword; 