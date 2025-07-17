const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load from .env

const app = express();

// Enable CORS for all origins (or restrict if needed)
app.use(cors());
app.use(express.json());

// Serve static HTML & assets
app.use(express.static(path.join(__dirname, 'views')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'client.html'));
});

// Use environment variable or fallback to hardcoded key (not recommended for prod)
const RECAPTCHA_SECRET = '6LeWVYUrAAAAAIBRH9gvphSjMS73fRmFn2PF6sMO';

app.post('/verify-recaptcha', async (req, res) => {
  console.log('\n📨 POST /verify-recaptcha');
  const { token } = req.body;

  if (!token) {
    console.warn('⚠️ No token provided in request body');
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    console.log('🔐 Verifying token with Google...');
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET,
          response: token,
        },
      }
    );

    const data = response.data;
    console.log('📬 Google response:', data);

    if (data.success) {
      console.log('✅ reCAPTCHA verified');
      return res.json({ success: true, message: 'Verified' });
    } else {
      console.warn('❌ Verification failed:', data['error-codes']);
      return res.status(400).json({
        success: false,
        message: 'Verification failed',
        errorCodes: data['error-codes'] || [],
      });
    }
  } catch (err) {
    console.error('🚨 Error verifying reCAPTCHA:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
