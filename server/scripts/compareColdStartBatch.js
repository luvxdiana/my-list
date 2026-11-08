// Cold Start Batch Experiment

const { createHash } = require("node:crypto");

const pool = require("../db");

const { loadCompassCatalog } = require("../services/compassCatalog");

const {
  recommendMedia,
  ALGORITHM_VERSION,
} = require("../services/compassEngine");

// Experiment Configuration

const TEST_EMAIL = "annotation.test@example.com";

const SCENARIOS = [
  {
    id: "S01",
    mood: "sad",
    emotion: "inspiration",
    time: "180plus",
    type: "movie",
  },
  {
    id: "S02",
    mood: "sad",
    emotion: "comfort",
    time: "180plus",
    type: "movie",
  },
  {
    id: "S03",
    mood: "anxious",
    emotion: "calm",
    time: "180plus",
    type: "movie",
  },
  {
    id: "S04",
    mood: "happy",
    emotion: "joy",
    time: "180plus",
    type: "movie",
  },
  {
    id: "S05",
    mood: "excited",
    emotion: "thrill",
    time: "180plus",
    type: "movie",
  },
  {
    id: "S06",
    mood: "tired",
    emotion: "energy",
    time: "180plus",
    type: "movie",
  },
  {
    id: "S07",
    mood: "calm",
    emotion: "inspiration",
    time: "180plus",
    type: "either",
  },
  {
    id: "S08",
    mood: "happy",
    emotion: "joy",
    time: "180plus",
    type: "either",
  },
  {
    id: "S09",
    mood: "tired",
    emotion: "comfort",
    time: "120",
    type: "series",
  },
  {
    id: "S10",
    mood: "sad",
    emotion: "inspiration",
    time: "120",
    type: "movie",
  },
  {
    id: "S11",
    mood: "excited",
    emotion: "thrill",
    time: "120",
    type: "movie",
  },
  {
    id: "S12",
    mood: "anxious",
    emotion: "comfort",
    time: "90",
    type: "either",
  },
];

// Helpers

function getMediaIds(recommendations) {
  return recommendations.map((media) => String(media.id));
}

function getGenreHits(recommendations, preferredGenres) {
  const preferred = new Set(
    preferredGenres.map((genre) => genre.toLowerCase()),
  );

  return recommendations.filter((media) => {
    return media.genres.some((genre) => preferred.has(genre.toLowerCase()));
  }).length;
}

function getOverlapAt3(baseline, coldStart) {
  if (baseline.length !== 3 || coldStart.length !== 3) {
    return null;
  }

  const baselineIds = new Set(getMediaIds(baseline));

  const shared = coldStart.filter((media) => baselineIds.has(String(media.id)));

  return Number((shared.length / 3).toFixed(4));
}

function rankingsAreIdentical(baseline, coldStart) {
  return (
    JSON.stringify(getMediaIds(baseline)) ===
    JSON.stringify(getMediaIds(coldStart))
  );
}

// Load User Preferences

async function loadUserGenres() {
  const result = await pool.query(
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
    [TEST_EMAIL],
  );

  return result.rows.map((row) => row.name);
}

// Experiment

async function runExperiment() {
  const preferredGenres = await loadUserGenres();

  if (preferredGenres.length === 0) {
    throw new Error("Completed Cold Start profile not found.");
  }

  const catalog = await loadCompassCatalog();

  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error("Compass catalog is empty.");
  }

  const catalogHash = createHash("sha256")
    .update(JSON.stringify(catalog))
    .digest("hex")
    .slice(0, 16);

  console.log("\nMYLIST COMPASS");
  console.log("COLD START BATCH EXPERIMENT\n");

  console.log("Algorithm:", ALGORITHM_VERSION);
  console.log("Catalog size:", catalog.length);
  console.log("Catalog fingerprint:", catalogHash);
  console.log("Scenarios:", SCENARIOS.length);

  console.log("Preferred genres:", preferredGenres.join(", "));

  console.log("\nSCENARIO CONFIGURATION");

  console.table(SCENARIOS);

  const results = [];

  // Run Scenarios

  for (const scenario of SCENARIOS) {
    const parameters = {
      catalog,
      currentMood: scenario.mood,
      desiredEmotion: scenario.emotion,
      availableTime: scenario.time,
      contentType: scenario.type,
    };

    const baseline = recommendMedia({
      ...parameters,
      preferredGenres: [],
    });

    const coldStart = recommendMedia({
      ...parameters,
      preferredGenres,
    });

    const identical = rankingsAreIdentical(baseline, coldStart);

    results.push({
      scenario: scenario.id,

      baselineCount: baseline.length,
      coldStartCount: coldStart.length,

      rankingChanged: !identical,

      overlapAt3: getOverlapAt3(baseline, coldStart),

      baselineGenreHits: getGenreHits(baseline, preferredGenres),

      coldStartGenreHits: getGenreHits(coldStart, preferredGenres),

      baselineTitles: baseline.map((media) => media.title),

      coldStartTitles: coldStart.map((media) => media.title),
    });
  }

  // Summary

  console.log("\nEXPERIMENT RESULTS");

  console.table(
    results.map((result) => ({
      scenario: result.scenario,
      baseline: result.baselineCount,
      coldStart: result.coldStartCount,
      changed: result.rankingChanged,
      overlapAt3: result.overlapAt3,
      baselineGenreHits: result.baselineGenreHits,
      coldStartGenreHits: result.coldStartGenreHits,
    })),
  );

  // Aggregated Metrics

  const changedScenarios = results.filter((result) => result.rankingChanged);

  const completeScenarios = results.filter(
    (result) => result.overlapAt3 !== null,
  );

  const averageOverlap =
    completeScenarios.length > 0
      ? completeScenarios.reduce((sum, result) => sum + result.overlapAt3, 0) /
        completeScenarios.length
      : null;

  const baselineGenreHits = results.reduce(
    (sum, result) => sum + result.baselineGenreHits,
    0,
  );

  const coldStartGenreHits = results.reduce(
    (sum, result) => sum + result.coldStartGenreHits,
    0,
  );

  console.log("\nAGGREGATED METRICS");

  console.table([
    {
      metric: "Total scenarios",
      value: results.length,
    },
    {
      metric: "Scenarios with changed ranking",
      value: changedScenarios.length,
    },
    {
      metric: "Scenarios with complete Top-3",
      value: completeScenarios.length,
    },
    {
      metric: "Mean Overlap@3",
      value: averageOverlap === null ? "N/A" : averageOverlap.toFixed(4),
    },
    {
      metric: "Baseline genre hits",
      value: baselineGenreHits,
    },
    {
      metric: "Cold Start genre hits",
      value: coldStartGenreHits,
    },
  ]);

  // Changed Recommendations

  console.log("\nCHANGED RECOMMENDATIONS");

  if (changedScenarios.length === 0) {
    console.log("No ranking changes detected.");
  }

  for (const result of changedScenarios) {
    console.log(`\nScenario: ${result.scenario}`);

    console.log("Baseline:", result.baselineTitles.join(" → ") || "No matches");

    console.log(
      "Cold Start:",
      result.coldStartTitles.join(" → ") || "No matches",
    );
  }

  console.log("\nExperiment completed.");
  console.log("No database records were modified.");
}

// Run

runExperiment()
  .catch((error) => {
    console.error("Experiment error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
