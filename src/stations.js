// ─────────────────────────────────────────────────────────────────────────────
// stations.js  –  Tesla Radio pre-configured station presets
//
// ⚠️  CRITICAL: Tesla Browser – Mixed Content Policy
// ALL streamUrl values MUST begin with "https://"
// ─────────────────────────────────────────────────────────────────────────────

export const cities = [
  { id: "dfw", name: "Dallas–Fort Worth", emoji: "🤠" },
  { id: "houston", name: "Houston, TX", emoji: "🚀" },
  { id: "nyc", name: "New York, NY", emoji: "🗽" },
  { id: "la", name: "Los Angeles, CA", emoji: "🌴" },
  { id: "chicago", name: "Chicago, IL", emoji: "🌬️" },
  { id: "national", name: "National / NPR", emoji: "📡" },
];

export const stationsByCity = {
  // ── Dallas–Fort Worth ─────────────────────────────────────────────────────
  dfw: [
    {
      id: "dfw-wbap-fm",
      name: "WBAP 93.3",
      frequency: "93.3 FM",
      hdChannel: null,
      genre: "News / Talk",
      streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WBAPAMAAC_SC.aac",
      logoUrl: null,
      accentColor: "#e03030",
    },
    // FunAsia 104.9 HD Suite
    {
      id: "dfw-funasia-hd1",
      name: "FunAsiA 104.9 HD1",
      frequency: "104.9 FM",
      hdChannel: "HD1",
      genre: "Bollywood / Desi",
      streamUrl: "https://funasia.streamguys1.com/live-1",
      logoUrl: null,
      accentColor: "#f59e0b",
    },
    {
      id: "dfw-funasia-hd2",
      name: "Vanakkam FM",
      frequency: "104.9 FM",
      hdChannel: "HD2",
      genre: "Desi Talk / Music",
      streamUrl: "https://streamlky.alsolnet.com/vanakkamaudio",
      logoUrl: null,
      accentColor: "#f97316",
    },
    {
      id: "dfw-funasia-hd3",
      name: "Sadda Punjab HD3",
      frequency: "104.9 FM",
      hdChannel: "HD3",
      genre: "Punjabi",
      streamUrl: "https://funasia.streamguys1.com/live-3",
      logoUrl: null,
      accentColor: "#fbbf24",
    },
    {
      id: "dfw-funasia-hd4",
      name: "Radio Sangam HD4",
      frequency: "104.9 FM",
      hdChannel: "HD4",
      genre: "Community / Talk",
      streamUrl: "https://stream.voxx.pro/listen/radio_sangam/radio.mp3",
      logoUrl: null,
      accentColor: "#fcd34d",
    },
    {
      id: "dfw-107.9-hd3",
      name: "Radio Surabhi HD3",
      frequency: "107.9 FM",
      hdChannel: "HD3",
      genre: "Telugu / Desi",
      streamUrl: "https://radiosurabhi.streamguys1.com/live1-web",
      logoUrl: null,
      accentColor: "#f59e0b",
    },
    {
      id: "dfw-kera",
      name: "KERA 90.1",
      frequency: "90.1 FM",
      hdChannel: null,
      genre: "NPR / Public Radio",
      streamUrl: "https://kera.streamguys1.com/keralive-aac",
      logoUrl: null,
      accentColor: "#6366f1",
    },
    {
      id: "dfw-wrr",
      name: "WRR Classical",
      frequency: "101.1 FM",
      hdChannel: null,
      genre: "Classical",
      streamUrl: "https://kera.streamguys1.com/wrrlive-aac",
      logoUrl: null,
      accentColor: "#d97706",
    },
    {
      id: "dfw-kkxt",
      name: "KXT 91.7",
      frequency: "91.7 FM",
      hdChannel: null,
      genre: "Independent Music",
      streamUrl: "https://kera.streamguys1.com/kxtlive-aac",
      logoUrl: null,
      accentColor: "#16a34a",
    },
  ],

  // ── Other Cities ──────────────────────────────────────────────────────────
  houston: [
    {
      id: "hou-kuhf",
      name: "KUHF 88.7",
      frequency: "88.7 FM",
      genre: "NPR / Public Radio",
      streamUrl: "https://stream.houstonpublicmedia.org/news-aac",
      accentColor: "#0ea5e9",
    }
  ],
  national: [
    {
      id: "nat-npr",
      name: "NPR News",
      frequency: "National",
      genre: "News / Talk",
      streamUrl: "https://npr-ice.streamguys1.com/live.mp3",
      accentColor: "#6366f1",
    }
  ],
};
