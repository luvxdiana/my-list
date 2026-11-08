// Dependencies

const readline = require("node:readline/promises");

const { stdin: input, stdout: output } = require("node:process");

const pool = require("../db");

const rl = readline.createInterface({
  input,
  output,
});

// Emotions

const EMOTION_CODES = [
  "joy",
  "comfort",
  "calm",
  "inspiration",
  "thrill",
  "energy",
];

// Input

async function askNumber(question, min, max) {
  while (true) {
    const answer = (await rl.question(question)).trim();

    const number = Number(answer);

    if (
      answer !== "" &&
      Number.isInteger(number) &&
      number >= min &&
      number <= max
    ) {
      return number;
    }

    console.log(`Enter a number from ${min} to ${max}.`);
  }
}

async function askChoice(question, choices) {
  while (true) {
    const answer = (await rl.question(question)).trim().toLowerCase();

    if (choices.includes(answer)) {
      return answer;
    }

    console.log(`Available options: ${choices.join(", ")}`);
  }
}

// Annotation

async function annotateMedia() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Annotation is allowed only in development mode.");
  }

  console.log("\nMYLIST COMPASS");
  console.log("Emotional Annotation Tool v1.0\n");

  // Catalog

  const mediaResult = await pool.query(`
        SELECT
            id,
            title,
            category,
            release_year
        FROM public.media_catalog
        ORDER BY title
    `);

  const catalog = mediaResult.rows;

  if (catalog.length === 0) {
    throw new Error("Media catalog is empty.");
  }

  console.table(catalog);

  const selectedId = (await rl.question("Enter media ID: ")).trim();

  const media = catalog.find((item) => String(item.id) === selectedId);

  if (!media) {
    throw new Error("Media item not found.");
  }

  console.log(`\nSelected: ${media.title}`);

  // Annotator

  const annotatorCode = (
    await rl.question("Enter annotator code (example: A001): ")
  ).trim();

  if (!/^[A-Za-z0-9_-]{3,64}$/.test(annotatorCode)) {
    throw new Error("Invalid annotator code.");
  }

  const annotationRound = await askNumber(
    "Annotation round (1-1000): ",
    1,
    1000,
  );

  // Evidence

  const evidenceSource = await askChoice(
    "Evidence source (watched/synopsis/trailer): ",
    ["watched", "synopsis", "trailer"],
  );

  const evidenceReference = (
    await rl.question("Evidence reference (optional): ")
  ).trim();

  if (evidenceReference.length > 500) {
    throw new Error("Evidence reference is too long.");
  }

  const annotationNote = (
    await rl.question("Annotation note (optional): ")
  ).trim();

  if (annotationNote.length > 2000) {
    throw new Error("Annotation note is too long.");
  }

  // Emotions

  const emotionsResult = await pool.query(`
        SELECT id, code, name
        FROM public.emotions
    `);

  const emotionMap = new Map(
    emotionsResult.rows.map((emotion) => [emotion.code, emotion]),
  );

  const annotations = [];

  console.log("\nIntensity: 0-3");
  console.log("Confidence: 1-3\n");

  for (const code of EMOTION_CODES) {
    const emotion = emotionMap.get(code);

    if (!emotion) {
      throw new Error(`Emotion ${code} is missing from database.`);
    }

    console.log(`\n${emotion.name} (${code})`);

    const intensity = await askNumber("Intensity (0-3): ", 0, 3);

    const confidence = await askNumber("Confidence (1-3): ", 1, 3);

    annotations.push({
      emotion_id: emotion.id,
      emotion: emotion.name,
      intensity,
      confidence,
    });
  }

  // Review

  console.log("\nAnnotation summary:");
  console.log(`Media: ${media.title}`);
  console.log(`Annotator: ${annotatorCode}`);
  console.log(`Round: ${annotationRound}`);
  console.log(`Evidence: ${evidenceSource}`);

  console.table(
    annotations.map((item) => ({
      emotion: item.emotion,
      intensity: item.intensity,
      confidence: item.confidence,
    })),
  );

  console.log("\nIMPORTANT: Save only to the Neon development branch.");

  const confirmation = (
    await rl.question("Confirm dev-mylist-compass branch and save? Type SAVE: ")
  ).trim();

  if (confirmation !== "SAVE") {
    console.log("Annotation was not saved.");
    return;
  }

  // Save

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const annotation of annotations) {
      await client.query(
        `
                INSERT INTO public.media_emotion_annotations (
                    media_id,
                    emotion_id,
                    annotator_code,
                    intensity,
                    confidence,
                    evidence_source,
                    evidence_reference,
                    annotation_status,
                    annotation_note,
                    annotation_round,
                    protocol_version
                )
                VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, 'preliminary',
                    $8, $9, 'v1.0'
                )
                `,
        [
          media.id,
          annotation.emotion_id,
          annotatorCode,
          annotation.intensity,
          annotation.confidence,
          evidenceSource,
          evidenceReference || null,
          annotationNote || null,
          annotationRound,
        ],
      );
    }

    await client.query("COMMIT");

    console.log("\nSuccess! Six emotional annotations saved.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Start

annotateMedia()
  .catch((error) => {
    console.error("\nAnnotation error:", error.message);
  })
  .finally(async () => {
    rl.close();
    await pool.end();
  });
