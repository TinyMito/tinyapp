const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");


const generateRandomString = (charNum) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < charNum; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const checkHttp = (url) => {
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return "https://" + url;
  }
  return url;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  uMeaoKA: {
    id:       "uMeaoKA",
    email:    "my@email.com",
    password: "my-password"
  }
};

/* Initial Setup for Testing
 */
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/* app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
}); */

/* Pass variables to EJS template
 */
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
  };
  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
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

// New User Registration
app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;

  users['u' + id] = {
    id: 'u' + id,
    email,
    password
  };

  // Login immediately
  res.cookie("user_id", id);

  console.log(users);
  res.redirect("/urls");
});

// Login and set cookies
app.post("/login", (req, res) => {
  const userName = req.body.username;
  res.cookie("username", userName);
  res.redirect("/urls");
});

// Logout and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp app listening on port ${PORT}!`);
});