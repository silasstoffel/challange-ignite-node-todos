const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checksExistsUserAccount = (req, res, next) => {
  const { username } = req.headers;
  const user = users.find((item) => item.username === username);
  if (!user) {
    return res.status(404).json({ error: "username not found." });
  }
  req.user = user;
  return next();
};

/**
 * Create user
 */
app.post("/users", (req, res) => {
  const { username, name } = req.body;

  const exists = users.some((user) => user.username === username);
  if (exists) {
    return res.status(400).json({ error: "username already exists." });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    created_at: new Date(),
    todos: [],
  };
  users.push(user);

  return res.status(201).json(user);
});

// Use middleware in all routes
app.use(checksExistsUserAccount);

/**
 * Get todos per user
 */
app.get("/todos", (req, res) => {
  const { user } = req;
  return res.json(user.todos);
});

/**
 * Create todos
 */
app.post("/todos", (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };
  user.todos.push(todo);

  return res.status(201).json(todo);
});

/**
 * Update todos
 */
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const { title, deadline } = req.body;

  const index = user.todos.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Todo not found." });
  }
  user.todos[index].title = title;
  user.todos[index].deadline = new Date(deadline);

  return res.status(200).json(user.todos[index]);
});

/**
 * Mark todo as done
 */
app.patch("/todos/:id/done", (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const index = user.todos.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Todo not found." });
  }
  user.todos[index].done = true;
  return res.status(200).json(user.todos[index]);
});

/**
 * Delete todo
 */
app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const index = user.todos.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Todo not found." });
  }
  user.todos.splice(index, 1);
  return res.status(204).send();
});

module.exports = app;
