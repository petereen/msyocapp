import React from 'react'
export function Switch({ checked = false, onCheckedChange = () => {}, className = '' }) {
  return (
    <label className={'inline-flex items-center cursor-pointer ' + className}>
      <input type='checkbox' className='hidden' checked={checked} onChange={e => onCheckedChange(e.target.checked)} />
      <span className={'relative inline-block w-10 h-6 rounded-full transition ' + (checked ? 'bg-neutral-900' : 'bg-neutral-300')}>
        <span className={'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ' + (checked ? 'translate-x-4' : '')}></span>
      </span>
    </label>
  )
}
