import express from "express";
import Database from "better-sqlite3";

const app = express();
const port = 4000;
app.use(express.static("public"));
//Connect to db
const db = new Database("data.db");

//Read from database
const data = db.prepare("SELECT * FROM fish").all();

//To be able to get form data
app.use(express.urlencoded({ extended: true }));

//Startpage/Intropage
app.get("/", (req, res) => {
  res.render("index.ejs");
});

//Register a catch
app.get("/catch", (req, res) => {
  res.render("catch.ejs");
});

app.post("/catch", (req, res) => {
  const data = req.body;
  const insert = db.prepare(
    "INSERT INTO fish (species, length, weight, bait, colour, lake, date, time, windstrength, winddirection, hpa ,weather) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
  );
  const caughtFish = insert.run(
    data.species,
    data.length,
    data.weight,
    data.bait,
    data.colour,
    data.lake,
    data.date,
    data.time,
    data.windstrength,
    data.winddirection,
    data.hpa,
    data.weather,
  );

  res.render("catch.ejs", { success: "The fish has been registered!" });
});

app.get("/statistics", (req, res) => {
  res.render("statistics.ejs");
});

// Listening to port 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
