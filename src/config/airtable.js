const Airtable = require('airtable');

// Configure Airtable
Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY
});

// Initialize base
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Table names
const TABLES = {
    USERS: 'Users',
    PATIENTS: 'Patients',
    APPOINTMENTS: 'Appointments',
    SERVICES: 'Services'
};

// Field mappings for each table
const FIELDS = {
    USERS: {
        EMAIL: 'Email',
        NAME: 'Name',
        PASSWORD: 'Password',
        ROLE: 'Role',
        ACTIVE: 'Active'
    },
    PATIENTS: {
        NAME: 'Name',
        EMAIL: 'Email',
        PHONE: 'Phone',
        DATE_OF_BIRTH: 'DateOfBirth',
        ADDRESS: 'Address',
        MEDICAL_HISTORY: 'MedicalHistory',
        INSURANCE_INFO: 'InsuranceInfo',
        LAST_VISIT: 'LastVisit',
        NEXT_APPOINTMENT: 'NextAppointment',
        STATUS: 'Status'
    },
    APPOINTMENTS: {
        PATIENT: 'Patient',
        DOCTOR: 'Doctor',
        SERVICE: 'Service',
        DATE: 'Date',
        DURATION: 'Duration',
        STATUS: 'Status',
        NOTES: 'Notes',
        PAYMENT_STATUS: 'PaymentStatus',
        AMOUNT: 'Amount',
        REMINDER_SENT: 'ReminderSent',
        REMINDER_DATE: 'ReminderDate'
    },
    SERVICES: {
        NAME: 'Name',
        DESCRIPTION: 'Description',
        DURATION: 'Duration',
        PRICE: 'Price',
        CATEGORY: 'Category',
        ACTIVE: 'Active',
        REQUIRED_EQUIPMENT: 'RequiredEquipment',
        NOTES: 'Notes'
    }
};

module.exports = {
    base,
    TABLES,
    FIELDS
}; 