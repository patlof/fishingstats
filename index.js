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

// Function for sort fish by weight and first 3.
function fishByWeight(species) {
  return data
    .filter((fish) => fish.species === species)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}
//Function for sort fish by weight this year and first 3.
function fishByWeightThisYear(species) {
  return data
    .filter(
      (fish) => fish.species === species && fish.date.startsWith(currentYear),
    )
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}

//Function for sort fish by length and first 3.
function fishByLength(species) {
  return data
    .filter((fish) => fish.species === species)
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);
}

//Function for sort fish by length this year and first 3.
function fishByLengthThisYear(species) {
  return data
    .filter(
      (fish) => fish.species === species && fish.date.startsWith(currentYear),
    )
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);
}

// Function to count and sort baits by usage frequency and first 5
function baitUsageStats() {
  const baitCounts = {};
  // Count occurrences of each bait
  data.forEach((fish) => {
    if (fish.bait) {
      baitCounts[fish.bait] = (baitCounts[fish.bait] || 0) + 1;
    }
  });
  // Convert to array and sort by count descending
  return Object.entries(baitCounts)
    .map(([bait, count]) => ({ bait, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Function to count and sort baits by usage frequency this year and first 3
function baitUsageStatsThisYear() {
  const baitCountsThisYear = {};
  // Count occurrences of each bait
  data.forEach((fish) => {
    if (fish.bait && fish.date.startsWith(currentYear)) {
      baitCountsThisYear[fish.bait] = (baitCountsThisYear[fish.bait] || 0) + 1;
    }
  });
  // Convert to array and sort by count descending
  return Object.entries(baitCountsThisYear)
    .map(([bait, count]) => ({ bait, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

// Function to count and sort colours by usage frequency and first 5
function colourUsageStats() {
  const colourCounts = {};
  // Count occurrences of each colour
  data.forEach((fish) => {
    if (fish.colour) {
      colourCounts[fish.colour] = (colourCounts[fish.colour] || 0) + 1;
    }
  });
  // Convert to array and sort by count descending
  return Object.entries(colourCounts)
    .map(([colour, count]) => ({ colour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Function to count and sort colours by usage frequency this year and first 3
function colourUsageStatsThisYear() {
  const colourCountsThisYear = {};
  // Count occurrences of each colour
  data.forEach((fish) => {
    if (fish.colour && fish.date.startsWith(currentYear)) {
      colourCountsThisYear[fish.colour] =
        (colourCountsThisYear[fish.colour] || 0) + 1;
    }
  });
  // Convert to array and sort by count descending
  return Object.entries(colourCountsThisYear)
    .map(([colour, count]) => ({ colour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
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

///////////////////////////Bait///////////////////////////
// Sort bait usage statistics
const baitStats = baitUsageStats();

// Sort bait usage statistics this year
const baitStatsThisYear = baitUsageStatsThisYear();

///////////////////////////Colours///////////////////////////
// Sort colours usage statistics
const colourStats = colourUsageStats();

// Sort colours usage statistics this year
const colourStatsThisYear = colourUsageStatsThisYear();

//To be able to get form data
app.use(express.urlencoded({ extended: true }));

////////////////////////////
////////// ROUTES //////////
////////////////////////////

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
    baitStats: baitStats,
    baitStatsThisYear: baitStatsThisYear,
    colourStats: colourStats,
    colourStatsThisYear: colourStatsThisYear,
  });
});

// Listening to port 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
