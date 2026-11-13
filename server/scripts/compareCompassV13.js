// Compass Version Comparison

const {
  recommendMedia,
  recommendMediaBaseline,
} = require("../services/compassEngine");

const catalog = [
  {
    id: 1,
    title: "Example Comedy",
    category: "movie",
    release_year: 2026,
    duration_minutes: 95,
    genres: ["Comedy", "Romance"],
    emotions: ["joy"],
  },
  {
    id: 2,
    title: "Example Animation",
    category: "movie",
    release_year: 2026,
    duration_minutes: 90,
    genres: ["Animation", "Family"],
    emotions: ["joy"],
  },
  {
    id: 3,
    title: "Example Family Comedy",
    category: "movie",
    release_year: 2026,
    duration_minutes: 110,
    genres: ["Comedy", "Family"],
    emotions: ["joy"],
  },
];

const preferences = {
  catalog,
  currentMood: "happy",
  desiredEmotion: "joy",
  availableTime: "180plus",
  contentType: "either",
  preferredGenres: [],
};

const historicalFeedback = [
  {
    current_mood: "happy",
    desired_emotion: "joy",
    emotional_fit_rating: 5,
    genres: ["Comedy", "Romance"],
  },
  {
    current_mood: "happy",
    desired_emotion: "joy",
    emotional_fit_rating: 4,
    genres: ["Comedy", "Romance"],
  },
];

const baseline = recommendMediaBaseline(preferences);
const adapted = recommendMedia({ ...preferences, historicalFeedback });

console.log("TEST DATA ONLY - not independent user research");
console.log("Baseline v1.2:");
console.table(
  baseline.map((item) => ({ title: item.title, score: item.score })),
);
console.log("Adaptive v1.3:");
console.table(
  adapted.map((item) => ({
    title: item.title,
    base_score: item.base_score,
    adjustment: item.personalization_adjustment,
    score: item.score,
  })),
);
