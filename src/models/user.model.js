const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return this.role === 'admin'; // La contraseña solo es requerida para el admin
    }
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    },
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'staff'],
    default: 'staff'
  },
  active: {
    type: Boolean,
    default: true
  },
  photo: {
    type: String,
    default: null // URL o path de la foto
  },
  // Doctor specific fields
  specialization: {
    type: [String],
    default: [],
    required: function() {
      return this.role === 'doctor';
    }
  },
  primarySpecialization: {
    type: String,
    required: false, // Opcional, puede no estar definido
    validate: {
      validator: function(value) {
        // Si se define primarySpecialization, debe estar en la lista de specialization
        if (value && this.specialization && this.specialization.length > 0) {
          return this.specialization.includes(value);
        }
        return true; // Si no hay valor o no hay especializations, es válido
      },
      message: 'La especialidad principal debe estar incluida en la lista de especialidades'
    }
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    }
  },
  experience: {
    type: Number,
    required: function() {
      return this.role === 'doctor';
    }
  },
  availability: {
    type: Map,
    of: {
      isAvailable: Boolean,
      schedules: [{
        start: String,
        end: String
      }]
    },
    default: new Map()
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 