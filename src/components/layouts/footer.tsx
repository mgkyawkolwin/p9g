'use client';

import ThemeToggle from "../uicustom/themetoggle";



export function Footer({nodeVersion, nextVersion, appVersion}: {nodeVersion:string, nextVersion:string, appVersion:string}) {
  return (
    <footer className="flex justify-between w-100vw h-10vh mx-0 p-4 border-b-2 border-b-[#0066aa] bg-[#333333] text-white">
      <div className="text-[#ffffff] text-sm">
        Copyright &copy; 2025. All rights reserverd.&nbsp;&nbsp;&nbsp;
        Node.js Version: {nodeVersion}&nbsp;&nbsp;&nbsp;
        Next.js Version: {nextVersion}&nbsp;&nbsp;&nbsp;
        App Version: {appVersion}&nbsp;&nbsp;&nbsp;
      </div>
      <div>
        <ThemeToggle />
      </div>
    </footer>
  );
}
