const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://valuon-estate-backend.onrender.com';

/**
 * Prüft die Erreichbarkeit des Backends
 */
export const pingBackendApi = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/`);
    return res.ok;
  } catch (err) {
    return false;
  }
};

/**
 * Führt die Investitionsberechnung über das Backend aus
 */
export const calculateInvestmentApi = async (formData, capexList) => {
  const payload = {
    ...formData,
    grwt_proz: (formData.grwt_p || 0) / 100,
    notar_proz: (formData.notar_p || 0) / 100,
    makler_proz: (formData.makler_p || 0) / 100,
    hb_zins: (formData.hb_zins || 0) / 100,
    hb_tilg: (formData.hb_tilg || 0) / 100,
    sondertilg: Number(formData.sondertilg || 0),
    grace_years: Number(formData.grace_years || 0),
    zinsbindung: Number(formData.zinsbindung || 10),
    folge_zins: (formData.folge_zins || 0) / 100,
    folge_tilg: (formData.folge_tilg || 0) / 100,
    kfw_amt: Number(formData.kfw_amt || 0),
    kfw_zins: (formData.kfw_zins || 0) / 100,
    kfw_tilg: (formData.kfw_tilg || 0) / 100,
    kfw_grace_years: Number(formData.kfw_grace_years || 0),
    kfw_grant: Number(formData.kfw_grant || 0),
    vac_rate: (formData.vac_rate_pct || 0) / 100,
    tax_rate: (formData.tax_rate_pct || 0) / 100,
    miet_inc: (formData.miet_inc || 0) / 100,
    miet_inc_start_year: Number(formData.miet_inc_start_year || 1),
    cost_inc: (formData.cost_inc || 0) / 100,
    val_inc: (formData.val_inc || 0) / 100,
    exit_cost: (formData.exit_cost || 0) / 100,
    afa_lin: (formData.afa_lin || 0) / 100,
    capex_list: (capexList || []).map((item) => ({
      jahr: Number(item.year),
      year: Number(item.year),
      betrag: Number(item.amount),
      amount: Number(item.amount)
    }))
  };

  const res = await fetch(`${BACKEND_URL}/api/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server meldet Status ${res.status}`);
  }

  const data = await res.json();
  if (!data || !data.summary) {
    throw new Error('Das Backend hat keine vollständige Auswertung geliefert.');
  }

  return data;
};

/**
 * Lädt gespeicherte Objekte aus der Datenbank (optional gefiltert nach userEmail und statusFilter)
 */
export const fetchPropertiesApi = async (userEmail, statusFilter = null) => {
  const res = await fetch(`${BACKEND_URL}/api/properties`);
  if (!res.ok) {
    throw new Error(`Fehler beim Laden der Datenbank (Status ${res.status})`);
  }
  const data = await res.json();
  let rawList = data.properties || data || [];
  
  if (userEmail) {
    rawList = rawList.filter((item) => !item.user_email || item.user_email === userEmail);
  }

  if (statusFilter) {
    rawList = rawList.filter((item) => (item.status || 'pipeline') === statusFilter);
  }

  return rawList;
};

/**
 * Speichert ein berechnetes Objekt in der Datenbank (inkl. status: 'pipeline' oder 'bestand')
 */
export const savePropertyApi = async (formData, capexList, result, userEmail, status = 'pipeline') => {
  const payload = {
    name: formData.obj_name || 'Unbenanntes Objekt',
    obj_name: formData.obj_name || 'Unbenanntes Objekt',
    objektart: formData.objektart,
    stadt: formData.stadt,
    stadtteil: formData.stadtteil,
    bundesland: formData.bundesland,
    kaufpreis: Number(formData.kaufpreis),
    qm: Number(formData.qm),
    irr: Number(result?.summary?.irr || 0),
    cashflow_y1: Number(result?.projection?.[0]?.['Cashflow Netto'] || 0),
    cashflow_netto_y1: Number(result?.projection?.[0]?.['Cashflow Netto'] || 0),
    user_email: userEmail,
    status: status || 'pipeline',
    form_data: formData,
    capex_list: capexList,
    created_at: new Date().toISOString()
  };

  const res = await fetch(`${BACKEND_URL}/api/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const detailMsg = typeof errorData.detail === 'string'
      ? errorData.detail
      : JSON.stringify(errorData.detail || errorData.message || `Status HTTP ${res.status}`);
    throw new Error(`Fehler beim Speichern: ${detailMsg}`);
  }

  return await res.json();
};

/**
 * Aktualisiert den Status eines Objekts (z. B. Wechsel von 'pipeline' zu 'bestand')
 */
export const updatePropertyStatusApi = async (propertyId, newStatus) => {
  const res = await fetch(`${BACKEND_URL}/api/properties/${propertyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Fehler beim Aktualisieren des Status (Status ${res.status})`);
  }

  return await res.json();
};

/**
 * Löscht ein Objekt anhand seiner ID
 */
export const deletePropertyApi = async (propertyId) => {
  const res = await fetch(`${BACKEND_URL}/api/properties/${propertyId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Fehler beim Löschen des Objekts.');
  }
  return await res.json();
};
