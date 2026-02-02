'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Message, ItineraryData, ItineraryProposal, FlightSearchResult, FlightOption } from '@/types/chat';
import { ChevronDown, ChevronUp, Plane, MapPin, Clock, DollarSign, Calendar, Users, AlertTriangle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

function ItineraryCard({ itinerary }: { itinerary: ItineraryData }) {
  const [expandedProposal, setExpandedProposal] = useState<string | null>(
    itinerary.proposals[0]?.id || null
  );

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="h-4 w-4" />
        <span>{itinerary.destination}</span>
        <span className="text-muted-foreground">•</span>
        <Calendar className="h-4 w-4" />
        <span>{itinerary.start_date} to {itinerary.end_date}</span>
        {itinerary.num_travelers && (
          <>
            <span className="text-muted-foreground">•</span>
            <Users className="h-4 w-4" />
            <span>{itinerary.num_travelers} travelers</span>
          </>
        )}
      </div>

      <div className="space-y-2">
        {itinerary.proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            isExpanded={expandedProposal === proposal.id}
            onToggle={() => setExpandedProposal(
              expandedProposal === proposal.id ? null : proposal.id
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ProposalCard({ proposal, isExpanded, onToggle }: {
  proposal: ItineraryProposal;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all",
      isExpanded ? "border-primary/50 bg-background" : "border-border bg-background/50"
    )}>
      <button
        onClick={onToggle}
        className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{proposal.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-1">{proposal.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-600">{proposal.total_budget_estimate}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Highlights */}
          {proposal.highlights.length > 0 && (
            <div>
              <h5 className="text-xs font-medium uppercase text-muted-foreground mb-1">Highlights</h5>
              <ul className="text-sm space-y-1">
                {proposal.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Days */}
          <div>
            <h5 className="text-xs font-medium uppercase text-muted-foreground mb-2">Day by Day</h5>
            <div className="space-y-2">
              {proposal.days.map((day) => (
                <div key={day.day_number} className="text-sm border-l-2 border-primary/30 pl-3">
                  <div className="font-medium">Day {day.day_number}: {day.title}</div>
                  <div className="text-xs text-muted-foreground">{day.date} • {day.location}</div>
                  <ul className="mt-1 space-y-0.5">
                    {day.activities.slice(0, 3).map((activity, i) => (
                      <li key={i} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{activity.time}</span> - {activity.name}
                      </li>
                    ))}
                    {day.activities.length > 3 && (
                      <li className="text-muted-foreground italic">
                        +{day.activities.length - 3} more activities
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Caveats */}
          {proposal.caveats.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-2">
              <h5 className="text-xs font-medium uppercase text-yellow-700 dark:text-yellow-500 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Consider
              </h5>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-0.5">
                {proposal.caveats.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FlightsCard({ flights }: { flights: FlightSearchResult }) {
  const [showAll, setShowAll] = useState(false);
  const displayOptions = showAll ? flights.options : flights.options.slice(0, 3);

  if (flights.options.length === 0) {
    return (
      <div className="mt-4 p-3 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plane className="h-4 w-4" />
          <span>No flights found for this route</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Plane className="h-4 w-4" />
          <span>Flights: {flights.origin} → {flights.destination}</span>
        </div>
        {flights.price_range && (
          <span className="text-sm text-green-600 font-medium">{flights.price_range}</span>
        )}
      </div>

      <div className="space-y-2">
        {displayOptions.map((option) => (
          <FlightOptionCard key={option.id} option={option} />
        ))}
      </div>

      {flights.options.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-primary hover:underline"
        >
          {showAll ? 'Show less' : `Show ${flights.options.length - 3} more options`}
        </button>
      )}
    </div>
  );
}

function FlightOptionCard({ option }: { option: FlightOption }) {
  return (
    <div className="border rounded-lg p-3 bg-background/50 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">${option.total_price.toFixed(0)} total</div>
        <div className="text-muted-foreground">${option.price_per_person.toFixed(0)}/person</div>
      </div>
      {option.segments.map((segment, i) => (
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          {segment.flights.map((leg, j) => (
            <span key={j} className="flex items-center gap-1">
              {j > 0 && <span>→</span>}
              <span>{leg.departure_airport}</span>
              <span className="text-xs">({leg.airline} {leg.flight_number})</span>
            </span>
          ))}
          <span>→ {segment.flights[segment.flights.length - 1]?.arrival_airport}</span>
        </div>
      ))}
      {option.is_virtual_interlining && (
        <div className="mt-1 text-xs text-yellow-600">
          ⚠ Self-transfer required
        </div>
      )}
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[90%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div>
            {message.content && (
              <div className="markdown-content">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,
                    p: ({ children }) => <p className="my-2">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-background/50 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-background/50 p-3 rounded-md overflow-x-auto my-2 text-sm">{children}</pre>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary/30 pl-4 my-2 italic">{children}</blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Render itinerary if present */}
            {message.itinerary && (
              <ItineraryCard itinerary={message.itinerary} />
            )}

            {/* Render flights if present */}
            {message.flights && (
              <FlightsCard flights={message.flights} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
