import { useState, useId } from 'react'
import { KeyInsights } from './slideExtras'
import type { Insight } from './slideExtras'

// ─── DATA (weekly cumulative counts, week 0 = 02 Feb 2026, 7-day steps) ───────
const START = new Date(2026, 1, 2)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekDate = (i: number) => new Date(START.getTime() + i * 7 * 86400000)
const fmtDate = (i: number) => { const d = weekDate(i); return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` }

const A = {
  npReady: [2,3,6,7,9,11,11,13,14,16,17,17,18,19,19,20,20,21,21,22,22,22,22,22,23,23,23,25,26,26,26,29,30,30,33,33,35,35,38,38,40],
  npLive: [0,0,0,0,0,2,2,8,10,11,11,12,13,13,13,13,14,14,14,14,14,14,15,15,21,21,23,23,24,24,24,24,24,24,26,26,28,28,32,32,32],
  metaSub: [8,9,9,12,13,13,18,19,20,21,22,23,27,27,29,30,32,32,34,38,38,38,40,42,45,47,48,50,50,51,56,58,58,58,61,61,65,68,68,72],
  crSub: [8,8,8,4,8,8,9,9,12,12,12,19,19,21,24,24,26,26,30,30,30,32,34,37,37,41,41,44,44,45,45,49,49,49,52,53,54,54,57,58,59],
  metaLive: [8,8,8,8,8,8,8,10,10,10,10,12,12,12,12,12,12,13,15,16,22,23,26,28,29,31,33,34,35,35,35,35,36,36,36,36,36,38,39,39],
  crLive: [8,8,8,8,8,8,8,8,8,8,8,10,10,10,12,12,12,13,14,14,21,22,25,27,29,31,33,34,35,35,35,35,36,36,36,36,36,37,38,38,38],
  backlinks: [0,50,64,100,151,171,171,171,189,220,225,264,283,285,285,287,369,388,397,397,397,398,439,450,484,622,678,714,732,770,808,868,877,910,993,1028,1053,1113,1130,1173,1192],
  ilSub: [0,0,6,10,16,16,17,17,19,19,23,26,26,26,29,29,31,33,33,33,33,34,37,40,40,40,40,40,40,44,45,49,49,49,49,55,55,55,55,55,56],
  ilLive: [0,0,0,0,1,3,4,4,5,6,9,10,10,10,15,16,17,17,17,17,17,20,20,21,24,25,25,25,25,29,29,29,29,29,29,32,32,32,32,32,32],
  infSub: [0,0,2,4,7,8,9,10,12,15,18,18,21,24,27,29,35,35,38,38,41,41,41,46,48,50,51,51,51,51,59,59,60,60,64,65,65,65,65,65,65],
  infLive: [0,0,0,0,0,0,1,2,3,4,10,10,16,20,20,26,26,26,26,26,27,29,32,36,44,45,45,45,46,46,46,46,48,48,48,48,48,51,51,51,51],
}

type Track = { label: string; values: number[]; goal: number; planToDate: number | null; planSeries?: number[] }
type Workstream = { key: string; title: string; subtitle: string; unit: string; submitted: Track; live: Track }

const WS: Workstream[] = [
  { key: 'new', title: 'New Content', subtitle: 'New pages — Brief Ready vs Published', unit: 'pages',
    submitted: { label: 'New Pages – Submitted', values: A.npReady, goal: 50, planToDate: 35 },
    live: { label: 'New Pages – Live', values: A.npLive, goal: 50, planToDate: 31 } },
  { key: 'refresh', title: 'Content Refresh', subtitle: 'Refreshed pages — Brief Ready vs Published', unit: 'pages',
    submitted: { label: 'Content Refresh – Submitted', values: A.crSub, goal: 75, planToDate: 67 },
    live: { label: 'Content Refresh – Live', values: A.crLive, goal: 75, planToDate: 65 } },
  { key: 'meta', title: 'Meta Data', subtitle: 'Meta data updates — Brief Ready vs Published', unit: 'pages',
    submitted: { label: 'Meta Data – Submitted', values: A.metaSub, goal: 75, planToDate: 52 },
    live: { label: 'Meta Data – Live', values: A.metaLive, goal: 75, planToDate: null } },
  { key: 'linking', title: 'Internal Linking', subtitle: 'Internal link updates — Ready vs Published', unit: 'pages',
    submitted: { label: 'Internal Linking – Submitted', values: A.ilSub, goal: 100, planToDate: 90 },
    live: { label: 'Internal Linking – Live', values: A.ilLive, goal: 100, planToDate: 85 } },
  { key: 'infographics', title: 'Infographics', subtitle: 'Infographics — Ready vs Published', unit: 'assets',
    submitted: { label: 'Infographics – Submitted', values: A.infSub, goal: 50, planToDate: 45 },
    live: { label: 'Infographics – Live', values: A.infLive, goal: 50, planToDate: 43 } },
]
const BACKLINKS: Track = { label: 'Backlinks – Acquired', values: A.backlinks, goal: 1697, planToDate: 1430 }

export const OPS_PAGES = [
  { title: 'OPS — New Content',      short: 'New Content',      source: 'Operations Tracker' },
  { title: 'OPS — Content Refresh',  short: 'Content Refresh',  source: 'Operations Tracker' },
  { title: 'OPS — Internal Linking', short: 'Internal Linking', source: 'Operations Tracker' },
  { title: 'OPS — Infographics',     short: 'Infographics',     source: 'Operations Tracker' },
  { title: 'OPS — Backlinks',        short: 'Backlinks',        source: 'Operations Tracker' },
] as const

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const ORANGE = '#f28c00', GREEN = '#2e8b3a', BLUE = '#1f6fc5'
const TEXT = '#0d1f1a', DIM = '#51615b', LINE = '#ecede6'
const SANS = "'Plus Jakarta Sans','Inter',-apple-system,sans-serif"
const MONO = "'JetBrains Mono','Courier New',monospace"
const fmt = (n: number) => n.toLocaleString('en-US')
const last = (t: Track) => t.values[t.values.length - 1]

// ─── PIECES ───────────────────────────────────────────────────────────────────
function Kpi({ label, value, color, size = 34 }: { label: string; value: string; color: string; size?: number }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 90 }}>
      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontFamily: SANS, fontSize: size + 10, fontWeight: 800, color, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}
const Vs = () => <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: TEXT, alignSelf: 'center' }}>Vs</div>

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-block', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, padding: '7px 22px',
      fontFamily: SANS, fontSize: 13, fontWeight: 800, color: TEXT, boxShadow: '0 2px 6px rgba(15,42,36,0.08)' }}>{children}</div>
  )
}

const card: React.CSSProperties = { background: '#fff', border: `1px solid ${LINE}`, borderRadius: 24,
  boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 10px 28px rgba(15,42,36,0.06)' }

function TrackKpis({ t, accent }: { t: Track; accent: string }) {
  const actual = last(t)
  const pct = Math.round((actual / t.goal) * 100)
  return (
    <>
      <div style={{ ...card, borderRadius: 20, padding: '18px 26px', borderTop: `6px solid ${accent}`, display: 'flex', gap: 26, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Kpi label="Overall Plan" value={fmt(t.goal)} color={BLUE} />
        <Vs />
        {t.planToDate === null
          ? <Kpi label="Plan till date" value="No data" color={ORANGE} size={26} />
          : <Kpi label="Plan till date" value={fmt(t.planToDate)} color={ORANGE} />}
        <Vs />
        <Kpi label="Actual" value={fmt(actual)} color={GREEN} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: accent, background: `${accent}18`, padding: '5px 14px', borderRadius: 6 }}>
          {pct}% of goal
        </span>
        {t.planToDate !== null && (() => {
          const d = actual - t.planToDate
          const ok = d >= 0
          return (
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: ok ? GREEN : '#dc2626', background: ok ? '#2e8b3a14' : '#dc262614', padding: '4px 10px', borderRadius: 6 }}>
              {ok ? 'Ahead of plan' : 'Behind plan'} {d >= 0 ? '+' : ''}{fmt(d)}
            </span>
          )
        })()}
      </div>
    </>
  )
}

// Plan vs Actual area chart (SVG). Plan = pacing line 0 → plan-till-date → goal.
// Every actual week is plotted and labelled (hero = tall version for the lead chart).
function PlanActualChart({ t, series = 'Actual', hero = false, heading }: { t: Track; series?: string; hero?: boolean; heading?: string }) {
  const uid = useId().replace(/:/g, '')
  const [hover, setHover] = useState<number | null>(null)
  const W = 1120, H = hero ? 460 : 330, L = 52, R = 28, T = 26, B = 46
  const n = t.values.length
  const lastIdx = n - 1
  const maxV = Math.max(t.goal, ...t.values)
  const step = maxV <= 60 ? 10 : maxV <= 130 ? 20 : maxV <= 300 ? 50 : maxV <= 700 ? 100 : 400
  const yMax = Math.ceil((maxV * 1.1) / step) * step // headroom so labels above the top value fit
  const N = n // only weeks with data
  const x = (i: number) => L + (i / (N - 1)) * (W - L - R)
  const y = (v: number) => T + (1 - v / yMax) * (H - T - B)

  // Plan = overall goal, held flat across all weeks
  const plan: number[] = t.planSeries ?? Array.from({ length: N }, () => t.goal)
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = (vals: number[]) => `${path(vals)} L${x(vals.length - 1).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z`
  const dayLabel = (i: number) => { const d = weekDate(i); return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}` }
  const monthStarts = Array.from({ length: N }, (_, i) => i).filter(i => i > 0 && weekDate(i).getMonth() !== weekDate(i - 1).getMonth())
  const yTicks = Array.from({ length: yMax / step + 1 }, (_, k) => k * step)
  const h = hover

  return (
    <div style={{ ...card, padding: '18px 18px 10px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '0 8px 6px' }}>
        <span style={{ fontFamily: SANS, fontSize: hero ? 17 : 15, fontWeight: 800, color: TEXT }}>{heading ?? 'Weekly Trend'}</span>
        <div style={{ display: 'flex', gap: 16, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: TEXT }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 20, height: 4, background: ORANGE, display: 'inline-block', borderRadius: 2 }} />Plan (Overall {fmt(t.goal)})</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 20, height: 4, background: GREEN, display: 'inline-block', borderRadius: 2 }} />{series} ({fmt(last(t))})</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair', touchAction: 'pan-y' }}
        onPointerMove={e => {
          const r = e.currentTarget.getBoundingClientRect()
          const px = ((e.clientX - r.left) / r.width) * W
          const i = Math.round(((px - L) / (W - L - R)) * (N - 1))
          setHover(i < 0 ? 0 : i > lastIdx ? lastIdx : i)
        }}
        onPointerDown={e => {
          const r = e.currentTarget.getBoundingClientRect()
          const px = ((e.clientX - r.left) / r.width) * W
          const i = Math.round(((px - L) / (W - L - R)) * (N - 1))
          setHover(i < 0 ? 0 : i > lastIdx ? lastIdx : i)
        }}
        onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={GREEN} stopOpacity="0.32" /><stop offset="1" stopColor={GREEN} stopOpacity="0.02" /></linearGradient>
          <linearGradient id={`p${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ORANGE} stopOpacity="0.20" /><stop offset="1" stopColor={ORANGE} stopOpacity="0.01" /></linearGradient>
        </defs>
        {/* month bands */}
        {monthStarts.map(i => <line key={i} x1={x(i)} x2={x(i)} y1={T} y2={H - B} stroke="#e6e8e1" />)}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e6e8e1" strokeDasharray={v === 0 ? '' : '3 4'} />
            <text x={L - 10} y={y(v) + 4} textAnchor="end" fontFamily={SANS} fontSize="12" fontWeight="700" fill={TEXT}>{fmt(v)}</text>
          </g>
        ))}
        {Array.from({ length: N }, (_, i) => i).filter(i => i % 2 === 0).map(i => (
          <text key={i} x={x(i)} y={H - 22} textAnchor="middle" fontFamily={SANS} fontSize="10.5" fontWeight="700" fill={TEXT}>{dayLabel(i)}</text>
        ))}
        {monthStarts.map(i => <text key={`m${i}`} x={x(i)} y={H - 6} textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="800" fill={DIM}>{MONTHS[weekDate(i).getMonth()].toUpperCase()}</text>)}
        <text x={x(0)} y={H - 6} textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="800" fill={DIM}>FEB</text>
        <path d={area(plan)} fill={`url(#p${uid})`} />
        <path d={area(t.values)} fill={`url(#g${uid})`} />
        <path d={path(plan)} fill="none" stroke={ORANGE} strokeWidth="3.5" strokeLinejoin="round" />
        <path d={path(t.values)} fill="none" stroke={GREEN} strokeWidth="4" strokeLinejoin="round" />
        {t.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === lastIdx ? 0 : 2.6} fill="#fff" stroke={GREEN} strokeWidth="1.6" />)}
        <circle cx={x(lastIdx)} cy={y(t.values[lastIdx])} r="6" fill={GREEN} stroke="#fff" strokeWidth="2.5" />
        <text x={L + 8} y={y(plan[0]) - 9} textAnchor="start" fontFamily={SANS} fontSize="13" fontWeight="800" fill={ORANGE}>Plan {fmt(plan[0])}</text>
        {plan[lastIdx] !== plan[0] && <text x={W - R - 6} y={y(plan[lastIdx]) - 9} textAnchor="end" fontFamily={SANS} fontSize="13" fontWeight="800" fill={ORANGE}>Plan {fmt(plan[lastIdx])}</text>}
        {h !== null && (
          <g>
            <line x1={x(h)} x2={x(h)} y1={T} y2={H - B} stroke="#9aa39e" strokeDasharray="3 3" />
            <circle cx={x(h)} cy={y(plan[h])} r="5.5" fill={ORANGE} stroke="#fff" strokeWidth="2" />
            <circle cx={x(h)} cy={y(t.values[h])} r="5.5" fill={GREEN} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {h !== null && (
        <div style={{ position: 'absolute', top: 56, left: `${Math.min(Math.max((x(h) / W) * 100, 10), 88)}%`, transform: 'translateX(-50%)',
          background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', padding: '8px 12px', fontFamily: SANS, fontSize: 12, pointerEvents: 'none', minWidth: 160, zIndex: 3 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>{fmtDate(h)} · Week {h + 1}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}><span style={{ color: ORANGE, fontWeight: 700 }}>Plan (Overall)</span><b>{fmt(Math.round(plan[h]))}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}><span style={{ color: GREEN, fontWeight: 700 }}>Actual</span><b>{fmt(t.values[h])}</b></div>
        </div>
      )}
    </div>
  )
}

function SubmittedVsLive({ sub, live, unit }: { sub: number; live: number; unit: string }) {
  const rate = sub ? Math.round((live / sub) * 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 26 }}>
      <div style={{ ...card, borderRadius: 22, padding: '14px 40px', display: 'flex', gap: 26, justifyContent: 'center' }}>
        <Kpi label="Submitted" value={fmt(sub)} color={BLUE} size={40} />
        <Vs />
        <Kpi label="Live" value={fmt(live)} color={GREEN} size={40} />
      </div>
      <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: DIM }}>
        {rate}% of submitted {unit} are live · {fmt(sub - live)} awaiting publish
      </div>
    </div>
  )
}

function SlideTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 14 }}>
      <div style={{ display: 'inline-block', ...card, borderRadius: 12, padding: '9px 36px', fontFamily: SANS, fontSize: 22, fontWeight: 800, color: TEXT }}>{title}</div>
      <div style={{ fontFamily: SANS, fontSize: 13, color: DIM, marginTop: 8 }}>{sub}</div>
    </div>
  )
}

function KpiStrip({ title, t, accent }: { title: string; t: Track; accent: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}><Pill>{title}</Pill></div>
      <div style={{ maxWidth: 640, margin: '0 auto' }}><TrackKpis t={t} accent={accent} /></div>
    </div>
  )
}

// ─── KEY INSIGHTS (current week: 09 Nov 2026, week 41) ───────────────────────
const pctOf = (a: number, b: number) => Math.round((a / b) * 100)
const signed = (n: number) => `${n >= 0 ? '+' : '−'}${fmt(Math.abs(n))}`
const wow = (v: number[]) => v[v.length - 1] - v[v.length - 2]
const l4w = (v: number[]) => v[v.length - 1] - v[v.length - 5]
const planNowOf = (t: Track) => (t.planSeries ? t.planSeries[t.planSeries.length - 1] : t.goal)

// Plan check for one track: vs plan till date when tracked, otherwise vs overall plan
function planLine(name: string, t: Track, noun: string): { ok: boolean; text: string } {
  const cur = last(t), overall = planNowOf(t)
  if (t.planToDate !== null) {
    const d = cur - t.planToDate
    return { ok: d >= 0, text: `${name} ${fmt(cur)} vs ${fmt(t.planToDate)} plan till date (${signed(d)}), ${pctOf(cur, overall)}% of the overall ${fmt(overall)} ${noun}.` }
  }
  return { ok: true, text: `${name} ${fmt(cur)} of the overall ${fmt(overall)} ${noun} (${pctOf(cur, overall)}%); plan till date is not tracked.` }
}

