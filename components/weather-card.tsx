"use client"

import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  Droplets,
  Sun,
  Wind,
  CloudSun,
  CloudFog,
  Thermometer,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react"

function getWeatherIcon(conditions: string, size: "sm" | "md" | "lg" = "md") {
  const c = conditions.toLowerCase()
  const sizeClass =
    size === "sm" ? "h-5 w-5" : size === "lg" ? "h-14 w-14" : "h-8 w-8"

  if (c.includes("sunny") || c.includes("clear"))
    return <Sun className={`${sizeClass} text-amber-400`} />
  if (c.includes("partly"))
    return <CloudSun className={`${sizeClass} text-amber-300`} />
  if (c.includes("thunder") || c.includes("storm"))
    return <CloudLightning className={`${sizeClass} text-amber-500`} />
  if (c.includes("rain") || c.includes("drizzle"))
    return <CloudDrizzle className={`${sizeClass} text-sky-400`} />
  if (c.includes("snow"))
    return <CloudSnow className={`${sizeClass} text-sky-200`} />
  if (c.includes("overcast") || c.includes("fog") || c.includes("haz"))
    return <CloudFog className={`${sizeClass} text-muted-foreground`} />
  if (c.includes("wind"))
    return <Wind className={`${sizeClass} text-muted-foreground`} />
  return <Cloud className={`${sizeClass} text-muted-foreground`} />
}

