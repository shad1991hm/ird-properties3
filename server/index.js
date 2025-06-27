import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: ['https://irdp.sidrakardis.com', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'ird_properties.db'));

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'store_manager')),
      department TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Properties table
  db.run(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      model_number TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      date TEXT NOT NULL,
      company_name TEXT NOT NULL,
      measurement TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      property_type TEXT NOT NULL CHECK (property_type IN ('permanent', 'temporary', 'permanent-temporary')),
      available_quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Property requests table
  db.run(`
    CREATE TABLE IF NOT EXISTS property_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_department TEXT NOT NULL,
      property_id TEXT NOT NULL,
      property_number TEXT NOT NULL,
      property_name TEXT NOT NULL,
      quantity_type TEXT NOT NULL,
      requested_quantity INTEGER NOT NULL,
      approved_quantity INTEGER,
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'adjusted', 'issued')),
      reason TEXT,
      admin_id TEXT,
      store_manager_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      issued_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (property_id) REFERENCES properties (id)
    )
  `);

  // Issued properties table
  db.run(`
    CREATE TABLE IF NOT EXISTS issued_properties (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_department TEXT NOT NULL,
      property_number TEXT NOT NULL,
      property_name TEXT NOT NULL,
      model_number TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      quantity_type TEXT NOT NULL,
      issued_quantity INTEGER NOT NULL,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      store_manager_id TEXT NOT NULL,
      store_manager_name TEXT NOT NULL,
      is_permanent BOOLEAN NOT NULL,
      FOREIGN KEY (request_id) REFERENCES property_requests (id),
      FOREIGN KEY (property_id) REFERENCES properties (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (store_manager_id) REFERENCES users (id)
    )
  `);

  // Insert default users
  const defaultUsers = [
    {
      id: uuidv4(),
      username: 'admin',
      password: bcrypt.hashSync('admin123', 10),
      name: 'Administrator',
      role: 'admin',
      department: 'Property Office',
      email: 'admin@eduird.et'
    },
    {
      id: uuidv4(),
      username: 'user',
      password: bcrypt.hashSync('user123', 10),
      name: 'Sidrak H.',
      role: 'user',
      department: 'ADRD',
      email: 'user@eduird.et'
    },
    {
      id: uuidv4(),
      username: 'store',
      password: bcrypt.hashSync('store123', 10),
      name: 'Store Manager',
      role: 'store_manager',
      department: 'Store Department',
      email: 'store@eduird.et'
    }
  ];

  defaultUsers.forEach(user => {
    db.run(
      'INSERT OR IGNORE INTO users (id, username, password, name, role, department, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.id, user.username, user.password, user.name, user.role, user.department, user.email]
    );
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    
    // Get fresh user data from database
    db.get('SELECT * FROM users WHERE id = ?', [user.id], (dbErr, dbUser) => {
      if (dbErr || !dbUser) {
        return res.sendStatus(403);
      }
      
      const { password, ...userWithoutPassword } = dbUser;
      req.user = userWithoutPassword;
      next();
    });
  });
};

// Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    }
  );
});

// User Management Routes

// Get all users (Admin only)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.all('SELECT id, username, name, role, department, email, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

// Create new user (Admin only)
app.post('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { username, password, name, role, department, email } = req.body;

  // Validate required fields
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'Username, password, name, and role are required' });
  }

  // Validate role
  if (!['admin', 'user', 'store_manager'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const id = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (id, username, password, name, role, department, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, username, hashedPassword, name, role, department || '', email || ''],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, message: 'User created successfully' });
    }
  );
});

// Update user (Admin only for other users, any user for themselves)
app.put('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, department, email, role } = req.body;

  // Check if user is updating their own profile or if they're an admin
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  let query = 'UPDATE users SET name = ?, department = ?, email = ?, updated_at = CURRENT_TIMESTAMP';
  let params = [name, department || '', email || ''];

  // Only admins can change roles
  if (req.user.role === 'admin' && role) {
    if (!['admin', 'user', 'store_manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    query += ', role = ?';
    params.push(role);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Change password
app.put('/api/users/:id/password', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Check if user is changing their own password or if they're an admin
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  // Get current user data
  db.get('SELECT password FROM users WHERE id = ?', [id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If not admin changing someone else's password, verify current password
    if (req.user.id === id && currentPassword && !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Password updated successfully' });
      }
    );
  });
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Get current user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Properties
app.get('/api/properties', authenticateToken, (req, res) => {
  db.all('SELECT * FROM properties ORDER BY created_at DESC', (err, properties) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(properties);
  });
});

app.post('/api/properties', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'store_manager') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const {
    number, name, model_number, serial_number, date, company_name,
    measurement, quantity, unit_price, property_type
  } = req.body;

  const id = uuidv4();
  const total_price = quantity * unit_price;
  const available_quantity = quantity;

  db.run(
    `INSERT INTO properties 
     (id, number, name, model_number, serial_number, date, company_name, measurement, 
      quantity, unit_price, total_price, property_type, available_quantity) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, number, name, model_number, serial_number, date, company_name, measurement,
     quantity, unit_price, total_price, property_type, available_quantity],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, message: 'Property created successfully' });
    }
  );
});

app.put('/api/properties/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'store_manager') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const {
    number, name, model_number, serial_number, date, company_name,
    measurement, quantity, unit_price, property_type
  } = req.body;

  const total_price = quantity * unit_price;

  db.run(
    `UPDATE properties SET 
     number = ?, name = ?, model_number = ?, serial_number = ?, date = ?, 
     company_name = ?, measurement = ?, quantity = ?, unit_price = ?, 
     total_price = ?, property_type = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [number, name, model_number, serial_number, date, company_name, measurement,
     quantity, unit_price, total_price, property_type, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Property updated successfully' });
    }
  );
});

app.delete('/api/properties/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'store_manager') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  db.run('DELETE FROM properties WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Property deleted successfully' });
  });
});

