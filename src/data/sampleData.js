// Fake placeholder data for sections that don't have a real source wired up yet.
// Real Discover data lives in src/data/realPlaces.js (pulled from OpenStreetMap).

export const sampleEvents = [
  {
    id: 1,
    name: "Delhi Half Marathon 2026",
    date: "2026-11-22",
    venue: "India Gate",
    organiser: "Delhi Runners Club",
    type: "Marathon",
    description:
      "A 21km run through central Delhi starting and finishing at India Gate. Open to all skill levels, with 5km and 10km fun-run options alongside the half marathon.",
    registrationUrl: "https://example.com/register/delhi-half-marathon",
  },
  {
    id: 2,
    name: "City Badminton Open",
    date: "2026-10-05",
    venue: "Thyagaraj Sports Complex",
    organiser: "Delhi Badminton Association",
    type: "Tournament",
    description:
      "Amateur and semi-pro singles/doubles tournament with cash prizes for top finishers. Registration closes one week before the event.",
    registrationUrl: "https://example.com/register/city-badminton-open",
  },
  {
    id: 3,
    name: "Sunrise Yoga & Wellness Fest",
    date: "2026-09-28",
    venue: "Lodhi Garden",
    organiser: "MindBody Collective",
    type: "Wellness",
    description:
      "A morning of guided yoga, breathwork and meditation sessions led by instructors from across Delhi, followed by a healthy breakfast pop-up.",
    registrationUrl: "https://example.com/register/sunrise-yoga-fest",
  },
];

export const sampleProducts = [
  {
    id: 1,
    brand: "MuscleBlaze",
    name: "Biozyme Whey Protein 1kg",
    price: "₹1,799",
    buyUrl: "https://www.muscleblaze.com/",
  },
  {
    id: 2,
    brand: "Optimum Nutrition",
    name: "Gold Standard 100% Whey 2lb",
    price: "₹3,499",
    buyUrl: "https://www.optimumnutrition.com/en-us/",
  },
  {
    id: 3,
    brand: "Boldfit",
    name: "Adjustable Dumbbell Set 20kg",
    price: "₹2,299",
    buyUrl: "https://www.boldfit.in/",
  },
  {
    id: 4,
    brand: "HealthKart",
    name: "HK Vitals Multivitamin (60 tabs)",
    price: "₹499",
    buyUrl: "https://www.healthkart.com/",
  },
];
