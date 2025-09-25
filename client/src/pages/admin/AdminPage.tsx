import React, { useEffect, useState } from 'react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { api, getErrorMessage } from '@/services/api'

function PlansTab() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [priceMonthly, setPriceMonthly] = useState<number>(0)

  const load = async () => {
    setLoading(true)
    const { data } = await api.get('/admin/plans')
    setPlans(data.plans || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/plans', { name, priceMonthly })
      setName('')
      setPriceMonthly(0)
      await load()
    } catch (err) { alert(getErrorMessage(err)) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this plan?')) return
    await api.delete(`/admin/plans/${id}`)
    await load()
  }

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h3>Create Plan</h3>
          <form onSubmit={createPlan}>
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Monthly Price" type="number" value={priceMonthly} onChange={(e) => setPriceMonthly(Number(e.target.value))} required />
            <Button type="submit">Create</Button>
          </form>
        </div>
      </div>
      <div className="col-12">
        <div className="card">
          <h3>Plans</h3>
          {loading ? 'Loading...' : (
            <ul className="list">
              {plans.map(p => (
                <li key={p._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="small">${p.priceMonthly}/mo</div>
                  </div>
                  <Button variant="secondary" onClick={() => remove(p._id)}>Delete</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function VendorsTab() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await api.get('/admin/vendors')
    setVendors(data.vendors || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/vendors', { name, domain })
      setName('')
      setDomain('')
      await load()
    } catch (err) { alert(getErrorMessage(err)) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this vendor?')) return
    await api.delete(`/admin/vendors/${id}`)
    await load()
  }

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h3>Create Vendor</h3>
          <form onSubmit={createVendor}>
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <Button type="submit">Create</Button>
          </form>
        </div>
      </div>
      <div className="col-12">
        <div className="card">
          <h3>Vendors</h3>
          {loading ? 'Loading...' : (
            <ul className="list">
              {vendors.map(v => (
                <li key={v._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                    <div className="small">{v.domain || '—'}</div>
                  </div>
                  <Button variant="secondary" onClick={() => remove(v._id)}>Delete</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const res = await api.get('/admin/analytics/overview')
      setData(res.data)
      setLoading(false)
    })()
  }, [])

  return (
    <div className="card">
      <h3>Analytics Overview</h3>
      {loading ? 'Loading...' : (
        <pre className="small" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState<'plans' | 'vendors' | 'analytics'>('plans')
  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h2>Admin</h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button variant={tab === 'plans' ? 'primary' : 'secondary'} onClick={() => setTab('plans')}>Plans</Button>
            <Button variant={tab === 'vendors' ? 'primary' : 'secondary'} onClick={() => setTab('vendors')}>Vendors</Button>
            <Button variant={tab === 'analytics' ? 'primary' : 'secondary'} onClick={() => setTab('analytics')}>Analytics</Button>
          </div>
        </div>
      </div>
      <div className="col-12">
        {tab === 'plans' && <PlansTab />}
        {tab === 'vendors' && <VendorsTab />}
        {tab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  )
}
