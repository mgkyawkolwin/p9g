// app/components/layouts/tabswitcher.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface TabSwitcherProps {
  currentLocation: string;
}

const RESORTS = {
  MIDA: { name: 'MIDA', bgClass: 'bg-yellow-500', activeBgClass: 'bg-[#ff0000]', bgColor: '#666666', activeBgColor: '#eab308' },
  KKC: { name: 'KKC', bgClass: 'bg-green-500', activeBgClass: 'bg-[#00ff00]', bgColor: '#666666', activeBgColor: '#22c55e' },
  HH: { name: 'HH', bgClass: 'bg-blue-500', activeBgClass: 'bg-[#0000ff]', bgColor: '#666666', activeBgColor: '#3b82f6' }
};

export function TabSwitcher({ currentLocation }: TabSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bgColor = RESORTS[currentLocation as keyof typeof RESORTS]?.activeBgClass;

  const switchResort = (newLocation: string) => {
    const segments = pathname.split('/').filter(Boolean);
    segments[0] = newLocation;
    const newPath = '/' + segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="flex gap-1">
      {Object.entries(RESORTS).map(([key, resort]) => (
        <button
          key={key}
          onClick={() => switchResort(key)}
          className={`
            py-2 rounded-t-lg font-medium transition-all relative text-white
            }
            ${currentLocation === key ? 'z-10' : 'z-0'}
          `}
          style={{
            borderTopLeftRadius: '0.5rem',
            borderTopRightRadius: '0.5rem',
            width: '120px',
            backgroundColor: currentLocation === key ? resort.activeBgColor : resort.bgColor
          }}
        >
          {resort.name}
        </button>
      ))}
    </div>
  );
}