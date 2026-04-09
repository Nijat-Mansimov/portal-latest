require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const newsRoutes = require('./routes/news');
const { initializePassport } = require('./config/passport');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initializePassport(passport);
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/news', newsRoutes);

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Portal backend started on ${port}`);
});