function workstreamInsights(ws: Workstream): Insight[] {
  const sub = last(ws.submitted), live = last(ws.live), waiting = sub - live
  if (ws.key === 'infographics') {
    const plan = 50
    return [
      { tone: 'win', title: 'OVERALL PLAN EXCEEDED',
        text: `${fmt(sub)} infographics submitted against the overall plan of ${fmt(plan)} — ${fmt(sub - plan)} above plan and ${pctOf(sub, plan)}% delivered.` },
      { tone: 'win', title: 'LIVE DELIVERY ABOVE PLAN',
        text: `${fmt(live)} infographics are live against the overall plan of ${fmt(plan)} — ${fmt(live - plan)} above plan. ${pctOf(live, sub)}% of submitted infographics are live.` },
      { tone: waiting > 0 ? 'info' : 'win', title: 'WK41 PUBLISHING PIPELINE',
        text: `${fmt(waiting)} submitted infographics are awaiting publish. Week 41 closed at Submitted ${signed(wow(ws.submitted.values))} and Live ${signed(wow(ws.live.values))}; over 4 weeks Submitted ${signed(l4w(ws.submitted.values))} and Live ${signed(l4w(ws.live.values))}.` },
    ]
  }
  const ps = planLine('Submitted', ws.submitted, ws.unit), pl = planLine('Live', ws.live, ws.unit)
  const ds = wow(ws.submitted.values), dl = wow(ws.live.values)
  return [
    { tone: waiting > 0 && live / sub < 0.7 ? 'warn' : 'info', title: 'SUBMITTED VS LIVE THIS WEEK',
      text: `${fmt(sub)} ${ws.unit} submitted and ${fmt(live)} live. ${pctOf(live, sub)}% of submitted ${ws.unit} are published; ${fmt(waiting)} are still awaiting publish.` },
    { tone: ps.ok && pl.ok ? 'win' : 'warn', title: ps.ok && pl.ok ? 'AHEAD OF PLAN' : 'PLAN WATCH',
      text: `${ps.text} ${pl.text}` },
    { tone: ds > 0 || dl > 0 ? 'win' : 'warn', title: 'MOMENTUM: WK 40 → WK 41',
      text: `This week Submitted ${signed(ds)} and Live ${signed(dl)}. Over the last 4 weeks Submitted ${signed(l4w(ws.submitted.values))} and Live ${signed(l4w(ws.live.values))}.` },
  ]
}