// Zone colors
function getZoneColor(zone: string) {
  switch (zone) {
    case "North West":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    case "North East":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20"
    case "North Central":
      return "bg-teal-500/10 text-teal-400 border-teal-500/20"
    case "South West":
      return "bg-sky-500/10 text-sky-400 border-sky-500/20"
    case "South East":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    case "South South":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// Compact state card for the grid
interface StateWeather {
  state: string
  capital: string
  zone: string
  cities: string[]
  temperature: number
  conditions: string
  humidity: number
  windSpeed: number
  high: number
  low: number
}

export function StateWeatherCard({
  data,
  onClick,
}: {
  data: StateWeather
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-card-foreground truncate">
            {data.state === "Fct" ? "FCT" : data.state}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{data.capital}</p>
        </div>
        {getWeatherIcon(data.conditions, "sm")}
      </div>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-2xl font-bold tracking-tight text-card-foreground">
          {data.temperature}°
        </span>
        <span className="text-xs text-muted-foreground mb-1">C</span>
      </div>

      <p className="mt-1 text-xs capitalize text-muted-foreground">
        {data.conditions}
      </p>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Droplets className="h-3 w-3" />
          {data.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <Wind className="h-3 w-3" />
          {data.windSpeed}km/h
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${getZoneColor(data.zone)}`}
        >
          {data.zone}
        </span>
        <span className="text-[10px] text-muted-foreground truncate">
          {data.cities.slice(0, 2).join(", ")}
          {data.cities.length > 2 && ` +${data.cities.length - 2}`}
        </span>
      </div>
    </button>
  )
}

// Detailed state card for expanded view
interface CityWeather {
  city: string
  temperature: number
  conditions: string
  humidity: number
  windSpeed: number
  high: number
  low: number
}

interface DetailedWeatherProps {
  state: string
  capital: string
  zone: string
  cities?: string[]
  temperature: number
  conditions: string
  humidity: number
  windSpeed: number
  high: number
  low: number
  forecast?: {
    day: string
    date: string
    high: number
    low: number
    conditions: string
    precipitation: number
  }[]
  cityWeather?: CityWeather[]
}

export function DetailedWeatherCard({
  data,
  onClose,
}: {
  data: DetailedWeatherProps
  onClose: () => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-card-foreground">
              {data.state === "Fct" ? "FCT" : data.state}
            </h2>
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${getZoneColor(data.zone)}`}
            >
              {data.zone}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Capital: {data.capital}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close details"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        {getWeatherIcon(data.conditions, "lg")}
        <div>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-bold tracking-tight text-card-foreground">
              {data.temperature}
            </span>
            <span className="text-xl text-muted-foreground mb-2">°C</span>
          </div>
          <p className="text-sm font-medium capitalize text-primary">
            {data.conditions}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 p-3">
          <ArrowUp className="h-4 w-4 text-destructive" />
          <span className="text-xs text-muted-foreground">High</span>
          <span className="text-sm font-semibold text-card-foreground">
            {data.high}°C
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 p-3">
          <ArrowDown className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Low</span>
          <span className="text-sm font-semibold text-card-foreground">
            {data.low}°C
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 p-3">
          <Droplets className="h-4 w-4 text-sky-400" />
          <span className="text-xs text-muted-foreground">Humidity</span>
          <span className="text-sm font-semibold text-card-foreground">
            {data.humidity}%
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 p-3">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Wind</span>
          <span className="text-sm font-semibold text-card-foreground">
            {data.windSpeed} km/h
          </span>
        </div>
      </div>

      {/* City Weather */}
      {data.cityWeather && data.cityWeather.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">
            Cities in {data.state === "Fct" ? "FCT" : data.state}
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.cityWeather.map((city, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  {getWeatherIcon(city.conditions, "sm")}
                  <div>
                    <span className="text-sm font-medium text-card-foreground">
                      {city.city}
                    </span>
                    <p className="text-xs capitalize text-muted-foreground">
                      {city.conditions}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-lg font-bold text-card-foreground">
                    {city.temperature}°
                  </span>
                  <div className="flex flex-col text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Droplets className="h-2.5 w-2.5" /> {city.humidity}%
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Wind className="h-2.5 w-2.5" /> {city.windSpeed}km/h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.forecast && data.forecast.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">
            5-Day Forecast
          </h3>
          <div className="flex flex-col gap-2">
            {data.forecast.map((day, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-2.5"
              >
                <div className="flex items-center gap-3 w-24">
                  <span className="text-sm font-medium text-card-foreground w-8">
                    {day.day}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {day.date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getWeatherIcon(day.conditions, "sm")}
                  <span className="w-24 text-xs text-muted-foreground capitalize hidden sm:inline">
                    {day.conditions}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-3 w-3 text-sky-400" />
                  <span className="w-8 text-xs text-muted-foreground">
                    {day.precipitation}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-card-foreground">
                    {day.high}°
                  </span>
                  <span className="text-muted-foreground">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton loading card
export function StateWeatherSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="mt-1.5 h-3 w-14 rounded bg-muted" />
        </div>
        <div className="h-5 w-5 rounded bg-muted" />
      </div>
      <div className="mt-3 h-7 w-14 rounded bg-muted" />
      <div className="mt-2 h-3 w-16 rounded bg-muted" />
      <div className="mt-3 flex gap-3">
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
      <div className="mt-2 h-4 w-16 rounded bg-muted" />
    </div>
  )
}

// Summary stats
interface WeatherStatsProps {
  states: StateWeather[]
}

export function WeatherStats({ states }: WeatherStatsProps) {
  const hottest = states.reduce((max, s) => (s.temperature > max.temperature ? s : max), states[0])
  const coolest = states.reduce((min, s) => (s.temperature < min.temperature ? s : min), states[0])
  const avgTemp = Math.round(states.reduce((sum, s) => sum + s.temperature, 0) / states.length)
  const rainyCount = states.filter((s) =>
    ["rainy", "thunderstorm", "drizzle"].some((r) => s.conditions.toLowerCase().includes(r))
  ).length

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Average Temp</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-card-foreground">{avgTemp}°C</p>
        <p className="text-xs text-muted-foreground">Across all states</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <ArrowUp className="h-4 w-4 text-destructive" />
          <span className="text-xs font-medium text-muted-foreground">Hottest</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-card-foreground">{hottest.temperature}°C</p>
        <p className="text-xs text-muted-foreground">
          {hottest.state === "Fct" ? "FCT" : hottest.state}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <ArrowDown className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Coolest</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-card-foreground">{coolest.temperature}°C</p>
        <p className="text-xs text-muted-foreground">
          {coolest.state === "Fct" ? "FCT" : coolest.state}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <CloudDrizzle className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-medium text-muted-foreground">Rainy States</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-card-foreground">{rainyCount}</p>
        <p className="text-xs text-muted-foreground">of {states.length} states</p>
      </div>
    </div>
  )
}
