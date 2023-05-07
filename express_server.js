const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Internal databases for this project
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  k29d22: {
    longURL: "https://www.reddit.com",
    userID: "k255h2",
  }
};

const users = {
  aJ48lW: {
    id:       "aJ48lW",
    email:    "123@example.com",
    password: "123123"
  },
  k255h2: {
    id:       "k255h2",
    email:    "789@example.com",
    password: "789789"
  }
};

// Define App Messages
const emailBlank = 'Please enter your email.';
const emailConflict = 'Email already exist!';
const emailNotFound = 'Email does not exist.';
const passBlank = 'Please enter a password.';
const passError = 'Password is incorrect.';
const url404 = 'URL Not Found Invalid ID.';

// Generate Random String
const generateRandomString = (charNum) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < charNum; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Define a variable cookieID for checkAuth to set when the login match the users database.
let cookieID;
// Check for existing user in the users database and return to true if found.
const checkUser = (email) => {
  for (const user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
};
// Check both user and password, if match on post return to true.
const checkAuth = (email, pass) => {
  for (const user in users) {
    if (email === users[user].email && pass === users[user].password) {
      cookieID = users[user].id;
      return true;
    }
  }
  return false;
};

// Check Input URL to includes HTTPS://
const checkHttp = (url) => {
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return "https://" + url;
  }
  return url;
};

// Check for existing short URL id
const checkURL = (url) => {
  for (const id in urlDatabase) {
    console.log(id)
    if (url === id) {
      return true;
    }
  }
  return false;
};

// GET Redirect localhost to /urls page.
app.get("/", (req, res) => {
  res.redirect("/urls/");
});

// Display Test Data
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
  if (!req.cookies.user_id) {
    // If user already logged in, redirect to /urls/
    res.redirect("/login");
  } else {
    const templateVars = {
      cookieId: req.cookies.user_id,
      user: users[req.cookies.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    cookieId: req.cookies.user_id,
    user: users[req.cookies.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (checkURL(req.params.id)) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send(url404);
  }
});

// POST
// Create new key for new URL
app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    // Protect from malicious uses.
    res.send("Login Required!\n");
  } else {
    const id = generateRandomString(6); // Call function to generate random 6 characters
    const url = req.body.longURL;
    urlDatabase[id] = {
      longURL: checkHttp(url),
      userID: req.cookies.user_id
    }
    res.redirect(`/urls/${id}`);
  }
});

// Update existing URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const url = req.body.longURL;
  urlDatabase[id] = {
    longURL: checkHttp(url),
    userID: req.cookies.user_id
  }
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
  const { email, password } = req.body;
  const user = checkUser(email);

  if (!email) {
    res.status(400).send(emailBlank);
  } else if (!password) {
    res.status(400).send(passBlank);
  } else if (user) {
    res.status(400).send(emailConflict);
  } else {
    users[id] = {
      id,
      email,
      password
    };
    res.cookie("user_id", users[id].id);
    res.redirect("/urls");
  }
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = checkUser(email);
  const auth = checkAuth(email, password);

  if (!email) {
    res.status(403).send(emailBlank);
  } else if (!password) {
    res.status(403).send(passBlank);
  } else if (user) {
    if (auth) {
      res.cookie("user_id", cookieID);
      res.redirect("/urls");
    } else {
      res.status(403).send(passError);
    }
  } else {
    res.status(403).send(emailNotFound);
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