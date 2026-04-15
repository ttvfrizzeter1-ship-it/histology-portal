require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/news', require('./routes/news'));
app.use('/api/events', require('./routes/events'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/atlas', require('./routes/atlas'));
app.use('/api/moodle', require('./routes/moodle'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/aristo', require('./routes/aristo'));
app.use('/api/upload', require('./routes/upload'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🔬 Histology Portal API → http://localhost:${PORT}`);
    console.log(`📁 Uploads → http://localhost:${PORT}/uploads/`);
    console.log(`📚 Run "node db/seed.js" to populate with test data\n`);
  });
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
