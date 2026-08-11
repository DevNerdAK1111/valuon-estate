import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://valuon-estate-backend.onrender.com';

export function useAiParser() {
  return useMutation({
    mutationFn: async ({ text, url }) => {
      const res = await fetch(`${BACKEND_URL}/api/ai-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, url })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Fehler bei der KI-Analyse');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast.success('Exposé erfolgreich durch KI analysiert!');
    },
    onError: (err) => {
      toast.error(`Analyse fehlgeschlagen: ${err.message}`);
    }
  });
}
