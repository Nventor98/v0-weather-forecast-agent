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
import * as z from "zod"

export const maxDuration = 30

const getCurrentWeatherTool = tool({
  description: "Get the current weather for a specific city including temperature, conditions, humidity, and wind speed",
  inputSchema: z.object({
    city: z.string().describe("The city name to get weather for"),
  }),
  async *execute({ city }: { city: string }) {
    yield { state: "loading" as const }
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const weatherData: Record<string, { temp: number; conditions: string; humidity: number; wind: number; high: number; low: number }> = {
      "new york": { temp: 42, conditions: "cloudy", humidity: 65, wind: 12, high: 47, low: 35 },
      "los angeles": { temp: 72, conditions: "sunny", humidity: 30, wind: 5, high: 78, low: 62 },
      "london": { temp: 48, conditions: "rainy", humidity: 85, wind: 18, high: 52, low: 41 },
      "tokyo": { temp: 55, conditions: "partly cloudy", humidity: 55, wind: 8, high: 60, low: 48 },
      "paris": { temp: 50, conditions: "overcast", humidity: 70, wind: 10, high: 55, low: 43 },
      "sydney": { temp: 78, conditions: "sunny", humidity: 40, wind: 15, high: 82, low: 68 },
      "dubai": { temp: 88, conditions: "sunny", humidity: 25, wind: 7, high: 95, low: 75 },
      "mumbai": { temp: 82, conditions: "partly cloudy", humidity: 72, wind: 6, high: 88, low: 76 },
      "berlin": { temp: 38, conditions: "snowy", humidity: 78, wind: 14, high: 40, low: 30 },
      "toronto": { temp: 28, conditions: "snowy", humidity: 70, wind: 20, high: 32, low: 22 },
    }

    const key = city.toLowerCase()
    const data = weatherData[key] ?? {
      temp: Math.floor(Math.random() * 60) + 20,
      conditions: ["sunny", "cloudy", "rainy", "partly cloudy", "overcast", "snowy"][Math.floor(Math.random() * 6)],
      humidity: Math.floor(Math.random() * 60) + 30,
      wind: Math.floor(Math.random() * 25) + 3,
      high: 0,
      low: 0,
    }

    if (!weatherData[key]) {
      data.high = data.temp + Math.floor(Math.random() * 8) + 2
      data.low = data.temp - Math.floor(Math.random() * 8) - 2
    }

    yield {
      state: "ready" as const,
      city,
      temperature: data.temp,
      conditions: data.conditions,
      humidity: data.humidity,
      windSpeed: data.wind,
      high: data.high,
      low: data.low,
    }
  },
})

const getForecastTool = tool({
  description: "Get a multi-day weather forecast for a city",
  inputSchema: z.object({
    city: z.string().describe("The city name"),
    days: z.number().min(1).max(7).describe("Number of forecast days (1-7)"),
  }),
  async *execute({ city, days }: { city: string; days: number }) {
    yield { state: "loading" as const }
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const conditions = ["sunny", "cloudy", "rainy", "partly cloudy", "overcast", "snowy", "stormy", "windy"]
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const today = new Date().getDay()

    const forecast = Array.from({ length: days }, (_, i) => {
      const dayIndex = (today + i + 1) % 7
      const baseTemp = Math.floor(Math.random() * 40) + 35
      return {
        day: dayNames[dayIndex],
        high: baseTemp + Math.floor(Math.random() * 10) + 5,
        low: baseTemp - Math.floor(Math.random() * 10),
        conditions: conditions[Math.floor(Math.random() * conditions.length)],
        precipitation: Math.floor(Math.random() * 100),
      }
    })

    yield {
      state: "ready" as const,
      city,
      forecast,
    }
  },
})

const tools = {
  getCurrentWeather: getCurrentWeatherTool,
  getForecast: getForecastTool,
} as const

export type WeatherMessage = UIMessage<
  never,
  UIDataTypes,
  InferUITools<typeof tools>
>

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<WeatherMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are a friendly and knowledgeable weather assistant. When users ask about the weather in any city, use the getCurrentWeather tool to fetch current conditions, and the getForecast tool for multi-day forecasts. 
    
    Always be helpful, provide useful weather insights, and suggest appropriate clothing or activities based on the weather. If the user asks about weather without specifying a city, ask them which city they'd like to check. 
    
    When presenting weather information, be conversational and informative. Include tips like "Great day for a walk!" or "Don't forget your umbrella!" based on the conditions.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
