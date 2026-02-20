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
} from "lucide-react"

function getWeatherIcon(conditions: string) {
  const c = conditions.toLowerCase()
  if (c.includes("sunny") || c.includes("clear"))
    return <Sun className="h-12 w-12 text-amber-400" />
  if (c.includes("partly"))
    return <CloudSun className="h-12 w-12 text-amber-300" />
  if (c.includes("rain") || c.includes("drizzle"))
    return <CloudDrizzle className="h-12 w-12 text-sky-400" />
  if (c.includes("storm") || c.includes("thunder"))
    return <CloudLightning className="h-12 w-12 text-amber-500" />
  if (c.includes("snow"))
    return <CloudSnow className="h-12 w-12 text-sky-200" />
  if (c.includes("overcast") || c.includes("fog"))
    return <CloudFog className="h-12 w-12 text-muted-foreground" />
  return <Cloud className="h-12 w-12 text-muted-foreground" />
}

function getWeatherIconSmall(conditions: string) {
  const c = conditions.toLowerCase()
  if (c.includes("sunny") || c.includes("clear"))
    return <Sun className="h-6 w-6 text-amber-400" />
  if (c.includes("partly"))
    return <CloudSun className="h-6 w-6 text-amber-300" />
  if (c.includes("rain") || c.includes("drizzle"))
    return <CloudDrizzle className="h-6 w-6 text-sky-400" />
  if (c.includes("storm") || c.includes("thunder"))
    return <CloudLightning className="h-6 w-6 text-amber-500" />
  if (c.includes("snow"))
    return <CloudSnow className="h-6 w-6 text-sky-200" />
  if (c.includes("overcast") || c.includes("fog"))
    return <CloudFog className="h-6 w-6 text-muted-foreground" />
  return <Cloud className="h-6 w-6 text-muted-foreground" />
}

interface CurrentWeatherProps {
  city: string
  temperature: number
  conditions: string
  humidity: number
  windSpeed: number
  high: number
  low: number
}

export function CurrentWeatherCard({
  city,
  temperature,
  conditions,
  humidity,
  windSpeed,
  high,
  low,
}: CurrentWeatherProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 w-full max-w-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Current Weather
          </p>
          <h3 className="text-lg font-semibold text-card-foreground mt-0.5">
            {city}
          </h3>
        </div>
        {getWeatherIcon(conditions)}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight text-card-foreground">
          {temperature}
        </span>
        <span className="text-2xl text-muted-foreground mb-1">{"°F"}</span>
      </div>

      <p className="mt-1 text-sm font-medium capitalize text-primary">
        {conditions}
      </p>

      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <ArrowUp className="h-3.5 w-3.5 text-destructive" />
          <span>{high}°</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowDown className="h-3.5 w-3.5 text-primary" />
          <span>{low}°</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
        <div className="flex flex-col items-center gap-1">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Feels Like</span>
          <span className="text-sm font-medium text-card-foreground">
            {temperature - 2}°
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Droplets className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Humidity</span>
          <span className="text-sm font-medium text-card-foreground">
            {humidity}%
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Wind</span>
          <span className="text-sm font-medium text-card-foreground">
            {windSpeed} mph
          </span>
        </div>
      </div>
    </div>
  )
}

interface ForecastDay {
  day: string
  high: number
  low: number
  conditions: string
  precipitation: number
}

interface ForecastCardProps {
  city: string
  forecast: ForecastDay[]
}

export function ForecastCard({ city, forecast }: ForecastCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 w-full max-w-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {forecast.length}-Day Forecast
          </p>
          <h3 className="text-lg font-semibold text-card-foreground mt-0.5">
            {city}
          </h3>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5"
          >
            <span className="w-10 text-sm font-medium text-card-foreground">
              {day.day}
            </span>
            <div className="flex items-center gap-2">
              {getWeatherIconSmall(day.conditions)}
              <span className="w-20 text-xs text-muted-foreground capitalize">
                {day.conditions}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-3 w-3 text-primary" />
              <span className="w-8 text-xs text-muted-foreground">
                {day.precipitation}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-card-foreground">
                {day.high}°
              </span>
              <span className="text-muted-foreground">{day.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WeatherLoadingCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 w-full max-w-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-2 h-5 w-32 rounded bg-muted" />
        </div>
        <div className="h-12 w-12 rounded-full bg-muted" />
      </div>
      <div className="mt-4 h-12 w-24 rounded bg-muted" />
      <div className="mt-2 h-4 w-20 rounded bg-muted" />
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-3 w-12 rounded bg-muted" />
            <div className="h-4 w-8 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
