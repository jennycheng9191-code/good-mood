import { useCallback, useRef, useState, type ReactNode } from "react"
import materials from "./data/materials.json"

type Quote = { id: string; theme: string; text: string }
type Method = {
  id: string
  category: string
  name: string
  how: string
  time: string
  evidence?: string
  source?: string
}
type Classic = { id: string; direction: string; source: string; text: string; plain: string }
// 給特定讀者的話：type 是「暖心話」或「做法」
type Voice = { id: string; type: string; theme: string; text: string }

const quotes = materials.quotes as Quote[]
const methods = materials.methods as Method[]
const classics = materials.classics as Classic[]
const parents = materials.parents as Voice[]
const teens = materials.teens as Voice[]
const traders = materials.traders as Voice[]

/*
 * 抽籤袋：一輪抽完才重洗，重洗後第一張不會和上一張相同。
 * 剩下的順序存在這台瀏覽器的 localStorage，重新整理或隔天再來都會接著抽；
 * 每位訪客各自洗牌、各自記錄，彼此不影響。
 */
function useBag<T extends { id: string }>(items: T[], storageKey: string) {
  const byId = useRef(new Map(items.map((x) => [x.id, x])))
  const bag = useRef<string[] | null>(null)
  const last = useRef<string | null>(null)

  return useCallback(() => {
    if (bag.current === null) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null")
        if (saved && Array.isArray(saved.bag)) {
          // 素材更新後，丟掉已不存在的編號
          bag.current = saved.bag.filter((id: string) => byId.current.has(id))
          last.current = typeof saved.last === "string" ? saved.last : null
        }
      } catch {
        /* 無法讀取時當作新的一輪 */
      }
      bag.current ??= []
    }
    if (bag.current.length === 0) {
      const next = items.map((x) => x.id)
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
      }
      if (next.length > 1 && next[next.length - 1] === last.current) {
        ;[next[0], next[next.length - 1]] = [next[next.length - 1], next[0]]
      }
      bag.current = next
    }
    const id = bag.current.pop() as string
    last.current = id
    try {
      localStorage.setItem(storageKey, JSON.stringify({ bag: bag.current, last: id }))
    } catch {
      /* 無痕模式等無法儲存時，仍可正常抽，只是重新整理後會重洗 */
    }
    return byId.current.get(id) as T
  }, [items, storageKey])
}

type Tone = "orange" | "green" | "blue" | "rose" | "purple" | "teal"

// btn 色比 solid 深一階，讓白字在按鈕上清楚可讀
const tones: Record<Tone, { wash: string; solid: string; deep: string; btn: string }> = {
  orange: { wash: "var(--orange-wash)", solid: "var(--orange)", deep: "var(--orange-deep)", btn: "#e2702a" },
  green: { wash: "var(--green-wash)", solid: "var(--green)", deep: "var(--green-deep)", btn: "#4e8f55" },
  blue: { wash: "var(--blue-wash)", solid: "var(--blue)", deep: "var(--blue-deep)", btn: "#3d7fb2" },
  rose: { wash: "var(--rose-wash)", solid: "var(--rose)", deep: "var(--rose-deep)", btn: "#c2526f" },
  purple: { wash: "var(--purple-wash)", solid: "var(--purple)", deep: "var(--purple-deep)", btn: "#7660b5" },
  teal: { wash: "var(--teal-wash)", solid: "var(--teal)", deep: "var(--teal-deep)", btn: "#3b877c" },
}

function Chip({ children, tone }: { children: ReactNode; tone: Tone }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
      style={{ background: tones[tone].wash, color: tones[tone].deep }}
    >
      {children}
    </span>
  )
}

