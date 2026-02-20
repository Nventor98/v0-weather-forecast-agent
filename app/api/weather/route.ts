import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
  validateUIMessages,
} from "ai"
import { createGroq } from "@ai-sdk/groq"
import * as z from "zod"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export const maxDuration = 30

// All 36 Nigerian states + FCT with their capitals and geopolitical zones
const NIGERIAN_STATES: Record<
  string,
  { capital: string; zone: string; lat: number; lng: number }
> = {
  abia: { capital: "Umuahia", zone: "South East", lat: 5.53, lng: 7.49 },
  adamawa: { capital: "Yola", zone: "North East", lat: 9.23, lng: 12.46 },
  "akwa ibom": { capital: "Uyo", zone: "South South", lat: 5.04, lng: 7.93 },
  anambra: { capital: "Awka", zone: "South East", lat: 6.21, lng: 7.07 },
  bauchi: { capital: "Bauchi", zone: "North East", lat: 10.31, lng: 9.84 },
  bayelsa: { capital: "Yenagoa", zone: "South South", lat: 4.92, lng: 6.26 },
  benue: { capital: "Makurdi", zone: "North Central", lat: 7.73, lng: 8.54 },
  borno: { capital: "Maiduguri", zone: "North East", lat: 11.85, lng: 13.16 },
  "cross river": { capital: "Calabar", zone: "South South", lat: 4.96, lng: 8.33 },
  delta: { capital: "Asaba", zone: "South South", lat: 6.2, lng: 6.73 },
  ebonyi: { capital: "Abakaliki", zone: "South East", lat: 6.33, lng: 8.1 },
  edo: { capital: "Benin City", zone: "South South", lat: 6.34, lng: 5.63 },
  ekiti: { capital: "Ado-Ekiti", zone: "South West", lat: 7.62, lng: 5.22 },
  enugu: { capital: "Enugu", zone: "South East", lat: 6.44, lng: 7.5 },
  fct: { capital: "Abuja", zone: "North Central", lat: 9.06, lng: 7.49 },
  gombe: { capital: "Gombe", zone: "North East", lat: 10.29, lng: 11.17 },
  imo: { capital: "Owerri", zone: "South East", lat: 5.48, lng: 7.03 },
  jigawa: { capital: "Dutse", zone: "North West", lat: 11.76, lng: 9.34 },
  kaduna: { capital: "Kaduna", zone: "North West", lat: 10.52, lng: 7.43 },
  kano: { capital: "Kano", zone: "North West", lat: 12.0, lng: 8.52 },
  katsina: { capital: "Katsina", zone: "North West", lat: 13.0, lng: 7.6 },
  kebbi: { capital: "Birnin Kebbi", zone: "North West", lat: 12.45, lng: 4.2 },
  kogi: { capital: "Lokoja", zone: "North Central", lat: 7.8, lng: 6.74 },
  kwara: { capital: "Ilorin", zone: "North Central", lat: 8.5, lng: 4.55 },
  lagos: { capital: "Ikeja", zone: "South West", lat: 6.6, lng: 3.35 },
  nasarawa: { capital: "Lafia", zone: "North Central", lat: 8.49, lng: 8.52 },
  niger: { capital: "Minna", zone: "North Central", lat: 9.62, lng: 6.55 },
  ogun: { capital: "Abeokuta", zone: "South West", lat: 7.16, lng: 3.35 },
  ondo: { capital: "Akure", zone: "South West", lat: 7.25, lng: 5.19 },
  osun: { capital: "Osogbo", zone: "South West", lat: 7.77, lng: 4.56 },
  oyo: { capital: "Ibadan", zone: "South West", lat: 7.38, lng: 3.93 },
  plateau: { capital: "Jos", zone: "North Central", lat: 9.92, lng: 8.89 },
  rivers: { capital: "Port Harcourt", zone: "South South", lat: 4.82, lng: 7.03 },
  sokoto: { capital: "Sokoto", zone: "North West", lat: 13.06, lng: 5.24 },
  taraba: { capital: "Jalingo", zone: "North East", lat: 8.89, lng: 11.36 },
  yobe: { capital: "Damaturu", zone: "North East", lat: 11.75, lng: 11.96 },
  zamfara: { capital: "Gusau", zone: "North West", lat: 12.17, lng: 6.66 },
}

// Seed-based pseudo-random for consistency within a day
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateWeatherForState(stateName: string, lat: number) {
  const today = new Date()
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const stateSeed = stateName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const seed = daySeed + stateSeed

  // Nigeria temperature ranges based on latitude (north is hotter/drier, south is cooler/wetter)
  const isNorth = lat > 9
  const isMid = lat > 7 && lat <= 9
  const baseTemp = isNorth ? 35 : isMid ? 31 : 28

  const temp = Math.round(baseTemp + (seededRandom(seed) * 6 - 3))
  const humidity = isNorth
    ? Math.round(25 + seededRandom(seed + 1) * 30)
    : isMid
      ? Math.round(45 + seededRandom(seed + 1) * 25)
      : Math.round(60 + seededRandom(seed + 1) * 25)

  const wind = Math.round(5 + seededRandom(seed + 2) * 20)

  const conditionsPool = isNorth
    ? ["sunny", "sunny", "partly cloudy", "hazy", "windy"]
    : isMid
      ? ["partly cloudy", "sunny", "cloudy", "rainy", "overcast"]
      : ["rainy", "partly cloudy", "cloudy", "thunderstorm", "overcast", "sunny"]
  const conditions = conditionsPool[Math.floor(seededRandom(seed + 3) * conditionsPool.length)]

  return {
    temperature: temp,
    conditions,
    humidity,
    windSpeed: wind,
    high: temp + Math.round(seededRandom(seed + 4) * 4 + 1),
    low: temp - Math.round(seededRandom(seed + 5) * 4 + 1),
  }
}

