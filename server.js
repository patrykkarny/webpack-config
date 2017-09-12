// Simple static server
const express = require('express');
const compression = require('compression');
const path = require('path');

const port = process.env.PORT || 4000;
const app = express();

app.use(compression()); // compress all requests
app.use(express.static(path.resolve(__dirname, 'dist'), { maxage: '365 days' }));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.get('*', (req, res) => {
  res.redirect('/');
});

// Start server
app.listen(port, () => console.log(`Server running at port: ${port}`));
