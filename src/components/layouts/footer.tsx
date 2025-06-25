'use client';

import { version as nextVersion } from 'next/package.json';

export function Footer() {
  return (
    <footer className="w-100vw h-10vh mx-0 p-4 border-b-2 border-b-[#0066aa] bg-[#333333] text-white">
      <div className="text-[#ffffff] text-sm">
        Copyright &copy; 2025. All rights reserverd.
        Node.js Version: 
        Next.js Version: {nextVersion}
      </div>
    </footer>
  );
}
