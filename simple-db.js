// simple-db.js - CREATE THIS FILE IN SAME FOLDER AS index.js
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database file
const initializeDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    console.log('📁 Created new database file');
  }
};

initializeDB();

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading database:', error);
    return { users: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing to database:', error);
    return false;
  }
};

const addUser = (user) => {
  const db = readDB();
  user.id = Date.now().toString();
  user.createdAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  db.users.push(user);
  
  if (writeDB(db)) {
    console.log('✅ User saved to file database:', user.email);
    return user;
  } else {
    throw new Error('Failed to save user to file database');
  }
};

const findUserByEmail = (email) => {
  const db = readDB();
  return db.users.find(user => user.email === email.toLowerCase());
};

const getAllUsers = () => {
  return readDB().users;
};

const getUsersCount = () => {
  return readDB().users.length;
};

module.exports = { 
  addUser, 
  findUserByEmail, 
  getAllUsers, 
  getUsersCount,
  readDB 
};