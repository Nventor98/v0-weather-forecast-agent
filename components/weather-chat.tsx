"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { WeatherMessage } from "@/app/api/weather/route"
import { Send, CloudSun, Loader2 } from "lucide-react"

const SUGGESTIONS = [
  "Weather in Lagos",
  "Is it raining in Rivers?",
  "Forecast for Kano",
  "Hottest state today?",
]

export function WeatherChat() {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CloudSun className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground text-center text-pretty">
              Ask me about weather in any Nigerian state.
            </p>
            <div className="mt-4 flex flex-col gap-2 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs text-card-foreground transition-colors hover:bg-secondary/80"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col gap-2">
                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
                      {message.parts.map((part, i) =>
                        part.type === "text" ? (
                          <p key={i} className="text-xs leading-relaxed">
                            {part.text}
                          </p>
                        ) : null
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {message.parts.map((part, i) => {
                      if (part.type === "text" && part.text) {
                        return (
                          <div
                            key={i}
                            className="max-w-[90%] rounded-xl rounded-bl-sm bg-card border border-border px-3 py-2"
                          >
                            <p className="text-xs leading-relaxed text-card-foreground whitespace-pre-wrap">
                              {part.text}
                            </p>
                          </div>
                        )
                      }

                      if (
                        part.type === "tool-getCurrentWeather" ||
                        part.type === "tool-getForecast" ||
                        part.type === "tool-getAllStatesWeather"
                      ) {
                        if (
                          part.state === "input-available" ||
                          part.state === "input-streaming"
                        ) {
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-muted-foreground px-1"
                            >
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-xs">Fetching weather data...</span>
                            </div>
                          )
                        }
                        if (
                          part.state === "output-available" &&
                          part.output.state === "loading"
                        ) {
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-muted-foreground px-1"
                            >
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-xs">Loading...</span>
                            </div>
                          )
                        }
                        // Don't render the tool output directly; the AI will summarize it
                        return null
                      }

                      return null
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-muted-foreground px-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Nigerian weather..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
