require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const bodyParser = require('body-parser')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Parse JSON bodies
app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/1', (req, res) => {
  res.redirect('https://www.google.com')
})

app.get('/api/shorturl/3', (req, res) => {
  res.redirect('https://forum.freecodecamp.org')
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urlMappings = {}; // { 1: 'https://www.google.com' }
const reverseMappings = {}; // { 'https://www.google.com': 1 }

app.post('/api/shorturl', (req, res) => {
  const options = {
    all: false
  };

  try {
    const url = req.body.url;
    const formatUrl = new URL(url);

    dns.lookup(formatUrl.hostname, options, (err) => {
      if (err) {
        res.json({ error: "Invalid URL" });
        return;
      }

      // Check if the URL has already been shortened
      if (reverseMappings[url]) {
        res.json({ original_url: url, short_url: reverseMappings[url] });
      } else {
        // Generate a random number for the shortened URL
        let shortenedNumber = Math.floor(Math.random() * 10000);

        // Check that the number is not already in use
        while (urlMappings[shortenedNumber]) {
          shortenedNumber = Math.floor(Math.random() * 10000);
        }

        // Store the mapping of shortened URL to original URL
        urlMappings[shortenedNumber] = url;
        reverseMappings[url] = shortenedNumber;

        res.json({ original_url: formatUrl, short_url: shortenedNumber });
      }
    });
  } catch {
    res.json({ error: "Invalid URL" });
  }
});

app.get('/api/shorturl/:shortenedNumber', (req, res) => {
  const shortenedNumber = req.params.shortenedNumber;
  const originalUrl = urlMappings[shortenedNumber];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'Invalid URL' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
