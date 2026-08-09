import { useState, useCallback } from 'react';
import { fetchPropertiesApi, deletePropertyApi } from '../lib/propertyApi';

export function usePropertiesManager(userEmail) {
  const [dbProperties, setDbProperties] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);

  const fetchDatabaseProperties = useCallback(async () => {
    setLoadingDb(true);
    try {
      const userList = await fetchPropertiesApi(userEmail);
      setDbProperties(userList);
    } catch (err) {
      console.error('Fehler beim Laden der Datenbank:', err);
    } finally {
      setLoadingDb(false);
    }
  }, [userEmail]);

  const deletePropertyFromDb = async (id) => {
    if (!confirm('Möchtest du dieses Objekt wirklich aus deiner Datenbank löschen?')) return;
    try {
      await deletePropertyApi(id);
      await fetchDatabaseProperties();
    } catch (err) {
      alert('Fehler beim Löschen des Objekts.');
    }
  };

  return {
    dbProperties,
    loadingDb,
    fetchDatabaseProperties,
    deletePropertyFromDb
  };
}
