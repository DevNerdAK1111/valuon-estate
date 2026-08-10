'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { PropertyProvider } from '../context/PropertyContext';

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <PropertyProvider>
        {children}
        <Toaster 
          position="bottom-right" 
          toastOptions={{ 
            duration: 4000, 
            style: { background: '#FFFFFF', color: '#13381A', border: '1px solid #E2D9CE', fontSize: '0.85rem', fontWeight: 'bold' }, 
            success: { style: { background: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' } }, 
            error: { style: { background: '#FEF2F2', borderColor: '#FECACA', color: '#9B2C2C' } } 
          }} 
        />
      </PropertyProvider>
    </QueryClientProvider>
  );
}
