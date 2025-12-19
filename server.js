// import required libraries
const express = require("express");
const fs = require("fs");
const cors = require("cors");

// create express app
const app = express();

// Render gives PORT automatically
const PORT = process.env.PORT || 3000;

// database file
const DB_FILE = "./users.json";

// allow requests from Google Sites
app.use(cors());

// allow JSON body reading
app.use(express.json());

/* ==========================
   LOAD DATABASE
========================== */

// users will be stored in this object
let users = {};

// if users.json exists, read it
if (fs.existsSync(DB_FILE)) {
  const data = fs.readFileSync(DB_FILE, "utf8");
  users = JSON.parse(data);
}

/* ==========================
   SAVE DATABASE
========================== */

function saveUsers() {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

/* ==========================
   SIGNUP (CREATE USER)
========================== */
app.post("/signup", (req, res) => {
  let { username, display, bio } = req.body;

  // basic validation
  if (!username) {
    return res.json({ error: "Username required" });
  }

  // normalize username
  username = username
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

  if (username.length < 3) {
    return res.json({ error: "Username too short" });
  }

  // check if already exists
  if (users[username]) {
    return res.json({ error: "Username already exists" });
  }

  // save user
  users[username] = {
    display: display || username,
    bio: bio || "",
    created: Date.now()
  };

  saveUsers();

  // return profile URL
  res.json({
    success: true,
    profile: `https://${req.get("host")}/u/${username}`
  });
});

/* ==========================
   USER PROFILE PAGE
========================== */
app.get("/u/:username", (req, res) => {
  const username = req.params.username.toLowerCase();
  const user = users[username];

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>${user.display}</title>
<style>
body {
  background:#0b0b0b;
  color:white;
  font-family:system-ui;
}
.card {
  max-width:500px;
  margin:50px auto;
  padding:20px;
  background:#151515;
  border-radius:12px;
}
a { color:#ffcc00; }
</style>
</head>
<body>
<div class="card">
  <h1>${user.display}</h1>
  <p>${user.bio || "No bio yet."}</p>
  <small>Joined ${new Date(user.created).toDateString()}</small>
  <br><br>
  <a href="/users">View all users</a>
</div>
</body>
</html>
`);
});

/* ==========================
   PUBLIC USER LIST PAGE
========================== */
app.get("/users", (req, res) => {

  // convert users object into array
  const list = Object.keys(users);

  let htmlUsers = list.map(name => {
    return `<li><a href="/u/${name}">${users[name].display}</a></li>`;
  }).join("");

  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Users | CrazyLion Games</title>
<style>
body {
  background:#0b0b0b;
  color:white;
  font-family:system-ui;
}
.box {
  max-width:400px;
  margin:40px auto;
  background:#151515;
  padding:20px;
  border-radius:12px;
}
a { color:#ffcc00; }
</style>
</head>
<body>
<div class="box">
  <h2>Registered Users (${list.length})</h2>
  <ul>
    ${htmlUsers || "<li>No users yet</li>"}
  </ul>
</div>
</body>
</html>
`);
});

/* ==========================
   ROOT
========================== */
app.get("/", (req, res) => {
  res.send("CrazyLion Games backend running.");
});

// start server
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
