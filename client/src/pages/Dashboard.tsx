import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import Loader from '../components/common/Loader'
import ErrorMessage from '../components/common/ErrorMessage'
import { getProjects, getHealth } from '../services/auth'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [projects, setProjects] = useState<any[]>([])
  const [health, setHealth] = useState<any>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setError(undefined)
        // Try projects first (auth required)
        const data = await getProjects()
        if (!active) return
        const arr = Array.isArray(data?.projects) ? data.projects : (Array.isArray(data) ? data : [])
        setProjects(arr)
      } catch (err: any) {
        // Fallback: health endpoint (public)
        try {
          const h = await getHealth()
          if (!active) return
          setHealth(h)
        } catch (e: any) {
          setError(e?.response?.data?.message || 'Failed to load data')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  return (
    <div>
      <Header />
      <div className="container" style={{ paddingTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        {loading && <Loader />}
        <ErrorMessage message={error} />

        {!loading && !error && projects?.length > 0 && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Projects</h3>
            <ul className="list">
              {projects.map((p: any) => (
                <li key={p.id || p._id || p.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div>{p.name || p.title || 'Untitled Project'}</div>
                      {p.status && <div className="small">Status: {p.status}</div>}
                    </div>
                    {typeof p.progress === 'number' && (
                      <div className="small">{p.progress}%</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && !error && projects?.length === 0 && health && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>API Health</h3>
            <pre className="small" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(health, null, 2)}</pre>
            <div className="small" style={{ marginTop: 8 }}>
              Authenticated projects list not available or empty. Health endpoint is shown instead.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