function Panel({
  tone,
  icon,
  kicker,
  label,
  total,
  emptyHint,
  onDraw,
  drawKey,
  children,
}: {
  tone: Tone
  icon: ReactNode
  kicker: string
  label: string
  total: number
  emptyHint: string
  onDraw: () => void
  drawKey: number
  children: ReactNode | null
}) {
  const t = tones[tone]
  const drawn = drawKey > 0
  return (
    <section
      className="flex flex-col rounded-[22px] border bg-white/80 shadow-[0_1px_0_rgba(61,46,38,0.04),0_12px_30px_-18px_rgba(201,99,31,0.35)]"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="flex items-center gap-3 rounded-t-[22px] px-5 pb-3 pt-5" style={{ background: t.wash }}>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
          style={{ background: "#fff", color: t.deep }}
          aria-hidden
        >
          {icon}
        </span>
        <div>
          <p className="text-[16px] font-bold tracking-wide" style={{ color: t.deep }}>
            {kicker}
          </p>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            共 {total} 則
          </p>
        </div>
      </div>

      <div className="px-5 pt-4" style={{ background: `linear-gradient(${t.wash}, rgba(255,255,255,0) 70%)` }}>
        <button
          type="button"
          onClick={onDraw}
          className="w-full rounded-2xl px-4 py-4 text-[17px] font-bold text-white transition-[transform,filter] duration-150 hover:brightness-105 active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2"
          style={{ background: t.btn, outlineColor: t.deep }}
        >
          {drawn ? "再抽一次" : label}
        </button>
      </div>

      <div className="flex min-h-[260px] flex-1 flex-col px-5 pb-6 pt-5" aria-live="polite">
        {drawn ? (
          <div key={drawKey} className="rise flex flex-1 flex-col">
            {children}
          </div>
        ) : (
          <div
            className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center text-base leading-relaxed"
            style={{ borderColor: t.solid, color: "var(--ink-soft)", opacity: 0.85 }}
          >
            {emptyHint}
          </div>
        )}
      </div>
    </section>
  )
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity=".2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </svg>
)
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" fill="currentColor" fillOpacity=".15" />
    <path d="M5 19c3-4 6-7 10-9" />
  </svg>
)
const BookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M12 6.5C10 5 7 4.6 4 5v13c3-.4 6 0 8 1.5 2-1.5 5-1.9 8-1.5V5c-3-.4-6 0-8 1.5Z" fill="currentColor" fillOpacity=".12" />
    <path d="M12 6.5v13" />
  </svg>
)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" fill="currentColor" fillOpacity=".15" />
  </svg>
)
const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z" fill="currentColor" fillOpacity=".15" />
  </svg>
)
const CompassIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" fill="currentColor" fillOpacity=".2" />
  </svg>
)

/* 給特定讀者的話：內文加上「暖心話／做法」與主題兩個標籤 */
function VoiceCard({ item, tone }: { item: Voice; tone: Tone }) {
  return (
    <>
      <p className="font-serif-tc text-[23px] font-medium leading-[1.75]" style={{ color: "var(--ink)" }}>
        {item.text}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Chip tone={tone}>{item.type}</Chip>
        <Chip tone={tone}>{item.theme}</Chip>
      </div>
    </>
  )
}

/* 一段可無縫重複的海浪曲線：寬 2880（兩倍畫面），週期 240 */
function wavePath(amp: number, base: number, height: number) {
  let d = `M0 ${base}`
  for (let x = 0; x < 2880; x += 240) {
    d += ` Q${x + 60} ${base - amp} ${x + 120} ${base} T${x + 240} ${base}`
  }
  return `${d} V${height} H0 Z`
}

function Wave({ fill, amp, speed, className }: { fill: string; amp: number; speed: "slow" | "fast"; className: string }) {
  return (
    <div className={`pointer-events-none absolute left-0 overflow-hidden ${className}`} style={{ width: "100%" }} aria-hidden>
      <svg className={`wave wave-${speed} block h-full`} viewBox="0 0 2880 40" preserveAspectRatio="none">
        <path d={wavePath(amp, 14, 40)} fill={fill} />
      </svg>
    </div>
  )
}

/* 天空：雲朵與海鷗 */
function Sky() {
  const cloud = (x: number, y: number, s: number, delay: number) => (
    /* 位置放在外層，動畫放在內層，避免 CSS 動畫蓋掉 SVG 的位置設定 */
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="float" style={{ animationDelay: `${delay}s` }}>
        <ellipse cx="60" cy="34" rx="58" ry="18" fill="#fff" />
        <circle cx="42" cy="26" r="20" fill="#fff" />
        <circle cx="74" cy="20" r="24" fill="#fff" />
      </g>
    </g>
  )
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[300px] w-full"
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMin slice"
    >
      {cloud(820, 40, 1.1, 0)}
      {cloud(1180, 120, 0.8, -20)}
      {cloud(60, 210, 0.7, -40)}
      <g className="float" style={{ animationDelay: "-12s" }} fill="none" stroke="#6f94ad" strokeWidth="2.4" strokeLinecap="round">
        <path d="M1040 70q9-9 18 0q9-9 18 0" />
        <path d="M1090 96q6-6 12 0q6-6 12 0" />
      </g>
    </svg>
  )
}

