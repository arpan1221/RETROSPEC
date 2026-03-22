/**
 * RETROSPEC Flyover — "Watch the Story of AI"
 *
 * Chronological camera journey across 15 cities where AI history happened.
 * Each stop shows a label with the year, city, and key event.
 * Uses Mapbox's native flyTo() for smooth camera transitions.
 */

export interface FlyoverStop {
  id: string;
  year: string;
  city: string;
  label: string;
  lng: number;
  lat: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
  duration: number; // ms for the flyTo animation
  pause: number; // ms to hold at this stop before moving
}

export const FLYOVER_STOPS: FlyoverStop[] = [
  {
    id: "llull",
    year: "1305",
    city: "Palma, Mallorca",
    label: "Ramon Llull envisions mechanical reasoning",
    lng: 2.6502,
    lat: 39.5696,
    zoom: 6,
    pitch: 40,
    duration: 3000,
    pause: 3000,
  },
  {
    id: "babbage",
    year: "1837",
    city: "London, UK",
    label: "Babbage & Lovelace design the Analytical Engine",
    lng: -0.1278,
    lat: 51.5074,
    zoom: 7,
    pitch: 30,
    duration: 3000,
    pause: 3000,
  },
  {
    id: "turing",
    year: "1950",
    city: "Manchester, UK",
    label: "Turing asks: \"Can machines think?\"",
    lng: -2.2426,
    lat: 53.4808,
    zoom: 8,
    pitch: 30,
    duration: 2500,
    pause: 3000,
  },
  {
    id: "dartmouth",
    year: "1956",
    city: "Hanover, NH",
    label: "Dartmouth Conference — AI is born",
    lng: -72.2896,
    lat: 43.7022,
    zoom: 8,
    pitch: 40,
    duration: 4000,
    pause: 3000,
  },
  {
    id: "mit",
    year: "1959",
    city: "Cambridge, MA",
    label: "Minsky & McCarthy found the MIT AI Lab",
    lng: -71.1097,
    lat: 42.3736,
    zoom: 9,
    pitch: 35,
    duration: 2000,
    pause: 2500,
  },
  {
    id: "tokyo",
    year: "1981",
    city: "Tokyo, Japan",
    label: "Japan launches the Fifth Generation Project",
    lng: 139.6503,
    lat: 35.6762,
    zoom: 7,
    pitch: 30,
    duration: 4500,
    pause: 2500,
  },
  {
    id: "backprop",
    year: "1986",
    city: "Stanford, CA",
    label: "Backpropagation revives neural networks",
    lng: -122.1697,
    lat: 37.4275,
    zoom: 8,
    pitch: 35,
    duration: 4500,
    pause: 3000,
  },
  {
    id: "toronto",
    year: "2006",
    city: "Toronto, Canada",
    label: "Hinton ignites the deep learning revolution",
    lng: -79.3832,
    lat: 43.6532,
    zoom: 8,
    pitch: 35,
    duration: 3000,
    pause: 3000,
  },
  {
    id: "montreal",
    year: "2014",
    city: "Montreal, Canada",
    label: "Bengio's lab invents the attention mechanism",
    lng: -73.5673,
    lat: 45.5017,
    zoom: 8,
    pitch: 30,
    duration: 2000,
    pause: 3000,
  },
  {
    id: "seoul",
    year: "2016",
    city: "Seoul, South Korea",
    label: "AlphaGo defeats Lee Sedol — 200M viewers",
    lng: 126.9780,
    lat: 37.5665,
    zoom: 7,
    pitch: 40,
    duration: 4500,
    pause: 3000,
  },
  {
    id: "transformer",
    year: "2017",
    city: "Mountain View, CA",
    label: "\"Attention Is All You Need\" — the Transformer",
    lng: -122.0839,
    lat: 37.3861,
    zoom: 9,
    pitch: 40,
    duration: 4500,
    pause: 3500,
  },
  {
    id: "chatgpt",
    year: "2022",
    city: "San Francisco, CA",
    label: "ChatGPT launches — 100M users in 2 months",
    lng: -122.4194,
    lat: 37.7749,
    zoom: 10,
    pitch: 45,
    duration: 2000,
    pause: 3500,
  },
  {
    id: "deepseek",
    year: "2025",
    city: "Hangzhou, China",
    label: "DeepSeek R1 — frontier AI for under $6M",
    lng: 120.1551,
    lat: 30.2741,
    zoom: 7,
    pitch: 35,
    duration: 4500,
    pause: 3000,
  },
  {
    id: "mcp",
    year: "2025",
    city: "San Francisco, CA",
    label: "MCP becomes the standard — agents go autonomous",
    lng: -122.4194,
    lat: 37.7749,
    zoom: 8,
    bearing: 20,
    pitch: 50,
    duration: 4000,
    pause: 3500,
  },
  {
    id: "finale",
    year: "2026",
    city: "The World",
    label: "AI history is everywhere. RETROSPEC maps it all.",
    lng: -20,
    lat: 30,
    zoom: 2,
    bearing: 0,
    pitch: 0,
    duration: 4000,
    pause: 4000,
  },
];

/** Total flyover duration in ms */
export function getTotalDuration(): number {
  return FLYOVER_STOPS.reduce((sum, stop) => sum + stop.duration + stop.pause, 0);
}
