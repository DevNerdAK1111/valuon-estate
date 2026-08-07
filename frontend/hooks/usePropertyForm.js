import { useState } from 'react';

export const defaultFormData = {
  obj_name: '', objektart: 'Eigentumswohnung', bundesland: 'Niedersachsen', stadt: '', stadtteil: '',
  kaufpreis: 0.0, qm: 0.0, baujahr: 2000, kaltmiete_monat: 0.0, ist_sqm: 0.0, target_monat: 0.0, target_sqm: 0.0,
  adj_year: 1, hausgeld: 0.0, hausgeld_nicht_umlegbar: 0.0, sanierung: 0.0, inst_sqm: 12.0, mgt_monat: 30.0,
  vac_rate_pct: 2.0, grwt_p: 5.0, notar_p: 2.0, makler_p: 3.57, sonst_nk: 0.0, loan_type: 'Annuitätendarlehen',
  hb_zins: 3.8, hb_tilg: 2.0, sondertilg: 0.0, grace_years: 0, ek_euro: 0.0, zinsbindung: 10, folge_zins: 3.8,
  folge_mode: 'Rate konstant halten (Annuität)', folge_tilg: 2.0, kfw_amt: 0.0, kfw_zins: 2.1, kfw_tilg: 3.0,
  kfw_grace_years: 0, kfw_grant: 0.0, tax_rate_pct: 42.0, afa_model: 'Linear Standard', afa_lin: 2.0,
  miet_inc: 1.0, miet_inc_start_year: 1, cost_inc: 2.0, val_inc: 1.0, exit_cost: 0.0
};

export function usePropertyForm(initialTaxRate = 42.0) {
  const [formData, setFormData] = useState({
    ...defaultFormData,
    tax_rate_pct: initialTaxRate
  });
  const [capexList, setCapexList] = useState([]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = (overrideTaxRate) => {
    setFormData({
      ...defaultFormData,
      tax_rate_pct: overrideTaxRate !== undefined ? overrideTaxRate : initialTaxRate
    });
    setCapexList([]);
  };

  const addCapexRow = () => {
    setCapexList((prev) => [...prev, { year: prev.length + 1, amount: 0 }]);
  };

  const removeCapexRow = (index) => {
    setCapexList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCapexChange = (index, field, value) => {
    setCapexList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return {
    formData,
    setFormData,
    capexList,
    setCapexList,
    updateField,
    handleReset,
    addCapexRow,
    removeCapexRow,
    handleCapexChange
  };
}
