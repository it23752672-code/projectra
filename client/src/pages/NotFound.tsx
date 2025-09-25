import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Page not found</h2>
        <p className="small">The page you are looking for doesn’t exist.</p>
        <div style={{ marginTop: 12 }}>
          <Link to="/dashboard" className="button">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
