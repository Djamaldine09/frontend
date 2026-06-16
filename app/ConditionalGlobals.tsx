'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ConditionalGlobals() {
  const pathname = usePathname();

  useEffect(() => {
    // Only load globals.css if not on landing page
    if (pathname !== '/landing') {
      import('./globals.css');
    }
  }, [pathname]);

  return null;
}
