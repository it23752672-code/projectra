import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/state/AuthContext'
import { performanceAPI, RankingRow } from '@/services/performance'
import ReactApexChart from 'react-apexcharts'

function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    fn().then((res) => { if (mounted) setData(res) }).catch((e) => { if (mounted) setError(e?.message || 'Failed to load') }).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { data, loading, error, setData }
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'gold' : score >= 80 ? 'silver' : score >= 70 ? 'peru' : score >= 60 ? 'steelblue' : 'crimson'
  return <span style={{ color, fontWeight: 700 }}>{score.toFixed(1)}</span>
}

export default function PerformanceAnalyticsPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<'last6months' | 'last12months'>('last6months')
  const [filters, setFilters] = useState({ department: 'All', company: 'All', project: 'All', role: 'All' })

  const metricsQ = useAsync(async () => user ? performanceAPI.getMetrics((user as any).id || (user as any)._id) : null, [user])
  const rankingsQ = useAsync(performanceAPI.getRankings, [])
  const trendsQ = useAsync(() => performanceAPI.getTrends(period), [period])
  const aiQ = useAsync(performanceAPI.getAIInsights, [])
  const benchQ = useAsync(performanceAPI.getBenchmarks, [])

  const overallTeamScore = useMemo(() => {
    const rows = rankingsQ.data?.ranking || []
    if (!rows.length) return 0
    const avg = rows.reduce((a, b) => a + b.performanceScore, 0) / rows.length
    return Number(avg.toFixed(1))
  }, [rankingsQ.data])

  const topPerformersCount = useMemo(() => (rankingsQ.data?.ranking || []).filter(r => r.performanceScore >= 80).length, [rankingsQ.data])

  const distribution = rankingsQ.data?.distribution

  function onExport(type: 'pdf' | 'excel') {
    performanceAPI.generateReport(type === 'pdf' ? 'Quarterly Performance Review' : 'Department Analytics Report').then(({ download }) => {
      // For demo: just open placeholder link
      window.open(download, '_blank')
    })
  }

  const rankingRows: RankingRow[] = (rankingsQ.data?.ranking || [])

  const lineOptions = {
    chart: { id: 'performance-trends', toolbar: { show: false } },
    xaxis: { categories: Array.from({ length: (trendsQ.data?.series.overall.length || 0) }).map((_, i) => `M-${i+1}`) },
    stroke: { curve: 'smooth' },
    legend: { position: 'top' },
  } as any
  const lineSeries = [
    { name: 'Overall Team Performance', data: trendsQ.data?.series.overall || [] },
    { name: 'Task Completion Rate', data: trendsQ.data?.series.completion || [] },
    { name: 'Quality Scores', data: trendsQ.data?.series.quality || [] },
    { name: 'Cross-Company Collaboration', data: trendsQ.data?.series.collaboration || [] },
  ]

  const donutOptions = {
    labels: ['Star', 'High', 'Solid', 'Developing', 'Needs Improvement'],
    legend: { position: 'bottom' },
  } as any
  const donutSeries = distribution ? [distribution.star, distribution.high, distribution.solid, distribution.developing, distribution.needsImprovement] : []

  const deptOptions = {
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Engineering', 'Design', 'QA', 'Ops', 'PM'] },
    plotOptions: { bar: { distributed: true } },
    colors: ['#00E396', '#FEB019', '#FF4560', '#775DD0', '#008FFB'],
  } as any
  const deptSeries = [{ name: 'Avg Score', data: [82, 76, 74, 68, 80] }]

  const radarOptions = {
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Task Completion', 'Quality', 'Timeliness', 'Collaboration', 'Innovation', 'Leadership'] },
  } as any
  const radarSeries = [{ name: 'Individual', data: [metricsQ.data?.currentMetrics?.overallScore || 70, (metricsQ.data?.detailedBreakdown?.qualityMetrics?.averageRating || 4) * 20,  metricsQ.data ? (metricsQ.data as any).detailedBreakdown?.taskMetrics?.overdue ? 70 : 80 : 75, 80, 60, 55] }, { name: 'Team Avg', data: [overallTeamScore, 80, 78, 75, 62, 58] }]

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="flex-row between center">
            <div>
              <h2>Performance Analytics <span className="small" style={{ fontWeight: 400 }}>(Current: {period === 'last6months' ? 'Last 6 months' : 'Last 12 months'})</span></h2>
              <div className="small">Dashboard &gt; Performance Analytics</div>
            </div>
            <div className="flex-row" style={{ gap: 8 }}>
              <select className="pj-input" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                <option value="last6months">This Quarter</option>
                <option value="last12months">This Year</option>
              </select>
              <button className="pj-btn" onClick={() => onExport('pdf')}>Export Report (PDF)</button>
              <button className="pj-btn secondary" onClick={() => onExport('excel')}>Export Data (Excel)</button>
              <button className="pj-btn secondary">Schedule Report</button>
            </div>
          </div>

          <div className="flex-row wrap" style={{ gap: 12, marginTop: 12 }}>
            <select className="pj-input" value={filters.department} onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}>
              <option>All</option><option>Engineering</option><option>Design</option><option>QA</option><option>Ops</option>
            </select>
            <select className="pj-input" value={filters.company} onChange={(e) => setFilters(f => ({ ...f, company: e.target.value }))}>
              <option>All</option><option>My Company</option><option>Vendor A</option><option>Vendor B</option>
            </select>
            <select className="pj-input" value={filters.project} onChange={(e) => setFilters(f => ({ ...f, project: e.target.value }))}>
              <option>All</option><option>Alpha</option><option>Beta</option><option>Gamma</option>
            </select>
            <select className="pj-input" value={filters.role} onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}>
              <option>All</option><option>Admin</option><option>ProjectManager</option><option>Contributor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="col-12">
        <div className="grid">
          {[{ label: 'Overall Team Performance', value: overallTeamScore, hint: 'Weighted average' }, { label: 'Top Performers (80+)', value: topPerformersCount, hint: 'Count' }, { label: 'AI Assistance Utilization', value: 62, hint: 'Experimental' }, { label: 'Avg Completion Rate', value: Math.round((rankingsQ.data?.ranking || []).reduce((a, b) => a + b.completionRate, 0) / Math.max((rankingsQ.data?.ranking || []).length || 1, 1)), hint: 'vs target 85%' }, { label: 'Cross-Company Collaboration', value: 3.4, hint: 'Network index' }, { label: 'Improvement Rate MoM', value: 4.2, hint: '% increase' }].map((c, i) => (
            <div className="col-12 col-md-6 col-xl-4" key={i}>
              <div className="card">
                <div className="small" style={{ opacity: .7 }}>{c.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{typeof c.value === 'number' ? <ScoreBadge score={Number(c.value)} /> : c.value}</div>
                <div className="small" style={{ opacity: .6, marginTop: 4 }}>{c.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="col-12 col-xl-8">
        <div className="card">
          <div className="flex-row between center"><h3>Performance Trends</h3></div>
          <div>{trendsQ.loading ? <div className="loader" /> : <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={300} />}</div>
        </div>
      </div>
      <div className="col-12 col-xl-4">
        <div className="card">
          <div className="flex-row between center"><h3>Performance Distribution</h3></div>
          <div>{rankingsQ.loading ? <div className="loader" /> : <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={300} />}</div>
        </div>
      </div>

      <div className="col-12 col-xl-6">
        <div className="card">
          <div className="flex-row between center"><h3>Department Comparison</h3></div>
          <div><ReactApexChart options={deptOptions} series={deptSeries} type="bar" height={300} /></div>
        </div>
      </div>
      <div className="col-12 col-xl-6">
        <div className="card">
          <div className="flex-row between center"><h3>Individual vs Team</h3></div>
          <div><ReactApexChart options={radarOptions} series={radarSeries} type="radar" height={300} /></div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="col-12">
        <div className="card">
          <div className="flex-row between center"><h3>Employee Rankings</h3></div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Employee</th>
                  <th>Score</th>
                  <th>Completion</th>
                  <th>Quality</th>
                  <th>Timeliness</th>
                  <th>Collaboration</th>
                  <th>Trend</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rankingRows.map(r => (
                  <tr key={r.userId}>
                    <td>#{r.rank}</td>
                    <td>{r.employeeName}</td>
                    <td><ScoreBadge score={r.performanceScore} /></td>
                    <td>{r.completionRate}%</td>
                    <td>{r.qualityRating.toFixed(2)}</td>
                    <td>{r.timeliness}%</td>
                    <td>{r.collaboration}</td>
                    <td>
                      <span className="small" style={{ opacity: .7 }}>{r.growthTrend.map((v, i) => (i ? ' → ' : '') + Math.round(v)).join('')}</span>
                    </td>
                    <td>
                      <button className="pj-btn tiny">View</button>
                      <button className="pj-btn tiny secondary" style={{ marginLeft: 6 }}>Feedback</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Insights and Goals */}
      <div className="col-12 col-xl-6">
        <div className="card">
          <h3>AI Insights</h3>
          {aiQ.loading ? <div className="loader" /> : aiQ.data && (
            <div className="grid">
              <div className="col-12">
                <div className="subtle">Performance Patterns</div>
                <ul className="list small">
                  <li>{aiQ.data.performancePatterns.identifyTrends}</li>
                  <li>{aiQ.data.performancePatterns.predictOutcomes}</li>
                  <li>{aiQ.data.performancePatterns.anomalyDetection}</li>
                </ul>
              </div>
              <div className="col-12">
                <div className="subtle">Recommendations</div>
                <ul className="list small">
                  <li>{aiQ.data.personalizationRecommendations.individualCoaching}</li>
                  <li>{aiQ.data.personalizationRecommendations.skillDevelopment}</li>
                  <li>{aiQ.data.personalizationRecommendations.careerPathing}</li>
                  <li>{aiQ.data.personalizationRecommendations.mentorshipMatching}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <GoalsPanel userId={(user as any)?.id || (user as any)?._id} />

    </div>
  )
}

function GoalsPanel({ userId }: { userId?: string }) {
  const [desc, setDesc] = useState('Improve on-time delivery to 95%')
  const [type, setType] = useState('Individual Performance Goals')
  const [target, setTarget] = useState(95)
  const [deadline, setDeadline] = useState('')
  const [goals, setGoals] = useState<any[]>([])

  async function addGoal() {
    if (!userId) return
    const goal = await performanceAPI.createGoal({ userId, goalType: type, description: desc, targetMetric: target, deadline })
    setGoals(g => [goal, ...g])
  }

  return (
    <div className="col-12 col-xl-6">
      <div className="card">
        <h3>Goals</h3>
        <div className="flex-row wrap" style={{ gap: 8 }}>
          <select className="pj-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Individual Performance Goals</option>
            <option>Team Collaboration Goals</option>
            <option>Cross-Company Project Goals</option>
            <option>Skill Development Goals</option>
            <option>Innovation and Process Improvement Goals</option>
          </select>
          <input className="pj-input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Goal description" />
          <input className="pj-input" type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} placeholder="Target" />
          <input className="pj-input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button className="pj-btn" onClick={addGoal} disabled={!userId}>Add Goal</button>
        </div>
        <ul className="list" style={{ marginTop: 12 }}>
          {goals.map(g => (
            <li key={g.id} className="small">
              <strong>{g.goalType}</strong>: {g.description} — Target {g.targetMetric}. Status: {g.status}
            </li>
          ))}
          {!goals.length && <li className="small subtle">No goals yet. Create one to start tracking progress.</li>}
        </ul>
      </div>
    </div>
  )
}
