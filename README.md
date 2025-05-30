# Dental Clinic Dashboard Backend

Backend API for the dental clinic management dashboard. Built with Node.js, Express, and MongoDB.

## Features

- User Authentication & Authorization
- Patient Management
- Appointment Scheduling
- Service Management
- Role-based Access Control

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dashboard-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost/dental-clinic
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h
```

## MongoDB Setup

1. Install MongoDB on your system:
   - macOS (using Homebrew): `brew install mongodb-community`
   - Windows: Download and install from [MongoDB Website](https://www.mongodb.com/try/download/community)
   - Linux: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. Start MongoDB service:
   - macOS: `brew services start mongodb-community`
   - Windows: MongoDB runs as a service automatically
   - Linux: `sudo systemctl start mongod`

3. Verify MongoDB is running:
```bash
mongosh
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Patients
- GET `/api/pacientes` - Get all patients
- GET `/api/pacientes/:id` - Get single patient
- POST `/api/pacientes` - Create new patient
- PUT `/api/pacientes/:id` - Update patient
- DELETE `/api/pacientes/:id` - Delete patient
- GET `/api/pacientes/search/:query` - Search patients

### Appointments
- GET `/api/turnos` - Get all appointments
- GET `/api/turnos/range` - Get appointments by date range
- GET `/api/turnos/:id` - Get single appointment
- POST `/api/turnos` - Create new appointment
- PUT `/api/turnos/:id` - Update appointment
- PATCH `/api/turnos/:id/cancel` - Cancel appointment
- GET `/api/turnos/patient/:patientId` - Get appointments by patient
- GET `/api/turnos/doctor/:doctorId` - Get appointments by doctor

### Services
- GET `/api/servicios` - Get all services
- GET `/api/servicios/:id` - Get service by ID
- POST `/api/servicios` - Create new service
- PUT `/api/servicios/:id` - Update service
- DELETE `/api/servicios/:id` - Delete service
- GET `/api/servicios/category/:category` - Get services by category

## Authentication

The API uses JWT for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in JSON format:

```json
{
  "message": "Error message here"
}
```

## Database Schema

### Users
```javascript
{
  email: String,
  password: String (hashed),
  name: String,
  role: String (enum: ['admin', 'doctor', 'staff']),
  active: Boolean
}
```

### Patients
```javascript
{
  name: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  medicalHistory: {
    allergies: [String],
    conditions: [String],
    medications: [String],
    notes: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  lastVisit: Date,
  nextAppointment: Date,
  status: String
}
```

### Appointments
```javascript
{
  patient: ObjectId (ref: 'Patient'),
  doctor: ObjectId (ref: 'User'),
  service: ObjectId (ref: 'Service'),
  date: Date,
  duration: Number,
  status: String,
  notes: String,
  paymentStatus: String,
  amount: Number
}
```

### Services
```javascript
{
  name: String,
  description: String,
  duration: Number,
  price: Number,
  category: String,
  active: Boolean,
  requiredEquipment: [String],
  notes: String
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Author

Gabriel Fontenla

## License

ISC 