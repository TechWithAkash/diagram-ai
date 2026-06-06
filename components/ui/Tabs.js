'use client'

import { useState } from 'react'
import clsx from 'clsx'

export function Tabs({ tabs, defaultTab, children }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id)

  return (
    <div>
      <div className="flex border-b border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-display font-medium border-b-2 -mb-px transition-colors duration-150',
              active === tab.id
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.map(tab => (
          <div key={tab.id} className={active === tab.id ? 'block' : 'hidden'}>
            {children(tab.id)}
          </div>
        ))}
      </div>
    </div>
  )
}
