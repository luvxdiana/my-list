// Compass Adaptive Tests

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  recommendMedia,
  recommendMediaBaseline,
  ALGORITHM_VERSION,
  BASELINE_ALGORITHM_VERSION,
} = require("../services/compassEngine");

const catalog = [
  {
    id: 1,
    title: "Comedy Choice",
    category: "movie",
    release_year: 2020,
    duration_minutes: 90,
    genres: ["Comedy"],
    emotions: ["joy"],
  },
  {
    id: 2,
    title: "Drama Choice",
    category: "movie",
    release_year: 2021,
    duration_minutes: 110,
    genres: ["Drama"],
    emotions: ["joy"],
  },
  {
    id: 3,
    title: "Fantasy Choice",
    category: "movie",
    release_year: 2022,
    duration_minutes: 95,
    genres: ["Fantasy"],
    emotions: ["joy"],
  },
  {
    id: 4,
    title: "No Emotional Tag",
    category: "movie",
    release_year: 2019,
    duration_minutes: 85,
    genres: ["Comedy"],
    emotions: [],
  },
];

const options = {
  catalog,
  currentMood: "happy",
  desiredEmotion: "joy",
  availableTime: "180plus",
  contentType: "either",
  preferredGenres: [],
};

const feedback = (rating, changes = {}) => ({
  current_mood: "happy",
  desired_emotion: "joy",
  emotional_fit_rating: rating,
  genres: ["Comedy"],
  ...changes,
});

test("cold start matches v1.2 titles, order and scores", () => {
  const previous = recommendMediaBaseline(options);
  const next = recommendMedia({ ...options, historicalFeedback: [] });

  assert.equal(ALGORITHM_VERSION, "compass-hybrid-v1.3");
  assert.equal(BASELINE_ALGORITHM_VERSION, "compass-heuristic-v1.2");
  assert.deepEqual(
    next.map((item) => item.title),
    previous.map((item) => item.title),
  );
  assert.deepEqual(
    next.map((item) => item.score),
    previous.map((item) => item.score),
  );
  assert(next.every((item) => item.personalization_adjustment === 0));
});

test("positive feedback increases relevant genre scores", () => {
  const next = recommendMedia({
    ...options,
    historicalFeedback: [feedback(5), feedback(5)],
  });

  const comedy = next.find((item) => item.title === "Comedy Choice");
  const drama = next.find((item) => item.title === "Drama Choice");

  assert(comedy.score > comedy.base_score);
  assert.equal(drama.personalization_adjustment, 0);
  assert.equal(next[0].title, "Comedy Choice");
});

test("negative feedback decreases relevant genre scores", () => {
  const next = recommendMedia({
    ...options,
    historicalFeedback: [feedback(1)],
  });
  const comedy = next.find((item) => item.title === "Comedy Choice");

  assert(comedy.score < comedy.base_score);
  assert.notEqual(next[0].title, "Comedy Choice");
});

test("different desired emotion does not influence results", () => {
  const next = recommendMedia({
    ...options,
    historicalFeedback: [feedback(1, { desired_emotion: "comfort" })],
  });

  assert(next.every((item) => item.personalization_adjustment === 0));
});

test("different genre does not influence unrelated media", () => {
  const next = recommendMedia({
    ...options,
    historicalFeedback: [feedback(5, { genres: ["Science Fiction"] })],
  });

  assert.equal(
    next.find((item) => item.title === "Drama Choice")
      .personalization_adjustment,
    0,
  );
  assert.equal(
    next.find((item) => item.title === "Comedy Choice")
      .personalization_adjustment,
    0,
  );
  assert.equal(
    next.find((item) => item.title === "Fantasy Choice")
      .personalization_adjustment,
    0,
  );
});

test("related combined Sci-Fi & Fantasy genre contributes partially", () => {
  const next = recommendMedia({
    ...options,
    historicalFeedback: [feedback(5, { genres: ["Sci-Fi & Fantasy"] })],
  });

  const fantasy = next.find((item) => item.title === "Fantasy Choice");
  assert(fantasy.personalization_adjustment > 0);
  assert(fantasy.personalization_adjustment < 0.04);
});

test("different mood carries a weaker signal", () => {
  const same = recommendMedia({
    ...options,
    historicalFeedback: [feedback(5)],
  });
  const different = recommendMedia({
    ...options,
    historicalFeedback: [feedback(5, { current_mood: "sad" })],
  });

  const adjustment = (list) =>
    list.find((item) => item.title === "Comedy Choice")
      .personalization_adjustment;

  assert(adjustment(same) > adjustment(different));
  assert(adjustment(different) > 0);
});

test("existing filters still exclude untagged and overlong media", () => {
  const next = recommendMedia({
    ...options,
    availableTime: "90",
    historicalFeedback: [feedback(5)],
  });

  assert.deepEqual(
    next.map((item) => item.title),
    ["Comedy Choice"],
  );
});

test("ratings outside 1-5 cannot contribute", () => {
  const next = recommendMedia({
    ...options,
    historicalFeedback: [feedback(999), feedback(0)],
  });

  assert(next.every((item) => item.personalization_adjustment === 0));
});

test("invalid input still fails validation", () => {
  assert.throws(
    () => recommendMedia({ ...options, contentType: "book" }),
    /Invalid content type/,
  );

  assert.throws(
    () => recommendMedia({ ...options, historicalFeedback: "invalid" }),
    /Historical feedback must be an array/,
  );
});
