import express from "express";
import Database from "better-sqlite3";

const app = express();
const port = 4000;
app.use(express.static("public"));
//Connect to db
const db = new Database("data.db");

//Read from database
const data = db.prepare("SELECT * FROM fish").all();

// Get current year
const currentYear = new Date().getFullYear().toString();

// Function for sort fish by weight
function fishByWeight(species) {
  return data
    .filter((fish) => fish.species === species)
    .sort((a, b) => b.weight - a.weight);
}
//Funktion for sort fish by weight this year
function fishByWeightThisYear(species) {
  return data
    .filter(
      (fish) => fish.species === species && fish.date.startsWith(currentYear),
    )
    .sort((a, b) => b.weight - a.weight);
}

//Funktion for sort fish by length
function fishByLength(species) {
  return data
    .filter((fish) => fish.species === species)
    .sort((a, b) => b.length - a.length);
}

//Funktion for sort fish by length this year
function fishByLengthThisYear(species) {
  return data
    .filter(
      (fish) => fish.species === species && fish.date.startsWith(currentYear),
    )
    .sort((a, b) => b.length - a.length);
}

///////////////////////////PIKE///////////////////////////
// Sort pike by weight
const pikeByWeight = fishByWeight("Pike");

// Sort pike by weight this year
const pikeByWeightThisYear = fishByWeightThisYear("Pike");

// Sort pike by length
const pikeByLength = fishByLength("Pike");

// Sort pike by length this year
const pikeByLengthThisYear = fishByLengthThisYear("Pike");

///////////////////////////PERCH///////////////////////////
// Sort perch by weight
const perchByWeight = fishByWeight("Perch");

// Sort perch by weight this year
const perchByWeightThisYear = fishByWeightThisYear("Perch");

// Sort perch by length
const perchByLength = fishByLength("Perch");

// Sort perch by length this year
const perchByLengthThisYear = fishByLengthThisYear("Perch");

///////////////////////////Zander///////////////////////////
// Sort zander by weight
const zanderByWeight = fishByWeight("Zander");

// Sort zander by weight this year
const zanderByWeightThisYear = fishByWeightThisYear("Zander");

// Sort zander by length
const zanderByLength = fishByLength("Zander");

// Sort perch by length this year
const zanderByLengthThisYear = fishByLengthThisYear("Zander");

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
  //Set the first letter to uppercase
  data.species = data.species.charAt(0).toUpperCase() + data.species.slice(1);
  data.bait = data.bait.charAt(0).toUpperCase() + data.bait.slice(1);
  data.colour = data.colour.charAt(0).toUpperCase() + data.colour.slice(1);
  data.lake = data.lake.charAt(0).toUpperCase() + data.lake.slice(1);
  data.winddirection = data.winddirection.toUpperCase();
  data.weather = data.weather.charAt(0).toUpperCase() + data.weather.slice(1);

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
  res.render("statistics.ejs", {
    pikeByWeight: pikeByWeight,
    pikeByWeightThisYear: pikeByWeightThisYear,
    pikeByLength: pikeByLength,
    pikeByLengthThisYear: pikeByLengthThisYear,
    perchByWeight: perchByWeight,
    perchByWeightThisYear: perchByWeightThisYear,
    perchByLength: perchByLength,
    perchByLengthThisYear: perchByWeightThisYear,
    zanderByWeight: zanderByWeight,
    zanderByWeightThisYear: zanderByWeightThisYear,
    zanderByLength: zanderByLength,
    zanderByLengthThisYear: zanderByLengthThisYear,
  });
});

// Listening to port 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
