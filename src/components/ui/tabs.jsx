import React from 'react'

const TabsContext = React.createContext({ value: 'home' })

export function Tabs({ value, onValueChange, children }) {
  return <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>
}

export function TabsList({ className = '', children }) {
  return <div className={'flex gap-2 ' + className}>{children}</div>
}

export function TabsTrigger({ value, children, className = '' }) {
  const ctx = React.useContext(TabsContext)
  const active = ctx.value === value
  return (
    <button
      className={(active ? 'bg-neutral-900 text-white ' : 'border ') + 'rounded-xl px-3 py-1.5 text-sm ' + className}
      onClick={() => ctx.onValueChange && ctx.onValueChange(value)}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className = '' }) {
  const ctx = React.useContext(TabsContext)
  if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}
