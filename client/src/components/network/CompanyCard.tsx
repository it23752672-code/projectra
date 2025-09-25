import React from 'react'
import { PartnerCompany } from '@/services/networkService'

export default function CompanyCard({ company, onRequest, onView }: { company: PartnerCompany, onRequest: (c: PartnerCompany) => void, onView: (c: PartnerCompany) => void }) {
  const availabilityRatio = company.totalEmployees > 0 ? (company.availableEmployees / company.totalEmployees) : 0
  const availColor = availabilityRatio > 0.5 ? '#22c55e' : availabilityRatio > 0.2 ? '#f59e0b' : '#ef4444'

  return (
    <div className="card pj-company-card">
      <div className="pj-company-top">
        <div className="pj-company-avatar" aria-hidden="true">
          {company.logoUrl ? <img src={company.logoUrl} alt="logo" /> : <div className="pj-avatar-fallback">{company.companyName?.slice(0,2).toUpperCase()}</div>}
        </div>
        <div className="pj-company-headings">
          <div className="pj-company-name">{company.companyName}</div>
          <div className="pj-company-sub">{company.industryType || '—'} • <span className="pj-badge hollow">{company.collaborationStatus}</span></div>
        </div>
        <div className="pj-company-trust" title="Trust score">
          ⭐ {company.trustScore ?? 4}
        </div>
      </div>

      <div className="pj-company-stats">
        <div className="pj-company-availability">
          <span className="pj-dot" style={{ background: availColor }} />
          <span>{company.availableEmployees} Available</span>
          <span className="sep">/</span>
          <span>{company.totalEmployees} Total</span>
        </div>
        {company.specializations && company.specializations.length > 0 && (
          <div className="pj-tags">
            {company.specializations.slice(0,3).map((s, i) => (
              <span key={i} className="pj-tag">{s}</span>
            ))}
            {company.specializations.length > 3 && <span className="pj-tag">+{company.specializations.length - 3}</span>}
          </div>
        )}
      </div>

      <div className="pj-company-actions">
        <button className="btn" onClick={() => onView(company)}>View Details</button>
        <button className="btn btn-primary" onClick={() => onRequest(company)}>Request Collaboration</button>
      </div>
    </div>
  )
}
