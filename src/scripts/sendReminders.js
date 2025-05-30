const mongoose = require('mongoose');
const Appointment = require('../models/appointment.model');
const EmailService = require('../utils/emailService');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function sendReminders() {
  try {
    // Get tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find appointments for tomorrow that haven't had reminders sent
    const appointments = await Appointment.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: { $in: ['scheduled', 'confirmed'] },
      'reminder.sent': { $ne: true }
    })
    .populate('patient', 'name email phone')
    .populate('doctor', 'name')
    .populate('service', 'name duration price');

    console.log(`Found ${appointments.length} appointments to send reminders for`);

    // Send reminders
    for (const appointment of appointments) {
      if (appointment.patient.email) {
        try {
          await EmailService.sendAppointmentReminder(
            appointment,
            appointment.patient,
            appointment.doctor,
            appointment.service
          );

          // Update appointment to mark reminder as sent
          await Appointment.findByIdAndUpdate(appointment._id, {
            $set: {
              'reminder.sent': true,
              'reminder.scheduledFor': new Date()
            }
          });

          console.log(`Sent reminder for appointment ${appointment._id}`);
        } catch (error) {
          console.error(`Error sending reminder for appointment ${appointment._id}:`, error);
        }
      }
    }

    console.log('Finished sending reminders');
  } catch (error) {
    console.error('Error in sendReminders:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
sendReminders(); 