/* 大海與沙灘：頁尾就坐在沙灘上 */
function Beach({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-16 w-full" aria-label="頁尾">
      {/* 海 */}
      <div className="relative h-[120px] sm:h-[150px]" style={{ background: "linear-gradient(180deg, #a9d2ea 0%, #c3e0f0 55%, #d8ecf5 100%)" }}>
        <Wave fill="#a9d2ea" amp={6} speed="slow" className="top-[-22px] h-[24px]" />
        <Wave fill="#bfe0f1" amp={5} speed="fast" className="top-[46px] h-[22px] opacity-80" />
        {/* 浪花白邊 */}
        <Wave fill="#ffffff" amp={7} speed="slow" className="bottom-[-2px] h-[30px] opacity-90" />
      </div>

      {/* 沙灘 */}
      <div className="relative" style={{ background: "linear-gradient(180deg, #fbefcc 0%, #f7e3b2 100%)" }}>
        <Wave fill="#fbefcc" amp={4} speed="fast" className="top-[-12px] h-[14px]" />
        <svg aria-hidden className="pointer-events-none absolute bottom-4 left-[6%] h-10 w-10 sm:h-12 sm:w-12" viewBox="0 0 48 48">
          <path
            d="M24 4l5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1z"
            fill="#f3a65e"
            stroke="#e08a40"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <svg aria-hidden className="pointer-events-none absolute bottom-5 left-[calc(6%+56px)] h-8 w-10" viewBox="0 0 44 36">
          <path d="M22 34C8 34 2 22 4 12c6-8 30-8 36 0 2 10-4 22-18 22z" fill="#fde2d0" stroke="#e7b496" strokeWidth="1.5" />
          <path d="M22 33V8M14 31l-6-19M30 31l6-19" stroke="#e7b496" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {/* 沙灘椅 */}
        <svg
          aria-hidden
          className="pointer-events-none absolute bottom-3 right-[5%] h-[84px] w-[122px] sm:bottom-5 sm:h-[118px] sm:w-[172px]"
          viewBox="0 0 160 110"
        >
          <defs>
            <pattern id="stripe" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-34)">
              <rect width="14" height="14" fill="#fffaf2" />
              <rect width="7" height="14" fill="var(--orange)" />
            </pattern>
          </defs>
          <ellipse cx="80" cy="104" rx="70" ry="5" fill="#e3c483" opacity=".6" />
          {/* 木框與椅腳 */}
          <g stroke="#a87545" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M16 84H106L142 30" />
            <path d="M28 84L20 104M94 84L106 104M126 54L142 104" />
          </g>
          {/* 條紋布面 */}
          <path
            d="M16 70H94L127 20L139 28L103 82H16Z"
            fill="url(#stripe)"
            stroke="#d06a26"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* 折好的毛巾 */}
          <rect x="30" y="60" width="34" height="11" rx="4" fill="var(--blue)" />
          <rect x="30" y="64" width="34" height="3" fill="#fff" opacity=".7" />
        </svg>
        <footer className="relative mx-auto max-w-6xl px-4 pb-28 pt-8 text-[16px] leading-relaxed sm:px-6 sm:pb-24" style={{ color: "var(--ink)" }}>
          {children}
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  const drawQuote = useBag(quotes, "goodmood-bag-quotes")
  const drawMethod = useBag(methods, "goodmood-bag-methods")
  const drawClassic = useBag(classics, "goodmood-bag-classics")
  const drawParent = useBag(parents, "goodmood-bag-parents")
  const drawTeen = useBag(teens, "goodmood-bag-teens")
  const drawTrader = useBag(traders, "goodmood-bag-traders")

  const [quote, setQuote] = useState<{ item: Quote; n: number } | null>(null)
  const [method, setMethod] = useState<{ item: Method; n: number } | null>(null)
  const [classic, setClassic] = useState<{ item: Classic; n: number } | null>(null)
  const [parent, setParent] = useState<{ item: Voice; n: number } | null>(null)
  const [teen, setTeen] = useState<{ item: Voice; n: number } | null>(null)
  const [trader, setTrader] = useState<{ item: Voice; n: number } | null>(null)

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #e3f0f8 0%, #f3f8f8 220px, var(--paper) 520px, var(--paper) 100%)" }}
    >
      <Sky />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pt-10 sm:px-6 sm:pt-16">
        <header className="mb-10 flex flex-col items-start gap-5 sm:mb-14 sm:flex-row sm:items-center">
          <svg viewBox="0 0 80 80" className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" aria-hidden>
            <g className="spin-slow">
              {Array.from({ length: 12 }).map((_, i) => (
                <rect
                  key={i}
                  x="38"
                  y="3"
                  width="4"
                  height="13"
                  rx="2"
                  fill={i % 2 ? "var(--yellow)" : "var(--orange)"}
                  transform={`rotate(${i * 30} 40 40)`}
                />
              ))}
            </g>
            <circle cx="40" cy="40" r="17" fill="var(--orange)" />
            <path d="M32 43c2.5 3 13.5 3 16 0" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <circle cx="34" cy="37" r="1.9" fill="#fff" />
            <circle cx="46" cy="37" r="1.9" fill="#fff" />
          </svg>
          <div>
            <h1 className="font-serif-tc text-4xl font-bold tracking-wide sm:text-5xl" style={{ color: "var(--ink)" }}>
              轉回好心情
            </h1>
            <p className="mt-2 text-base sm:text-lg" style={{ color: "var(--ink-soft)" }}>
              先深呼吸一下，再為今天抽一張卡。
            </p>
          </div>
        </header>

        {/* 開場白 */}
        <section
          className="-mt-4 mb-10 max-w-3xl border-l-4 pl-5 sm:-mt-6 sm:mb-12 sm:pl-6"
          style={{ borderColor: "var(--yellow)" }}
        >
          <p className="font-serif-tc text-[19px] leading-[1.9] sm:text-[21px]" style={{ color: "var(--ink)" }}>
            如果今天抽到的句子和方法剛好適合你，幫你<b style={{ color: "var(--orange-deep)" }}>轉回了好心情</b>，
            <br className="hidden sm:block" />
            請把它記下來，常常拿出來用。
          </p>
          <p className="font-serif-tc mt-2 text-[19px] leading-[1.9] sm:text-[21px]" style={{ color: "var(--ink)" }}>
            願它陪著你，每天都活得更好一點。
          </p>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel
            tone="orange"
            icon={<SunIcon />}
            kicker="今日正能量短句"
            label="抽出屬於你的今日正能量短句"
            total={quotes.length}
            emptyHint="按下按鈕，抽一句陪你今天的話。"
            onDraw={() => setQuote((p) => ({ item: drawQuote(), n: (p?.n ?? 0) + 1 }))}
            drawKey={quote?.n ?? 0}
          >
            {quote && (
              <>
                <p className="font-serif-tc text-[26px] font-medium leading-[1.7]" style={{ color: "var(--ink)" }}>
                  {quote.item.text}
                </p>
                <div className="mt-auto pt-5">
                  <Chip tone="orange">{quote.item.theme}</Chip>
                </div>
              </>
            )}
          </Panel>

          <Panel
            tone="green"
            icon={<LeafIcon />}
            kicker="靜心放鬆的好方法"
            label="抽出屬於你的好方法"
            total={methods.length}
            emptyHint="按下按鈕，抽一個現在就能做的小方法。"
            onDraw={() => setMethod((p) => ({ item: drawMethod(), n: (p?.n ?? 0) + 1 }))}
            drawKey={method?.n ?? 0}
          >
            {method && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="green">{method.item.category}</Chip>
                  {method.item.time && (
                    <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
                      約 {method.item.time}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-[26px] font-bold leading-snug" style={{ color: "var(--green-deep)" }}>
                  {method.item.name}
                </h2>
                <p className="mt-3 text-[18px] leading-[1.8]" style={{ color: "var(--ink)" }}>
                  {method.item.how}
                </p>
                {method.item.evidence && (
                  <div
                    className="mt-5 rounded-xl px-4 py-3.5 text-[16px] leading-relaxed"
                    style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}
                  >
                    <p>
                      研究證據：<b style={{ color: "var(--ink)" }}>{method.item.evidence}</b>
                      <span className="mx-1.5">·</span>
                      {method.item.source}
                    </p>
                    <p className="mt-1">補充品或飲食調整前，請先和醫師或營養師討論。</p>
                  </div>
                )}
              </>
            )}
          </Panel>

          <Panel
            tone="blue"
            icon={<BookIcon />}
            kicker="經典好句"
            label="抽出屬於你的經典好句"
            total={classics.length}
            emptyHint="按下按鈕，抽一句穿越時間留下來的話。"
            onDraw={() => setClassic((p) => ({ item: drawClassic(), n: (p?.n ?? 0) + 1 }))}
            drawKey={classic?.n ?? 0}
          >
            {classic && (
              <>
                <p className="font-serif-tc text-[25px] font-medium leading-[1.75]" style={{ color: "var(--ink)" }}>
                  {classic.item.text}
                </p>
                <p className="mt-3 text-base" style={{ color: "var(--blue-deep)" }}>
                  — {classic.item.source}
                </p>
                <div className="mt-auto pt-5">
                  <div className="border-t pt-3" style={{ borderColor: "var(--blue-wash)" }}>
                    <p className="text-[18px] leading-relaxed" style={{ color: "var(--ink)" }}>
                      <span className="mr-2 text-sm font-medium" style={{ color: "var(--ink-soft)" }}>
                        白話
                      </span>
                      {classic.item.plain}
                    </p>
                    <div className="mt-3">
                      <Chip tone="blue">{classic.item.direction}</Chip>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Panel>

          <Panel
            tone="rose"
            icon={<HeartIcon />}
            kicker="給青少年父母的話"
            label="抽一句給父母的話"
            total={parents.length}
            emptyHint="按下按鈕，抽一句陪你陪伴孩子的話。"
            onDraw={() => setParent((p) => ({ item: drawParent(), n: (p?.n ?? 0) + 1 }))}
            drawKey={parent?.n ?? 0}
          >
            {parent && <VoiceCard item={parent.item} tone="rose" />}
          </Panel>

          <Panel
            tone="purple"
            icon={<StarIcon />}
            kicker="給青少年的話"
            label="抽一句給你的話"
            total={teens.length}
            emptyHint="按下按鈕，抽一句寫給正在長大的你的話。"
            onDraw={() => setTeen((p) => ({ item: drawTeen(), n: (p?.n ?? 0) + 1 }))}
            drawKey={teen?.n ?? 0}
          >
            {teen && <VoiceCard item={teen.item} tone="purple" />}
          </Panel>

          <Panel
            tone="teal"
            icon={<CompassIcon />}
            kicker="給交易員的話"
            label="抽一句給交易員的話"
            total={traders.length}
            emptyHint="按下按鈕，抽一句陪你面對市場的話。"
            onDraw={() => setTrader((p) => ({ item: drawTrader(), n: (p?.n ?? 0) + 1 }))}
            drawKey={trader?.n ?? 0}
          >
            {trader && <VoiceCard item={trader.item} tone="teal" />}
          </Panel>
        </div>


      </main>

      <Beach>
        <p>本站內容非醫療建議。持續的失眠、焦慮或情緒低落，請尋求專業協助。</p>
        <p className="mt-2 text-[15px]" style={{ color: "var(--ink-soft)" }}>
          「給青少年父母的話」與「給青少年的話」是一般性的陪伴，不取代諮商或輔導；「給交易員的話」只談心態，不構成任何投資建議。
        </p>
        <p className="mt-2 text-[15px]" style={{ color: "var(--ink-soft)" }}>
          短句與三組「給⋯⋯的話」皆為原創；經典句中標示「意譯」者為依原文意思自行翻譯。
        </p>
        <p className="mt-3 text-[15px]" style={{ color: "var(--ink-soft)" }}>
          站長：Jenny Cheng
        </p>
      </Beach>
    </div>
  )
}
