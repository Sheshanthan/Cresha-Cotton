const mongoose = require('mongoose');

const initDatabase = async () => {
  try {
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Check if users collection exists
    const collections = await db.listCollections().toArray();
    const usersCollectionExists = collections.some(col => col.name === 'users');
    
    if (usersCollectionExists) {
      console.log('Users collection exists, checking indexes...');
      
      // Get existing indexes
      const indexes = await db.collection('users').indexes();
      console.log('Existing indexes:', indexes);
      
      // Drop any problematic indexes (like username unique index)
      for (const index of indexes) {
        if (index.name === 'username_1' || index.name === 'email_1') {
          console.log(`Dropping index: ${index.name}`);
          await db.collection('users').dropIndex(index.name);
        }
      }
      
      // Create new indexes for our schema
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('Created new email unique index');
      
    } else {
      console.log('Users collection does not exist, will be created automatically');
    }
    
    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = initDatabase; 