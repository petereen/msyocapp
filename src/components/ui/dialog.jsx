import React from 'react'

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30" onClick={() => onOpenChange && onOpenChange(false)}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-[92%]" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ className = '', children }) {
  return <div className={'p-4 ' + className}>{children}</div>
}

export function DialogHeader({ className = '', children }) {
  return <div className={'mb-2 ' + className}>{children}</div>
}

export function DialogTitle({ className = '', children }) {
  return <h3 className={'text-lg font-semibold ' + className}>{children}</h3>
}
