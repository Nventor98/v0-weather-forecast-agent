"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import {
  StateWeatherCard,
  DetailedWeatherCard,
  StateWeatherSkeleton,
  WeatherStats,
} from "./weather-card"
import { WeatherChat } from "./weather-chat"
import { Search, MapPin, MessageCircle, X, Filter } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ZONES = [
  "All",
  "North West",
  "North East",
  "North Central",
  "South West",
  "South East",
  "South South",
]

interface StateWeather {
  state: string
  capital: string
  zone: string
  temperature: number
  conditions: string
  humidity: number
  windSpeed: number
  high: number
  low: number
}

interface DetailedData extends StateWeather {
  forecast?: {
    day: string
    date: string
    high: number
    low: number
    conditions: string
    precipitation: number
  }[]
}

export function WeatherDashboard() {
  const [search, setSearch] = useState("")
  const [selectedZone, setSelectedZone] = useState("All")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [detailedData, setDetailedData] = useState<DetailedData | null>(null)
  const [showChat, setShowChat] = useState(false)

  const { data, isLoading } = useSWR<{ states: StateWeather[] }>(
    "/api/weather/states",
    fetcher,
    { revalidateOnFocus: false }
  )

  // Fetch detailed data when a state is selected
  useEffect(() => {
    if (!selectedState) {
      setDetailedData(null)
      return
    }

    fetch(`/api/weather/states?state=${encodeURIComponent(selectedState.toLowerCase())}`)
      .then((r) => r.json())
      .then((d) => setDetailedData(d))
  }, [selectedState])

  const filteredStates = useMemo(() => {
    if (!data?.states) return []
    return data.states.filter((s) => {
      const matchesSearch =
        !search ||
        s.state.toLowerCase().includes(search.toLowerCase()) ||
        s.capital.toLowerCase().includes(search.toLowerCase())
      const matchesZone = selectedZone === "All" || s.zone === selectedZone
      return matchesSearch && matchesZone
    })
  }, [data, search, selectedZone])

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Nigeria Weather
              </h1>
              <p className="text-xs text-muted-foreground">{today}</p>
            </div>
          </div>

          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Ask AI Agent</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Stats */}
        {data?.states && !isLoading && <WeatherStats states={data.states} />}

        {/* Search and Filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search state or capital..."
              className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
            {ZONES.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedZone === zone
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed state view */}
        {selectedState && detailedData && (
          <div className="mt-6">
            <DetailedWeatherCard
              data={detailedData}
              onClose={() => setSelectedState(null)}
            />
          </div>
        )}

        {/* State grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {selectedZone === "All" ? "All States" : selectedZone} ({filteredStates.length})
            </h2>
            {selectedState && (
              <button
                onClick={() => setSelectedState(null)}
                className="text-xs text-primary hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <StateWeatherSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredStates.map((state) => (
                <StateWeatherCard
                  key={state.state}
                  data={state}
                  onClick={() =>
                    setSelectedState(
                      selectedState === state.state ? null : state.state
                    )
                  }
                />
              ))}
            </div>
          )}

          {!isLoading && filteredStates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <MapPin className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No states found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat panel */}
      {showChat && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] border-l border-border bg-background shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Weather AI Agent
              </span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <WeatherChat />
          </div>
        </div>
      )}

      {/* Overlay for mobile chat */}
      {showChat && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm sm:hidden"
          onClick={() => setShowChat(false)}
        />
      )}
    </div>
  )
}
