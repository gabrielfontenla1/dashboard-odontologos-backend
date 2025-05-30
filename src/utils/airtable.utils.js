const { base } = require('../config/airtable');

// Convert Airtable record to our format
const formatRecord = (record) => ({
    id: record.id,
    ...record.fields
});

// Get all records from a table
const getAllRecords = async (table, filterByFormula = '') => {
    try {
        const records = await base(table)
            .select({
                filterByFormula,
                maxRecords: 1000,
                view: 'Grid view'
            })
            .all();
        return records.map(formatRecord);
    } catch (error) {
        console.error(`Error fetching records from ${table}:`, error);
        throw error;
    }
};

// Get a single record by ID
const getRecordById = async (table, id) => {
    try {
        const record = await base(table).find(id);
        return formatRecord(record);
    } catch (error) {
        console.error(`Error fetching record from ${table}:`, error);
        throw error;
    }
};

// Create a new record
const createRecord = async (table, fields) => {
    try {
        const records = await base(table).create([{ fields }]);
        return formatRecord(records[0]);
    } catch (error) {
        console.error(`Error creating record in ${table}:`, error);
        throw error;
    }
};

// Update a record
const updateRecord = async (table, id, fields) => {
    try {
        const records = await base(table).update([
            {
                id,
                fields
            }
        ]);
        return formatRecord(records[0]);
    } catch (error) {
        console.error(`Error updating record in ${table}:`, error);
        throw error;
    }
};

// Delete a record
const deleteRecord = async (table, id) => {
    try {
        const records = await base(table).destroy([id]);
        return formatRecord(records[0]);
    } catch (error) {
        console.error(`Error deleting record from ${table}:`, error);
        throw error;
    }
};

// Search records
const searchRecords = async (table, formula) => {
    try {
        const records = await base(table)
            .select({
                filterByFormula: formula,
                maxRecords: 100,
                view: 'Grid view'
            })
            .all();
        return records.map(formatRecord);
    } catch (error) {
        console.error(`Error searching records in ${table}:`, error);
        throw error;
    }
};

module.exports = {
    getAllRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    formatRecord
}; 