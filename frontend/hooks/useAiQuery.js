import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://valuon-estate-backend.onrender.com';

export function useAiParser() {
  return useMutation({
    mutationFn: async ({ text, url, file }) => {
      // Echter Datei-Upload via FormData anstelle von JSON
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (url) formData.append('url', url);
      if (file) formData.append('pdf_file', file);

      const res = await fetch(`${BACKEND_URL}/api/ai-analysis`, {
        method: 'POST',
        // WICHTIG: KEIN 'Content-Type': 'application/json' hier! 
        // Der Browser setzt automatisch 'multipart/form-data' und die richtige Dateigrenze.
        body: formData
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Fehler bei der KI-Analyse (Server-Timeout oder Fehler)');
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
