import { NIGERIAN_STATES, generateWeatherForState, generateForecastForState } from "../route"
import { NextRequest } from "next/server"

function generateCityWeather(stateName: string, cityName: string, baseLat: number) {
  // Slightly offset city weather from state capital
  const citySeed = cityName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const latOffset = ((citySeed % 10) - 5) * 0.1
  const weather = generateWeatherForState(stateName + cityName, baseLat + latOffset)
  return {
    city: cityName,
    ...weather,
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const state = searchParams.get("state")

  if (state) {
    const key = state.toLowerCase().trim()
    const stateData = NIGERIAN_STATES[key]
    if (!stateData) {
      return Response.json({ error: "State not found" }, { status: 404 })
    }

    const weather = generateWeatherForState(key, stateData.lat)
    const forecast = generateForecastForState(key, stateData.lat, 5)
    const cityWeather = stateData.cities.map(city =>
      generateCityWeather(key, city, stateData.lat)
    )

    return Response.json({
      state: key.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      capital: stateData.capital,
      zone: stateData.zone,
      cities: stateData.cities,
      ...weather,
      forecast,
      cityWeather,
    })
  }

  // Return all states weather
  const allWeather = Object.entries(NIGERIAN_STATES).map(([key, data]) => {
    const weather = generateWeatherForState(key, data.lat)
    return {
      state: key.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      capital: data.capital,
      zone: data.zone,
      cities: data.cities,
      ...weather,
    }
  })

  return Response.json({ states: allWeather })
}
