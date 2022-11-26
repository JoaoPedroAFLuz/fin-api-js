const express = require('express');
const { v4: uuidv4 } = require('uuid');

const port = 3333;
const app = express();
app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(404).json({ error: 'Customer not found' });
  }

  request.customer = customer;

  return next();
}

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
 */
app.post('/accounts', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: 'Customer already exists' });
  }

  const id = uuidv4();

  customers.push({
    id,
    cpf,
    name,
    statement: [],
  });

  return response.sendStatus(201);
});

app.get('/statements', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.listen(port, () => console.log(`Listening on port: ${port}`));
