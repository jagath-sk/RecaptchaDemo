const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const path = require('path');
// serve client.html and static assets
app.use(express.static(path.join(__dirname, 'views')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'client.html'));
});

const RECAPTCHA_SECRET = '6LeWVYUrAAAAAIBRH9gvphSjMS73fRmFn2PF6sMO';

app.post('/verify-recaptcha', async (req, res) => {
    console.log('Received /verify-recaptcha request');
    const { token } = req.body;
    if (!token) {
        console.log('No token provided in request body');
        return res.status(400).json({ success: false, message: 'No token provided' });
    }

    try {
        console.log('Verifying reCaptcha token with Google...');
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
        console.log('Google reCaptcha response:', data);
        if (data.success) {
            console.log('reCaptcha verified successfully');
            res.json({ success: true, message: 'reCaptcha verified' });
        } else {
            console.log('reCaptcha verification failed:', data['error-codes']);
            res.status(400).json({ success: false, message: 'reCaptcha failed', errorCodes: data['error-codes'] });
        }
    } catch (error) {
        console.error('Error during reCaptcha verification:', error.message);
        res.status(500).json({ success: false, message: 'Verification error', error: error.message });
    }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
