const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Define App Messages
const emailBlank = 'Please enter your email.';
const emailConflict = 'Email already exist!';
const emailNotFound = 'Email does not exist.';
const passBlank = 'Please enter a password.';
const passError = 'Password is incorrect.';

// Generate Random String
const generateRandomString = (charNum) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < charNum; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Check Input URL to includes HTTPS://
const checkHttp = (url) => {
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return "https://" + url;
  }
  return url;
};

/* Databases
 */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  test: {
    id:       "test",
    email:    "test@example.com",
    password: "my-password"
  }
};

/* Redirect localhost to /urls page.
 */
app.get("/", (req, res) => {
  res.redirect("/urls/");
});

/* Display Test Data
 */
app.get("/data.json", (req, res) => {
  const data = {
    urlDatabase,
    users
  };
  res.set("Content-Type", "application/json");
  res.send(JSON.stringify(data, null, 2));
});

/* GET
 * Pass variables to EJS template
 */
app.get("/urls", (req, res) => {
  const templateVars = {
    cookieId: req.cookies.user_id,
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    // If user already logged in, redirect to /urls/
    res.redirect("/urls/");
  } else {
    const templateVars = {
      cookieId: req.cookies.user_id,
      user: users[req.cookies.user_id]
    };
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    // If user already logged in, redirect to /urls/
    res.redirect("/urls/");
  } else {
    const templateVars = {
      cookieId: req.cookies.user_id,
      user: users[req.cookies.user_id]
    };
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    cookieId: req.cookies.user_id,
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    cookieId: req.cookies.user_id,
    user: users[req.cookies.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


/* POST
 * Request Submitted Data
 */
// Create new key for new URL
app.post("/urls", (req, res) => {
  const id = generateRandomString(6); // Call function to generate random 6 characters
  const url = req.body.longURL;
  urlDatabase[id] = checkHttp(url);
  res.redirect(`/urls/${id}`);
});

// Update existing URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const url = req.body.longURL;
  urlDatabase[id] = checkHttp(url);
  res.redirect("/urls/");
});

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    res.status(400).send(emailBlank);
  } else if (!password) {
    res.status(400).send(passBlank);
  } else {
    for (const user in users) {
      if (email === users[user].email) {
        res.status(400).send(emailConflict);
      } else {
        users[id] = {
          id,
          email,
          password
        };
        res.cookie("user_id", users[user].id);
        res.redirect("/urls");
      }
    }
  }
});

// Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    res.status(403).send(emailBlank);
  } else if (!password) {
    res.status(403).send(passBlank);
  } else {
    for (const user in users) {
      if (email === users[user].email) {
        if (password === users[user].password) {
          res.cookie("user_id", users[user].id);
          res.redirect("/urls");
        } else {
          res.status(403).send(passError);
        }
      } else {
        res.status(403).send(emailNotFound);
      }
    }
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Server Status
app.listen(PORT, () => {
  console.log(`TinyApp app listening on port ${PORT}!`);
});