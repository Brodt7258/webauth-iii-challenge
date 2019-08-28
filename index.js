const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const secret = 'shhh, its a secret';

const users = require('./data/usersQueries');

const server = express();
server.use(express.json());
server.use(cors());

const restricted = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    jwt.verify(authorization, secret, async function(err, decoded) {
      if (err) {
        res.status(403).json({ message: 'invalid credentials' });
      } else if (await users.getUserById(decoded.subject)) {
        next();
      } else {
        res.status(500).json(err);
      }
    });
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
      //req.session.user = user;
      const token = genToken(user);
      res.status(200).json({
        token,
        message: 'welcome'
      });
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

server.listen(5000, () => {
  console.log('server on :5000');
});

function genToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };

  const options = {
    expiresIn: '1d'
  };

  return jwt.sign(payload, secret, options);
};