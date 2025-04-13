//Joey Teahan - insecure version - 20520316 - server.js

const express = require('express'); //The express framework
const bodyParser = require('body-parser'); //Sets up the middleware
const sqlite3 = require('sqlite3').verbose(); //Database 

const app = express(); //Creates an express instance 

const port = 3000;//Sets up the port that the app runs on 

app.use(express.static('styles')); //Files are set up from the styles folder
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs'); //links to EJS

//Connects to the database
const db = new sqlite3.Database('shopping.db');

//Sets up the tables for the users credentials
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, user_id INTEGER, name TEXT)");
});

//Renders the log in page 
app.get('/', (req, res) => {
  res.render('login');
});


//Processes the log in page
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // The SQL Injection possible problem
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  db.get(query, (user) => {
    if (user) {
      //If users credentials match up then they are sent to the list page 
      res.redirect(`/list/${user.id}`);
    } else {
      //If they dont match this message shows up
      res.send('Invalid login');
    }
  });
});

//Renders the regoster page 
app.get('/register', (req, res) => {
  res.render('register');
});

//Adds new items to the list
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  // password stored in plain text string
  const query = `INSERT INTO users (email, password) VALUES ('${email}', '${password}')`;
  db.run(query, () => {
    res.redirect('/');
  });
});

app.get('/list/:id', (req, res) => {
  const userId = req.params.id;
  // XSS problem
  db.all(`SELECT * FROM items WHERE user_id = ${userId}`, (err, rows) => {
    res.render('list', { items: rows, userId });
  });
});


//List section 
app.post('/list/:id', (req, res) => {
    const userId = req.params.id;
  

  
    const query = `INSERT INTO items (user_id, name) VALUES (${userId}, '${safeItem}')`;
  
    db.run(query, function (err) {
      if (err) {
        console.error("ERROR inserting item:", err.message);
        return res.send("Something went wrong");
      }
      res.redirect(`/list/${userId}`);
    });
  });
  
//The delete section 
app.post('/delete/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.query.userId; // passed through the form
  
    // If item belongs to the user
    const query = `DELETE FROM items WHERE id = ${itemId}`;
    db.run(query, () => {
      res.redirect(`/list/${userId}`);
    });
  });

  app.post('/list/:id', (req, res) => {
    const { item } = req.body;
    const userId = req.params.id;
    console.log("Adding item:", item); // 👈 Add this
    const query = `INSERT INTO items (user_id, name) VALUES (${userId}, '${item}')`;
    db.run(query, () => {
      res.redirect(`/list/${userId}`);
    });
  });
  
//Runs the app on the url 
  app.listen(port, () => {
    console.log(`Insecure app running at http://localhost:${port}`);
  });
  