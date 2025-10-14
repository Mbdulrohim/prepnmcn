'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return !isAdminPage ? <Header /> : null;
}
