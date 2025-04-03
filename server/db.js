const { Client } = require('pg');

//postgre connection.
const client = new Client({
  host: 'localhost',
  port: 5432, 
  user: 'postgres', 
  password: 'bruh', 
  database: 'uncgev' 
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database!'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;
