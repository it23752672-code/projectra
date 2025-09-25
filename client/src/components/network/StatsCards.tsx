import React from 'react'

export default function StatsCards({ stats }: { stats: { totalPartners?: number, activeCollaborations?: number, availableResources?: number, pendingRequests?: number } }) {
  const items = [
    { label: 'Total Partner Companies', value: stats.totalPartners ?? 0 },
    { label: 'Active Collaborations', value: stats.activeCollaborations ?? 0 },
    { label: 'Available Resources', value: stats.availableResources ?? 0 },
    { label: 'Pending Requests', value: stats.pendingRequests ?? 0 },
  ]
  return (
    <div className="pj-grid-4">
      {items.map((it, idx) => (
        <div key={idx} className="card pj-stat">
          <div className="pj-stat-value">{it.value}</div>
          <div className="pj-stat-label">{it.label}</div>
        </div>
      ))}
    </div>
  )
}
