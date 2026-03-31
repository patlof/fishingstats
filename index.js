import express from "express";
import Database from "better-sqlite3";

const app = express();
const port = 4000;
app.use(express.static("public"));
//Connect to db
const db = new Database("data.db");

//Read from database
const data = db.prepare("SELECT * FROM fish").all();

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Listening to port 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
