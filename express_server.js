const express = require("express");
const { getUserByEmail } = require("./helpers");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ['fj3#jf3(jfa#(#*7@7', 'hiadai2892@DDH82', 'D&@&dahdik2HQ*I@&DH'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
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
    id: "aJ48lW",
    email: "123@example.com",
    password: "$2a$10$Ez8ugewmBaLv7cgL1ktNR.swYD4PjVWy1MAvqspdhSd/6L4SJE/hq" // 123123
  },
  k255h2: {
    id: "k255h2",
    email: "789@example.com",
    password: "$2a$10$5T7.e/u5dfIjgSwu/LQpAuHrWU6OQ33m6KHjQr9sLfZFKJ7yx1G96" // 789789
  }
};

// Define Error Messages
const emailBlank = 'Please enter your email.';
const emailConflict = 'Email already exist!';
const emailNotFound = 'Email does not exist.';
const passBlank = 'Please enter a password.';
const passError = 'Password is incorrect.';
const url404 = 'URL Not Found Invalid ID.';
const wrongUser = 'Permission denied to edit this URL: wrong user.';
const wrongPerm = 'Permission denied to edit this URL: please login.';

// Generate Random String for the user ID and URL ID.
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

// Check both user and password, if match on post return to true.
const checkAuth = (email, pass) => {
  for (const user in users) {
    if (email === users[user].email && bcrypt.compareSync(pass, users[user].password)) {
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
    if (url === id) {
      return true;
    }
  }
  return false;
};

// Only list url for the logged in user
const urlsForUser = (id) => {
  let userURL = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURL[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      };
    }
  }
  return userURL;
};

// GET Redirect localhost to /urls page.
app.get("/", (req, res) => {
  res.redirect("/urls/");
});

// GET Display JSON Data
app.get("/data.json", (req, res) => {
  const data = {
    urlDatabase,
    users
  };
  res.set("Content-Type", "application/json");
  res.send(JSON.stringify(data, null, 2));
});

// GET Primary URL listing
app.get("/urls", (req, res) => {
/*   if (users[req.session.userId] === undefined) {
    // Clear orphan cookie session due to server reset, invalid session or missing user in database.
    req.session = null;
    res.redirect("/");
  } else { */
    const templateVars = {
      cookieId: req.session.userId,
      user: users[req.session.userId],
      urls: urlsForUser(req.session.userId)
    };
    res.render("urls_index", templateVars);
  //}
});

// GET Registration Page
app.get("/register", (req, res) => {
  if (req.session.userId) {
    // If user already logged in, redirect to /urls/
    res.redirect("/urls/");
  } else {
    const templateVars = {
      cookieId: req.session.userId,
      user: users[req.session.userId]
    };
    res.render("urls_register", templateVars);
  }
});

// GET Login Page
app.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls/");
  } else {
    const templateVars = {
      cookieId: req.session.userId,
      user: users[req.session.userId]
    };
    res.render("urls_login", templateVars);
  }
});

// GET New URL Creation Page
app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    const templateVars = {
      cookieId: req.session.userId,
      user: users[req.session.userId]
    };
    res.render("urls_new", templateVars);
  }
});

// GET show selected URL Page
app.get("/urls/:id", (req, res) => {
  if (checkURL(req.params.id)) {
    if (!req.session.userId) {
      res.status(403).send(wrongPerm);
    } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
      res.status(403).send(wrongUser);
    } else {
      const templateVars = {
        cookieId: req.session.userId,
        user: users[req.session.userId],
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL
      };
      res.render("urls_show", templateVars);
    }
  } else {
    res.redirect("/urls/");
  }
});

// GET Redirect to longURL website
app.get("/u/:id", (req, res) => {
  // We have to check if the URL exists in the database.
  if (checkURL(req.params.id)) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send(url404);
  }
});

// POST Create new key for new URL
app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    // Protect from malicious uses.
    res.send("Login Required!\n");
  } else {
    const id = generateRandomString(6); // Call function to generate random 6 characters
    const url = req.body.longURL;
    urlDatabase[id] = {
      longURL: checkHttp(url),
      userID: req.session.userId
    };
    res.redirect(`/urls/${id}`);
  }
});

// POST Update existing URL
app.post("/urls/:id", (req, res) => {
  // We need to check if the URL exists, check if the user logged in, check if it is correct logged in user before actioning Delete.
  if (checkURL(req.params.id)) {
    if (!req.session.userId) {
      res.status(403).send(wrongPerm);
    } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
      res.status(403).send(wrongUser);
    } else {
      const id = req.params.id;
      const url = req.body.longURL;
      urlDatabase[id] = {
        longURL: checkHttp(url),
        userID: req.session.userId
      };
      res.redirect("/urls/");
    }
  } else {
    res.status(403).send(url404);
  }
});

// POST Delete URL entry
app.post("/urls/:id/delete", (req, res) => {
  // We need to check if the URL exists, check if the user logged in, check if it is correct logged in user before actioning Delete.
  if (checkURL(req.params.id)) {
    if (!req.session.userId) {
      res.status(403).send(wrongPerm);
    } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
      res.status(403).send(wrongUser);
    } else {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    }
  } else {
    res.status(403).send(url404);
  }
});

// Register new user, additional check if user email exist already.
app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

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
      password: bcrypt.hashSync(password, 10)
    };
    req.session.userId = users[id].id;
    res.redirect("/urls");
  }
});

// Login to existing user, also check if user email exist or not.
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  const auth = checkAuth(email, password);

  if (!email) {
    res.status(403).send(emailBlank);
  } else if (!password) {
    res.status(403).send(passBlank);
  } else if (user) {
    if (auth) {
      req.session.userId = cookieID;
      res.redirect("/urls");
    } else {
      res.status(403).send(passError);
    }
  } else {
    res.status(403).send(emailNotFound);
  }
});

// Logout and clear all cookie session.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Server Status
app.listen(PORT, () => {
  console.log(`TinyApp app listening on port ${PORT}!`);
});