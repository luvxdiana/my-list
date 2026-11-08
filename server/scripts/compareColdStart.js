// Cold Start Comparison

const pool = require("../db");

const { loadCompassCatalog } = require("../services/compassCatalog");

const {
  recommendMedia,
  ALGORITHM_VERSION,
} = require("../services/compassEngine");

// Experiment

async function compareColdStart() {
  const email = "annotation.test@example.com";

  // User Preferences

  const preferencesResult = await pool.query(
    `
        SELECT g.name
        FROM public.users AS u

        JOIN public.compass_preferences AS p
            ON p.user_id = u.id

        JOIN public.compass_preferred_genres AS pg
            ON pg.user_id = p.user_id

        JOIN public.genres AS g
            ON g.id = pg.genre_id

        WHERE LOWER(u.email) = LOWER($1)
          AND p.onboarding_completed = TRUE

        ORDER BY g.name
        `,
    [email],
  );

  const preferredGenres = preferencesResult.rows.map((row) => row.name);

  if (preferredGenres.length === 0) {
    throw new Error("Completed Cold Start profile not found.");
  }

  // Shared Catalog

  const catalog = await loadCompassCatalog();

  // Shared Parameters

  const parameters = {
    catalog,
    currentMood: "sad",
    desiredEmotion: "inspiration",
    availableTime: "180plus",
    contentType: "movie",
  };

  // Baseline

  const baseline = recommendMedia({
    ...parameters,
    preferredGenres: [],
  });

  // Cold Start

  const coldStart = recommendMedia({
    ...parameters,
    preferredGenres,
  });

  // Results

  console.log("\nMYLIST COMPASS EXPERIMENT");

  console.log("\nAlgorithm:", ALGORITHM_VERSION);

  console.log("Preferred genres:", preferredGenres.join(", "));

  console.log("\nBASELINE");

  console.table(
    baseline.map((movie) => ({
      position: movie.position,
      title: movie.title,
      score: movie.score,
    })),
  );

  console.log("\nCOLD START");

  console.table(
    coldStart.map((movie) => ({
      position: movie.position,
      title: movie.title,
      score: movie.score,
    })),
  );

  // Comparison

  const baselineTitles = baseline.map((movie) => movie.title);

  const coldStartTitles = coldStart.map((movie) => movie.title);

  const identicalRanking =
    JSON.stringify(baselineTitles) === JSON.stringify(coldStartTitles);

  console.log("\nCOMPARISON");

  console.table([
    {
      metric: "Baseline recommendations",
      value: baseline.length,
    },
    {
      metric: "Cold Start recommendations",
      value: coldStart.length,
    },
    {
      metric: "Identical ranking",
      value: identicalRanking,
    },
  ]);
}

// Run

compareColdStart()
  .catch((error) => {
    console.error("Experiment error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
