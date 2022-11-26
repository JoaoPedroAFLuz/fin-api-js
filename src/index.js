const express = require('express');
const { v4: uuidv4 } = require('uuid');

const port = 3333;
const app = express();
app.use(express.json());

const customers = [];

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
 */
app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    response.status(400).json({ error: 'Customer already exists' });
  }

  const id = uuidv4();

  customers.push({
    id,
    cpf,
    name,
    statement: [],
  });

  response.sendStatus(201);
});

app.listen(port, () => console.log(`Listening on ${port}`));
