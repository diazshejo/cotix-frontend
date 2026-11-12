import { useRef } from "react"
import type { PointerEvent } from "react"
import type { SignaturePoint, SignatureStrokes } from "@/types/quote"

export function SignaturePad({ value, onChange, readOnly = false }: {
  value: SignatureStrokes
  onChange?: (strokes: SignatureStrokes) => void
  readOnly?: boolean
}) {
  const drawing = useRef(false)
  const current = useRef(value)
  current.current = value

  function update(strokes: SignatureStrokes) {
    current.current = strokes
    onChange?.(strokes)
  }

  function pointFromEvent(event: PointerEvent<SVGSVGElement>): SignaturePoint {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    }
  }

  function start(event: PointerEvent<SVGSVGElement>) {
    if (readOnly || !onChange || current.current.length >= 10) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    update([...current.current, [pointFromEvent(event)]])
  }

  function move(event: PointerEvent<SVGSVGElement>) {
    if (!drawing.current || !onChange) return
    const point = pointFromEvent(event)
    const lastStroke = current.current.at(-1)
    if (!lastStroke || lastStroke.length >= 500 || current.current.flat().length >= 2000) return
    const previous = lastStroke.at(-1)
    if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 0.003) return
    update([...current.current.slice(0, -1), [...lastStroke, point]])
  }

  function stop() {
    drawing.current = false
    if (current.current.at(-1)?.length === 1) update(current.current.slice(0, -1))
  }

  return (
    <div>
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        role="img"
        aria-label={readOnly ? "Trazo de firma electrónica" : "Área para dibujar tu firma"}
        className={`h-36 w-full rounded-md border border-border bg-white ${readOnly ? "" : "cursor-crosshair touch-none"}`}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        {value.map((stroke, index) => (
          <polyline
            key={index}
            points={stroke.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {!readOnly && onChange && (
        <button type="button" className="mt-2 text-sm font-semibold text-primary hover:underline" onClick={() => update([])}>
          Borrar firma
        </button>
      )}
    </div>
  )
}