// Property Requests
app.get('/api/requests', authenticateToken, (req, res) => {
  let query = 'SELECT * FROM property_requests';
  let params = [];

  if (req.user.role === 'user') {
    query += ' WHERE user_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(requests);
  });
});

app.post('/api/requests', authenticateToken, (req, res) => {
  const {
    property_id, property_number, property_name, quantity_type, requested_quantity
  } = req.body;

  const id = uuidv4();

  db.run(
    `INSERT INTO property_requests 
     (id, user_id, user_name, user_department, property_id, property_number, 
      property_name, quantity_type, requested_quantity, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [id, req.user.id, req.user.name, req.user.department || 'Unknown Department',
     property_id, property_number, property_name, quantity_type, requested_quantity],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, message: 'Request submitted successfully' });
    }
  );
});

app.put('/api/requests/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, approved_quantity, reason } = req.body;

  let query = 'UPDATE property_requests SET status = ?, updated_at = CURRENT_TIMESTAMP';
  let params = [status];

  if (approved_quantity !== undefined) {
    query += ', approved_quantity = ?';
    params.push(approved_quantity);
  }

  if (reason !== undefined) {
    query += ', reason = ?';
    params.push(reason);
  }

  if (req.user.role === 'admin') {
    query += ', admin_id = ?';
    params.push(req.user.id);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Update property availability if approved or adjusted
    if (status === 'approved' || status === 'adjusted') {
      db.get('SELECT * FROM property_requests WHERE id = ?', [id], (err, request) => {
        if (!err && request) {
          const quantityToReduce = approved_quantity || request.requested_quantity;
          db.run(
            'UPDATE properties SET available_quantity = available_quantity - ? WHERE id = ?',
            [quantityToReduce, request.property_id]
          );
        }
      });
    }

    res.json({ message: 'Request updated successfully' });
  });
});

// Issue Property
app.post('/api/issue-property', authenticateToken, (req, res) => {
  if (req.user.role !== 'store_manager') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { request_id } = req.body;

  db.get('SELECT * FROM property_requests WHERE id = ?', [request_id], (err, request) => {
    if (err || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    db.get('SELECT * FROM properties WHERE id = ?', [request.property_id], (err, property) => {
      if (err || !property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const issued_quantity = request.approved_quantity || request.requested_quantity;
      const is_permanent = property.property_type === 'permanent' || property.property_type === 'permanent-temporary';

      const issuedPropertyId = uuidv4();

      db.run(
        `INSERT INTO issued_properties 
         (id, request_id, property_id, user_id, user_name, user_department, 
          property_number, property_name, model_number, serial_number, 
          quantity_type, issued_quantity, store_manager_id, store_manager_name, is_permanent) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [issuedPropertyId, request_id, property.id, request.user_id, request.user_name,
         request.user_department, property.number, property.name, property.model_number,
         property.serial_number, property.measurement, issued_quantity, req.user.id,
         req.user.name, is_permanent],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Update request status
          db.run(
            'UPDATE property_requests SET status = ?, store_manager_id = ?, issued_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['issued', req.user.id, request_id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              res.json({ message: 'Property issued successfully' });
            }
          );
        }
      );
    });
  });
});

// Issued Properties
app.get('/api/issued-properties', authenticateToken, (req, res) => {
  db.all('SELECT * FROM issued_properties ORDER BY issued_at DESC', (err, issuedProperties) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(issuedProperties);
  });
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const stats = {};

  // Get properties count
  db.get('SELECT COUNT(*) as count FROM properties', (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalProperties = result.count;

    // Get requests count
    db.get('SELECT COUNT(*) as count FROM property_requests', (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.totalRequests = result.count;

      // Get pending requests count
      db.get('SELECT COUNT(*) as count FROM property_requests WHERE status = "pending"', (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.pendingRequests = result.count;

        // Get issued properties count
        db.get('SELECT COUNT(*) as count FROM issued_properties', (err, result) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.issuedProperties = result.count;

          res.json(stats);
        });
      });
    });
  });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist'))); // or '../build' if that's your build folder

// For any other requests, send back React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html')); // or '../build/index.html'
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});