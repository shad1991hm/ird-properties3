import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3.Database(path.join(__dirname, 'ird_properties.db'));

console.log('Starting database migration...');

db.serialize(() => {
  // Check if the model_19_number column exists in properties table
  db.get("PRAGMA table_info(properties)", (err, rows) => {
    if (err) {
      console.error('Error checking properties table structure:', err);
      return;
    }
    
    // Get all column names from properties table
    db.all("PRAGMA table_info(properties)", (err, columns) => {
      if (err) {
        console.error('Error getting properties column info:', err);
        return;
      }
      
      const columnNames = columns.map(col => col.name);
      
      if (!columnNames.includes('model_19_number')) {
        console.log('Adding model_19_number column to properties table...');
        
        // Add the new column to properties table
        db.run("ALTER TABLE properties ADD COLUMN model_19_number TEXT NOT NULL DEFAULT ''", (err) => {
          if (err) {
            console.error('Error adding column to properties table:', err);
          } else {
            console.log('Successfully added model_19_number column to properties table');
            
            // Update existing records to have a default value
            db.run("UPDATE properties SET model_19_number = model_number WHERE model_19_number = ''", (err) => {
              if (err) {
                console.error('Error updating existing properties records:', err);
              } else {
                console.log('Successfully updated existing properties records with default model_19_number values');
              }
            });
          }
        });
      } else {
        console.log('model_19_number column already exists in properties table');
      }
    });
  });

  // Check if the model_19_number column exists in issued_properties table
  db.get("PRAGMA table_info(issued_properties)", (err, rows) => {
    if (err) {
      console.error('Error checking issued_properties table structure:', err);
      return;
    }
    
    // Get all column names from issued_properties table
    db.all("PRAGMA table_info(issued_properties)", (err, columns) => {
      if (err) {
        console.error('Error getting issued_properties column info:', err);
        return;
      }
      
      const columnNames = columns.map(col => col.name);
      
      if (!columnNames.includes('model_19_number')) {
        console.log('Adding model_19_number column to issued_properties table...');
        
        // Add the new column to issued_properties table
        db.run("ALTER TABLE issued_properties ADD COLUMN model_19_number TEXT NOT NULL DEFAULT ''", (err) => {
          if (err) {
            console.error('Error adding column to issued_properties table:', err);
          } else {
            console.log('Successfully added model_19_number column to issued_properties table');
            
            // Update existing records to have a default value
            db.run("UPDATE issued_properties SET model_19_number = model_number WHERE model_19_number = ''", (err) => {
              if (err) {
                console.error('Error updating existing issued_properties records:', err);
              } else {
                console.log('Successfully updated existing issued_properties records with default model_19_number values');
              }
            });
          }
        });
      } else {
        console.log('model_19_number column already exists in issued_properties table');
      }
    });
  });

  // Check if the model_22_number column exists in issued_properties table
  db.get("PRAGMA table_info(issued_properties)", (err, rows) => {
    if (err) {
      console.error('Error checking issued_properties table structure:', err);
      return;
    }
    db.all("PRAGMA table_info(issued_properties)", (err, columns) => {
      if (err) {
        console.error('Error getting issued_properties column info:', err);
        return;
      }
      const columnNames = columns.map(col => col.name);
      if (!columnNames.includes('model_22_number')) {
        console.log('Adding model_22_number column to issued_properties table...');
        db.run("ALTER TABLE issued_properties ADD COLUMN model_22_number TEXT NOT NULL DEFAULT ''", (err) => {
          if (err) {
            console.error('Error adding column to issued_properties table:', err);
          } else {
            console.log('Successfully added model_22_number column to issued_properties table');
          }
        });
      } else {
        console.log('model_22_number column already exists in issued_properties table');
      }
    });
  });
});

// Close the database connection after migration
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database migration completed successfully');
    }
  });
}, 3000); 