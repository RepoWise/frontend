import { SUSTAINABILITY_COLOR_METADATA } from '../lib/sustainabilityTerms'

const LEGEND_ITEMS = [
  {
    color: 'green',
    label: 'Healthy / low-risk signals',
    description: 'Reinforces strong sustainability posture'
  },
  {
    color: 'yellow',
    label: 'Warning signs',
    description: 'Monitor and intervene before risks grow'
  },
  {
    color: 'red',
    label: 'Critical risks',
    description: 'Immediate action recommended'
  }
]

export function SustainabilityLegend() {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
        <span role="img" aria-hidden="true">🧭</span>
        Sustainability signal legend
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {LEGEND_ITEMS.map(({ color, label, description }) => {
          const metadata = SUSTAINABILITY_COLOR_METADATA[color]
          return (
            <div key={color} className="flex items-start gap-3">
              <span
                className={`mt-1 inline-flex h-3 w-3 rounded-full ${metadata?.className || ''}`}
                style={{ backgroundColor: 'currentColor' }}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
