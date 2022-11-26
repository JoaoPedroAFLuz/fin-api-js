const express = require('express');

const port = 3333;
const app = express();

app.get('/', (request, response) => {
  response.send('Hello World!');
});

app.listen(port, () => console.log(`Listening on ${port}`));
