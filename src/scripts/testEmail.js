require('dotenv').config();
const EmailService = require('../utils/emailService');

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('API Key configured:', process.env.RESEND_API_KEY ? 'Yes (length: ' + process.env.RESEND_API_KEY.length + ')' : 'No');
    console.log('Sender Email:', process.env.RESEND_SENDER_EMAIL);
    console.log('Sender Name:', process.env.RESEND_SENDER_NAME);

    // Test data
    const testData = {
        appointment: {
            date: new Date(),
            duration: 30
        },
        patient: {
            name: 'Test Patient',
            email: 'gommaria902@gmail.com'
        },
        doctor: {
            name: 'Dr. Test'
        },
        service: {
            name: 'Consulta de Prueba'
        }
    };

    console.log('\nSending test email...');
    try {
        const result = await EmailService.sendAppointmentConfirmation(
            testData.appointment,
            testData.patient,
            testData.doctor,
            testData.service
        );
        console.log(result ? 'Test email sent successfully!' : 'Failed to send test email');
    } catch (error) {
        console.error('Error sending email:', error);
        console.log('Failed to send test email');
    }
}

testEmail(); 