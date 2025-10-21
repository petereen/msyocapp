// src/components/ui/select.jsx
import React from "react"
import { createPortal } from "react-dom"

const SelectCtx = React.createContext(null)

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef(null)
  const contentRef = React.useRef(null)
  const [contentStyle, setContentStyle] = React.useState({})

  // Position the dropdown under the trigger
  const updatePosition = React.useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setContentStyle({
      position: "absolute",
      top: `${rect.bottom + window.scrollY + 6}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      zIndex: 50,
    })
  }, [])

  // Open → compute position
  React.useEffect(() => {
    if (open) {
      updatePosition()
      const onScrollOrResize = () => updatePosition()
      window.addEventListener("scroll", onScrollOrResize, true)
      window.addEventListener("resize", onScrollOrResize, true)
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true)
        window.removeEventListener("resize", onScrollOrResize, true)
      }
    }
  }, [open, updatePosition])

  // Click outside to close
  React.useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      const t = triggerRef.current
      const c = contentRef.current
      if (t?.contains(e.target) || c?.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const ctx = React.useMemo(
    () => ({ value, onValueChange, open, setOpen, triggerRef, contentRef, contentStyle }),
    [value, onValueChange, open, contentStyle]
  )

  return <SelectCtx.Provider value={ctx}>{children}</SelectCtx.Provider>
}

export function SelectTrigger({ className = "", children }) {
  const ctx = React.useContext(SelectCtx)
  return (
    <button
      type="button"
      ref={ctx.triggerRef}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm flex items-center justify-between ${className}`}
    >
      <span className="truncate">{children}</span>
      {/* simple chevron */}
      <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" className={`transition ${ctx.open ? "rotate-180" : ""}`}>
        <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder }) {
  const ctx = React.useContext(SelectCtx)
  return <span className="text-sm text-neutral-800">{ctx.value || placeholder}</span>
}

export function SelectContent({ className = "", children }) {
  const ctx = React.useContext(SelectCtx)
  if (!ctx.open) return null
  return createPortal(
    <div
      ref={ctx.contentRef}
      style={ctx.contentStyle}
      className={`rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden ${className}`}
      role="listbox"
    >
      {children}
    </div>,
    document.body
  )
}

export function SelectItem({ value, children }) {
  const ctx = React.useContext(SelectCtx)
  const active = ctx.value === value
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => {
        ctx.onValueChange?.(value)
        ctx.setOpen(false)
      }}
      className={`block w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 ${active ? "bg-neutral-100" : ""}`}
    >
      {children}
    </button>
  )
}
