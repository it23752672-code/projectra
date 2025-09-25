import React, { useEffect, useState } from 'react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { api, getErrorMessage } from '@/services/api'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/projects')
      setProjects(data.projects || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/projects', { name, description })
      setName('')
      setDescription('')
      await fetchProjects()
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h2>Projects</h2>
          {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="loader" /> Loading...</div>}
          {error && <div className="error">{error}</div>}
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <h3>Create Project</h3>
          <form onSubmit={createProject}>
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button type="submit">Create</Button>
          </form>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <h3>All Projects</h3>
          <ul className="list">
            {projects.map(p => (
              <li key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div className="small">{p.description}</div>
                </div>
                {'progress' in p && <div className="small">Progress: {p.progress}%</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
