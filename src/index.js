const express = require('express');
const { v4: uuidv4 } = require('uuid');

const port = 3333;
const app = express();
app.use(express.json());

let customers = [];

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(404).json({ error: 'Customer not found' });
  }

  request.customer = customer;

  return next();
}

function getBalance(statements) {
  const balance = statements.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.get('/accounts', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  response.json(customer);
});

app.get('/accounts/balance', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statements);

  response.json(balance);
});

/**
 * cpf - string
 * name - string
 * id - uuid
 * statements - []
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
    statements: [],
  });

  return response.sendStatus(201);
});

app.put('/accounts', verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.sendStatus(201);
});

app.delete('/accounts', verifyIfExistsAccountCPF, (request, response) => {
  const { customer: loggedCustomer } = request;

  customers = customers.filter((customer) => customer.id !== loggedCustomer.id);

  response.sendStatus(204);
});

app.get('/statements', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statements);
});

app.get('/statements/date', verifyIfExistsAccountCPF, (request, response) => {
  const { date } = request.query;
  const { customer } = request;

  const dateFormat = new Date(date + ' 00:00');

  const statements = customer.statements.filter(
    (statements) =>
      statements.created_at.toDateString() === dateFormat.toDateString()
  );

  return response.json(statements);
});

app.post('/deposits', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statements.push(statementOperation);

  return response.sendStatus(201);
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statements);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient founds' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statements.push(statementOperation);

  return response.sendStatus(201);
});

app.listen(port, () => console.log(`Listening on port: ${port}`));
