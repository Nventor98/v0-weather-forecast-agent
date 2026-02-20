"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { WeatherMessage } from "@/app/api/weather/route"
import {
  CurrentWeatherCard,
  ForecastCard,
  WeatherLoadingCard,
} from "./weather-card"
import {
  Send,
  CloudSun,
  Loader2,
} from "lucide-react"

const SUGGESTIONS = [
  "What's the weather in New York?",
  "Give me a 5-day forecast for Tokyo",
  "Is it sunny in Los Angeles?",
  "Compare weather in London and Paris",
]

export function WeatherChat() {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat<WeatherMessage>({
    transport: new DefaultChatTransport({ api: "/api/weather" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleSuggestion = (suggestion: string) => {
    if (isLoading) return
    sendMessage({ text: suggestion })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                <CloudSun className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground text-balance text-center">
                Weather Forecast Agent
              </h2>
              <p className="mt-2 text-muted-foreground text-center max-w-md text-pretty">
                Ask me about current weather conditions or forecasts for any
                city around the world.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 w-full max-w-lg">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestion(suggestion)}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:bg-secondary/80"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-3">
                  {message.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
                        {message.parts.map((part, index) => {
                          if (part.type === "text") {
                            return (
                              <p key={index} className="text-sm leading-relaxed">
                                {part.text}
                              </p>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {message.parts.map((part, index) => {
                        switch (part.type) {
                          case "text":
                            return part.text ? (
                              <div
                                key={index}
                                className="max-w-[85%] rounded-2xl rounded-bl-md bg-card border border-border px-4 py-2.5"
                              >
                                <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap">
                                  {part.text}
                                </p>
                              </div>
                            ) : null

                          case "tool-getCurrentWeather": {
                            if (part.state === "input-available" || part.state === "input-streaming") {
                              return (
                                <WeatherLoadingCard key={index} />
                              )
                            }
                            if (
                              part.state === "output-available" &&
                              part.output.state === "ready"
                            ) {
                              return (
                                <CurrentWeatherCard
                                  key={index}
                                  city={part.output.city}
                                  temperature={part.output.temperature}
                                  conditions={part.output.conditions}
                                  humidity={part.output.humidity}
                                  windSpeed={part.output.windSpeed}
                                  high={part.output.high}
                                  low={part.output.low}
                                />
                              )
                            }
                            if (
                              part.state === "output-available" &&
                              part.output.state === "loading"
                            ) {
                              return (
                                <WeatherLoadingCard key={index} />
                              )
                            }
                            return null
                          }

                          case "tool-getForecast": {
                            if (part.state === "input-available" || part.state === "input-streaming") {
                              return (
                                <WeatherLoadingCard key={index} />
                              )
                            }
                            if (
                              part.state === "output-available" &&
                              part.output.state === "ready"
                            ) {
                              return (
                                <ForecastCard
                                  key={index}
                                  city={part.output.city}
                                  forecast={part.output.forecast}
                                />
                              )
                            }
                            if (
                              part.state === "output-available" &&
                              part.output.state === "loading"
                            ) {
                              return (
                                <WeatherLoadingCard key={index} />
                              )
                            }
                            return null
                          }

                          default:
                            return null
                        }
                      })}
                    </div>
                  )}
                </div>
              ))}

              {isLoading &&
                !messages.some(
                  (m) =>
                    m.role === "assistant" &&
                    m.parts.some(
                      (p) =>
                        p.type === "text" ||
                        (p.type === "tool-getCurrentWeather" &&
                          p.state !== "output-available") ||
                        (p.type === "tool-getForecast" &&
                          p.state !== "output-available")
                    )
                ) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the weather..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
