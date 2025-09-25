import React, { useEffect, useMemo, useState } from 'react'
import StatsCards from '@/components/network/StatsCards'
import CompanyCard from '@/components/network/CompanyCard'
import PartnerCompanyModal from '@/components/network/PartnerCompanyModal'
import CollaborationRequestModal from '@/components/network/CollaborationRequestModal'
import { networkService, PartnerCompany } from '@/services/networkService'
import { collaborationService } from '@/services/collaborationService'
import { api, getErrorMessage } from '@/services/api'
import Button from '@/components/common/Button'

export default function CompaniesNetworkPage() {
  const [companies, setCompanies] = useState<PartnerCompany[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [target, setTarget] = useState<PartnerCompany | null>(null)
  const [projects, setProjects] = useState<{ _id: string, name: string }[]>([])

  useEffect(() => {
    loadAll()
    // projects (for request modal)
    api.get('/projects').then(({ data }) => setProjects(data.projects || [])).catch(() => {})
  }, [])

  async function loadAll() {
    setLoading(true); setError(null)
    try {
      const [companies, analytics] = await Promise.all([
        networkService.listCompanies(),
        api.get('/network/analytics').then(r => r.data)
      ])
      setCompanies(companies)
      setAnalytics(analytics)
    } catch (e: any) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return companies
    return companies.filter(c => c.companyName.toLowerCase().includes(f) || (c.industryType || '').toLowerCase().includes(f) || (c.specializations||[]).some(s => s.toLowerCase().includes(f)))
  }, [companies, filter])

  return (
    <div className="pj-network-page">
      <div className="pj-page-header">
        <div>
          <div className="pj-breadcrumbs">Dashboard ▸ Companies Network</div>
          <h2>Companies Network</h2>
        </div>
        <div className="pj-actions">
          <Button onClick={() => setShowAdd(true)}>Add Partner Company</Button>
          <Button variant="secondary" onClick={() => setTarget(companies[0] || null)}>Send Collaboration Request</Button>
          <Button variant="secondary" onClick={() => window.alert('Pending requests coming soon')}>View Pending Requests {analytics?.pendingRequests ? `(${analytics.pendingRequests})` : ''}</Button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <StatsCards stats={analytics} />
      </div>

      <div className="card" style={{ marginBottom: 12, padding: 12 }}>
        <input className="input" placeholder="Search companies, industries or skills..." value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="loader" /> Loading companies…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="pj-grid-3">
          {filtered.map(c => (
            <CompanyCard key={c._id} company={c} onRequest={setTarget} onView={() => { /* expand later */ }} />
          ))}
          {filtered.length === 0 && <div>No partner companies found.</div>}
        </div>
      )}

      <PartnerCompanyModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={async (input) => {
        await networkService.addCompany({
          name: input.name,
          domain: input.domain,
          specializations: input.specializations,
          industryType: input.industryType,
        })
        await loadAll()
      }} />

      <CollaborationRequestModal open={!!target} target={target} projects={projects} onClose={() => setTarget(null)} onSubmit={async (input) => {
        await collaborationService.create({
          targetCompanyId: input.targetCompanyId,
          projectId: input.projectId,
          skillsRequired: input.requestedSkills,
          priority: input.priority,
          message: input.description,
          proposedDuration: input.duration,
          proposedBudget: input.proposedBudget,
          deadline: input.deadline,
        })
        await loadAll()
      }} />
    </div>
  )
}
