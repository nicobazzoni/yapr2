const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

app.get('/proxy', async (req, res) => {
  const firebaseUrl = decodeURIComponent(req.query.url);

  try {
    const response = await axios.get(firebaseUrl, { responseType: 'arraybuffer' });
    const base64Data = Buffer.from(response.data, 'binary').toString('base64');
    res.send({ data: base64Data });
  } catch (error) {
    console.error(`There was an error fetching the audio file at ${firebaseUrl}:`, error);
    res.status(500).send({ error: 'There was an error fetching the audio file.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
