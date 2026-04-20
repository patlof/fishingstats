import express from "express";
import Database from "better-sqlite3";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express and port
const app = express();
const port = 4000;

//Translation package

i18next
  .use(Backend)
  // .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "sv"], // Preload languages
    backend: {
      loadPath: __dirname + "/locales/{{lng}}/{{ns}}.json",
    },
  });

app.use(middleware.handle(i18next));
app.use((req, res, next) => {
  res.locals.t = req.t; // Make t() available in all languages
  res.locals.language = req.language; //Make languagecode available
  next();
});

//Static pages and set ejs
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

  res.render("catch.ejs", {
    success: req.t("Your fish has been registrated!"),
  });
});

app.get("/statistics", (req, res) => {
  const data = db.prepare("SELECT * FROM fish").all();
  const currentYear = new Date().getFullYear().toString();

  // Get translated species names for database queries
  const pikeTranslated = req.t("Pike");
  const perchTranslated = req.t("Perch");
  const zanderTranslated = req.t("Zander");

  const pikeByWeight = fishByWeight(data, pikeTranslated);
  const pikeByWeightThisYear = fishByWeightThisYear(
    data,
    currentYear,
    pikeTranslated,
  );
  const pikeByLength = fishByLength(data, pikeTranslated);
  const pikeByLengthThisYear = fishByLengthThisYear(
    data,
    currentYear,
    pikeTranslated,
  );

  const perchByWeight = fishByWeight(data, perchTranslated);
  const perchByWeightThisYear = fishByWeightThisYear(
    data,
    currentYear,
    perchTranslated,
  );
  const perchByLength = fishByLength(data, perchTranslated);
  const perchByLengthThisYear = fishByLengthThisYear(
    data,
    currentYear,
    perchTranslated,
  );

  const zanderByWeight = fishByWeight(data, zanderTranslated);
  const zanderByWeightThisYear = fishByWeightThisYear(
    data,
    currentYear,
    zanderTranslated,
  );
  const zanderByLength = fishByLength(data, zanderTranslated);
  const zanderByLengthThisYear = fishByLengthThisYear(
    data,
    currentYear,
    zanderTranslated,
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
    currentYear,
  });
});

// Listening to port 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