function generateForecastForState(stateName: string, lat: number, days: number) {
  const today = new Date()
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const stateSeed = stateName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const isNorth = lat > 9
  const isMid = lat > 7 && lat <= 9

  return Array.from({ length: days }, (_, i) => {
    const seed = daySeed + stateSeed + (i + 1) * 100
    const baseTemp = isNorth ? 35 : isMid ? 31 : 28
    const high = Math.round(baseTemp + seededRandom(seed) * 6)
    const low = Math.round(baseTemp - seededRandom(seed + 1) * 6 - 2)

    const conditionsPool = isNorth
      ? ["sunny", "sunny", "partly cloudy", "hazy", "windy"]
      : isMid
        ? ["partly cloudy", "sunny", "cloudy", "rainy", "overcast"]
        : ["rainy", "partly cloudy", "cloudy", "thunderstorm", "overcast", "sunny"]

    const conditions = conditionsPool[Math.floor(seededRandom(seed + 2) * conditionsPool.length)]
    const precipitation = isNorth
      ? Math.round(seededRandom(seed + 3) * 30)
      : isMid
        ? Math.round(seededRandom(seed + 3) * 60)
        : Math.round(30 + seededRandom(seed + 3) * 60)

    const futureDate = new Date(today)
    futureDate.setDate(today.getDate() + i + 1)

    return {
      day: dayNames[futureDate.getDay()],
      date: futureDate.toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
      high,
      low,
      conditions,
      precipitation,
    }
  })
}

const getCurrentWeatherTool = tool({
  description:
    "Get the current weather for a Nigerian state. The state name should be lowercase (e.g., 'lagos', 'kano', 'fct').",
  inputSchema: z.object({
    state: z.string().describe("The Nigerian state name (lowercase)"),
  }),
  async *execute({ state }: { state: string }) {
    yield { state: "loading" as const }
    await new Promise((resolve) => setTimeout(resolve, 800))

    const key = state.toLowerCase().trim()
    const stateData = NIGERIAN_STATES[key]

    if (!stateData) {
      yield {
        state: "ready" as const,
        error: true,
        message: `State "${state}" not found. Please use a valid Nigerian state name.`,
      }
      return
    }

    const weather = generateWeatherForState(key, stateData.lat)

    yield {
      state: "ready" as const,
      error: false,
      stateName: key.charAt(0).toUpperCase() + key.slice(1),
      capital: stateData.capital,
      zone: stateData.zone,
      ...weather,
    }
  },
})

const getForecastTool = tool({
  description:
    "Get a multi-day forecast for a Nigerian state. The state name should be lowercase.",
  inputSchema: z.object({
    state: z.string().describe("The Nigerian state name (lowercase)"),
    days: z.number().min(1).max(7).describe("Number of forecast days (1-7)"),
  }),
  async *execute({ state, days }: { state: string; days: number }) {
    yield { state: "loading" as const }
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const key = state.toLowerCase().trim()
    const stateData = NIGERIAN_STATES[key]

    if (!stateData) {
      yield {
        state: "ready" as const,
        error: true,
        message: `State "${state}" not found.`,
      }
      return
    }

    const forecast = generateForecastForState(key, stateData.lat, days)

    yield {
      state: "ready" as const,
      error: false,
      stateName: key.charAt(0).toUpperCase() + key.slice(1),
      capital: stateData.capital,
      zone: stateData.zone,
      forecast,
    }
  },
})

const getAllStatesWeatherTool = tool({
  description: "Get current weather summary for all 37 Nigerian states at once.",
  inputSchema: z.object({}),
  async *execute() {
    yield { state: "loading" as const }
    await new Promise((resolve) => setTimeout(resolve, 500))

    const allWeather = Object.entries(NIGERIAN_STATES).map(([key, data]) => {
      const weather = generateWeatherForState(key, data.lat)
      return {
        state: key
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        capital: data.capital,
        zone: data.zone,
        ...weather,
      }
    })

    yield {
      state: "ready" as const,
      states: allWeather,
    }
  },
})

const tools = {
  getCurrentWeather: getCurrentWeatherTool,
  getForecast: getForecastTool,
  getAllStatesWeather: getAllStatesWeatherTool,
} as const

export type WeatherMessage = UIMessage<
  never,
  UIDataTypes,
  InferUITools<typeof tools>
>

// Also export state data for the dashboard
export { NIGERIAN_STATES, generateWeatherForState, generateForecastForState }

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<WeatherMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are a friendly and knowledgeable Nigerian weather assistant. You specialize in weather forecasts across all 36 Nigerian states and the FCT (Federal Capital Territory).

When users ask about weather, use the appropriate tools:
- getCurrentWeather: for current conditions in a specific state
- getForecast: for multi-day forecasts for a state
- getAllStatesWeather: when the user wants to see all states at once

Always use lowercase state names when calling tools (e.g., "lagos", "kano", "fct", "cross river", "akwa ibom").

Be conversational and include helpful Nigerian context like:
- Whether it's harmattan season in the north
- Rainy season updates for southern states  
- Advice for daily activities based on the weather
- References to local climate patterns

Format your responses clearly and be enthusiastic about helping users plan their day.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
