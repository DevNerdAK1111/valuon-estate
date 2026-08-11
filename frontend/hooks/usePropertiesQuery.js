import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPropertiesApi, savePropertyApi, updatePropertyStatusApi, deletePropertyApi, calculateInvestmentApi } from '../lib/propertyApi';
import toast from 'react-hot-toast';

export function useProperties(userEmail) {
  return useQuery({
    queryKey: ['properties', userEmail],
    queryFn: () => fetchPropertiesApi(userEmail),
    enabled: !!userEmail,
  });
}

export function useSaveProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ formData, capexList, calcResult, userEmail, statusTarget }) => 
      savePropertyApi(formData, capexList, calcResult, userEmail, statusTarget),
    onSuccess: (data, variables) => {
      toast.success(`Objekt erfolgreich in ${variables.statusTarget === 'bestand' ? 'Bestand' : 'Pipeline'} gespeichert!`);
      queryClient.invalidateQueries({ queryKey: ['properties', variables.userEmail] });
    },
    onError: (err) => {
      toast.error(`Fehler beim Speichern: ${err.message}`);
    }
  });
}

export function useUpdatePropertyStatus(userEmail) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ propertyId, newStatus }) => updatePropertyStatusApi(propertyId, newStatus),
    onSuccess: () => {
      toast.success('Objekt-Status erfolgreich aktualisiert!');
      queryClient.invalidateQueries({ queryKey: ['properties', userEmail] });
    },
    onError: (err) => {
      toast.error(`Fehler beim Aktualisieren: ${err.message}`);
    }
  });
}

export function useDeleteProperty(userEmail) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (propertyId) => deletePropertyApi(propertyId),
    onSuccess: () => {
      toast.success('Objekt erfolgreich gelöscht!');
      queryClient.invalidateQueries({ queryKey: ['properties', userEmail] });
    },
    onError: (err) => {
      toast.error(`Fehler beim Löschen: ${err.message}`);
    }
  });
}

export function useCalculateInvestment() {
  return useMutation({
    mutationFn: ({ formData, capexList }) => calculateInvestmentApi(formData, capexList),
    onSuccess: () => {
      toast.success('Kalkulation erfolgreich abgeschlossen!');
    },
    onError: (err) => {
      toast.error(`Fehler bei der Berechnung: ${err.message}`);
    }
  });
}
