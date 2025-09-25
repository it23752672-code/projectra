import React from 'react'

export default function SuggestionChips({ suggestions, onSelect }: { suggestions: string[], onSelect: (s: string) => void }) {
  if (!suggestions?.length) return null
  return (
    <div className="border-t bg-gray-50 px-4 py-3">
      <div className="text-sm font-medium text-blue-700 mb-2">Suggestions</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={`${s}-${i}`}
            onClick={() => onSelect(s)}
            className="text-sm bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-blue-50 hover:border-blue-200 transition-opacity"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