function backlinkInsights(): Insight[] {
  const t = BACKLINKS, cur = last(t), adds = t.values.map((v, i) => (i ? v - t.values[i - 1] : v))
  const best = adds.indexOf(Math.max(...adds))
  const ahead = cur - (t.planToDate ?? 0)
  return [
    { tone: 'info', title: 'TOTAL BACKLINKS ACQUIRED', text: `${fmt(cur)} of the overall ${fmt(t.goal)} backlinks (${pctOf(cur, t.goal)}%). ${fmt(t.goal - cur)} remain to reach the goal.` },
    { tone: ahead >= 0 ? 'win' : 'warn', title: ahead >= 0 ? 'AHEAD OF PLAN' : 'BEHIND PLAN', text: `${fmt(cur)} acquired vs ${fmt(t.planToDate ?? 0)} plan till date (${signed(ahead)}).` },
    { tone: wow(t.values) > 0 ? 'win' : 'warn', title: 'MOMENTUM: WK 40 → WK 41', text: `${signed(wow(t.values))} this week (${fmt(t.values[t.values.length - 2])} → ${fmt(cur)}) and ${signed(l4w(t.values))} over 4 weeks. Best week so far: ${fmtDate(best)} at ${signed(adds[best])}.` },
  ]
}

function WorkstreamSlide({ ws }: { ws: Workstream }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <KeyInsights insights={workstreamInsights(ws)} weekLabel="Wk45 · 09 Nov" />
      <div>
        <SlideTitle title={ws.title} sub={`${ws.subtitle} · ${ws.submitted.values.length} weeks, ${fmtDate(0)} → ${fmtDate(ws.submitted.values.length - 1)}`} />
        <SubmittedVsLive sub={last(ws.submitted)} live={last(ws.live)} unit={ws.unit} />
      </div>
      <div>
        <KpiStrip title={`${ws.title} – Submitted`} t={ws.submitted} accent={BLUE} />
        <PlanActualChart t={ws.submitted} hero series="Actual" heading={`${ws.title} – Submitted: Plan ${fmt(ws.submitted.goal)} vs Actual ${fmt(last(ws.submitted))}`} />
      </div>
      <div>
        <KpiStrip title={`${ws.title} – Live`} t={ws.live} accent={GREEN} />
        <PlanActualChart t={ws.live} hero series="Actual" heading={`${ws.title} – Live: Plan ${fmt(ws.live.goal)} vs Actual ${fmt(last(ws.live))}`} />
      </div>
    </div>
  )
}

function BacklinksSlide() {
  const t = BACKLINKS
  const wk = t.values.length - 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <KeyInsights insights={backlinkInsights()} weekLabel="Wk45 · 09 Nov" />
      <SlideTitle title="Backlinks" sub={`Cumulative backlinks acquired · ${t.values.length} weeks, ${fmtDate(0)} → ${fmtDate(wk)}`} />
      <KpiStrip title="Backlinks – Acquired" t={t} accent="#7c3aed" />
      <PlanActualChart t={t} hero series="Actual" heading={`Backlinks: Plan ${fmt(t.goal)} vs Actual ${fmt(t.values[wk])}`} />
    </div>
  )
}

export function OperationalSlide({ title }: { title: string }) {
  if (title === 'OPS — Backlinks') return <BacklinksSlide />
  const ws = WS.find(w => `OPS — ${w.title}` === title)
  return ws ? <WorkstreamSlide ws={ws} /> : null
}
