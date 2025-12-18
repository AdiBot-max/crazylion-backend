const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DB = "./users.json";

app.use(cors());
app.use(express.json());

// Load database
let users = {};
if (fs.existsSync(DB)) {
  users = JSON.parse(fs.readFileSync(DB, "utf8"));
}

// Save database
function saveDB() {
  fs.writeFileSync(DB, JSON.stringify(users, null, 2));
}

/* =====================
   SIGNUP (NO LOGIN)
===================== */
app.post("/signup", (req, res) => {
  let { username, display, bio } = req.body;

  if (!username) {
    return res.json({ error: "Username is required" });
  }

  username = username.toLowerCase().replace(/[^a-z0-9_]/g, "");

  if (username.length < 3) {
    return res.json({ error: "Username too short" });
  }

  if (users[username]) {
    return res.json({ error: "Username already exists" });
  }

  users[username] = {
    display: display || username,
    bio: bio || "",
    created: Date.now()
  };

  saveDB();

  res.json({
    success: true,
    profile: `https://${req.get("host")}/u/${username}`
  });
});

/* =====================
   PROFILE PAGE
===================== */
app.get("/u/:username", (req, res) => {
  const user = users[req.params.username.toLowerCase()];
  if (!user) return res.status(404).send("User not found");

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${user.display} | CrazyLion Games</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {
  margin: 0;
  background: #0b0b0b;
  color: #fff;
  font-family: system-ui;
}
.card {
  max-width: 500px;
  margin: 60px auto;
  padding: 24px;
  border-radius: 14px;
  background: #151515;
}
h1 { color: #ffcc00; }
small { opacity: .6; }
</style>
</head>
<body>
  <div class="card">
    <h1>${user.display}</h1>
    <p>${user.bio || "No bio yet."}</p>
    <small>Joined ${new Date(user.created).toDateString()}</small>
  </div>
</body>
</html>
`);
});

/* =====================
   ROOT
===================== */
app.get("/", (req, res) => {
  res.send("CrazyLion Games backend running.");
});

app.listen(PORT, () => {
  console.log("Running on port", PORT);
});
