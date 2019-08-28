const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');

const users = require('./data/usersQueries');

const server = express();
server.use(express.json());
server.use(cors());
server.use(session({
  name: 'webauth',
  secret: 'JetBeamsCantMeltSteelFuel',
  httpOnly: true,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 30
  }
}));

const restricted = async (req, res, next) => {
  try {
    if (req.session && req.session.user && await users.getUserById(req.session.user.id)) {
      next();
    } else {
      res.status(403).json({ message: 'invalid credentials' });
    }
  } catch(err) {
    res.status(500).json(err);
  }
};

server.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const hash = bcrypt.hashSync(password, 8);
    const newUser = await users.addUser({ username, password: hash });

    res.status(201).json(newUser);
  } catch(err) {
    res.status(500).json(err);
  }
});

server.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const user = await users.getUserByName(username);

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.status(200).json({ message: 'welcome' });
    } else {
      res.status(403).json({ message: 'You shall not pass!' });
    }
  } catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
});

server.get('/api/users', restricted, async (req, res) => {
  try {
    res.status(200).json(await users.getUsers());
  } catch(err) {
    res.status(500).json(err);
  }
});

server.get('/api/logout', restricted, async (req, res) => {
  req.session.destroy();
  res.status(204).end();
});

server.listen(5000, () => {
  console.log('server on :5000');
});