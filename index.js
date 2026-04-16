import express from "express";
import Database from "better-sqlite3";

const app = express();
const port = 4000;
app.use(express.static("public"));
app.set("view engine", "ejs");

// Connect to db
const db = new Database("data.db");

// Function for sort fish by weight and first 3.
function fishByWeight(data, species) {
  return data
    .filter((fish) => fish.species === species)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}
//Function for sort fish by weight this year and first 3.
function fishByWeightThisYear(data, currentYear, species) {
  return data
    .filter(
      (fish) => fish.species === species && fish.date.startsWith(currentYear),
    )
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}

//Function for sort fish by length and first 3.
function fishByLength(data, species) {
  return data
    .filter((fish) => fish.species === species)
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);
}

//Function for sort fish by length this year and first 3.
function fishByLengthThisYear(data, currentYear, species) {
  return data
    .filter(
      (fish) => fish.species === species && fish.date.startsWith(currentYear),
    )
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);
}

// Function to count and sort baits by usage frequency and first 5
function baitUsageStats(data) {
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
function baitUsageStatsThisYear(data, currentYear) {
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
function colourUsageStats(data) {
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
function colourUsageStatsThisYear(data, currentYear) {
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
  const data = db.prepare("SELECT * FROM fish").all();
  const currentYear = new Date().getFullYear().toString();

  const pikeByWeight = fishByWeight(data, "Pike");
  const pikeByWeightThisYear = fishByWeightThisYear(data, currentYear, "Pike");
  const pikeByLength = fishByLength(data, "Pike");
  const pikeByLengthThisYear = fishByLengthThisYear(data, currentYear, "Pike");

  const perchByWeight = fishByWeight(data, "Perch");
  const perchByWeightThisYear = fishByWeightThisYear(
    data,
    currentYear,
    "Perch",
  );
  const perchByLength = fishByLength(data, "Perch");
  const perchByLengthThisYear = fishByLengthThisYear(
    data,
    currentYear,
    "Perch",
  );

  const zanderByWeight = fishByWeight(data, "Zander");
  const zanderByWeightThisYear = fishByWeightThisYear(
    data,
    currentYear,
    "Zander",
  );
  const zanderByLength = fishByLength(data, "Zander");
  const zanderByLengthThisYear = fishByLengthThisYear(
    data,
    currentYear,
    "Zander",
  );

  const baitStats = baitUsageStats(data);
  const baitStatsThisYear = baitUsageStatsThisYear(data, currentYear);

  const colourStats = colourUsageStats(data);
  const colourStatsThisYear = colourUsageStatsThisYear(data, currentYear);

  res.render("statistics.ejs", {
    pikeByWeight,
    pikeByWeightThisYear,
    pikeByLength,
    pikeByLengthThisYear,
    perchByWeight,
    perchByWeightThisYear,
    perchByLength,
    perchByLengthThisYear,
    zanderByWeight,
    zanderByWeightThisYear,
    zanderByLength,
    zanderByLengthThisYear,
    baitStats,
    baitStatsThisYear,
    colourStats,
    colourStatsThisYear,
  });
});

// Listening to port 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
