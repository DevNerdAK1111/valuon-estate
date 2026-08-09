import { formatEuroInt } from './formatters';

// HELPER FÜR FORMULAR-VALIDIERUNG (§ 7b EStG SONDER-AFA)
export function checkSonderAfaEligibility(formData) {
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const qm = Number(formData?.qm || 0);
  const gebaeudeAnteilP = Number(formData?.gebaeude_anteil_pct ?? 80) / 100;
  const gebaeudeWert = kaufpreis * gebaeudeAnteilP;
  const gebaeudeWertProQm = qm > 0 ? gebaeudeWert / qm : 0;
  const isExceeded = gebaeudeWertProQm > 5200;

  return {
    gebaeudeWert,
    gebaeudeWertProQm,
    isExceeded
  };
}

// ZENTRALER ADAPTER FÜR DAS BACKEND-ERGEBNIS (SINGLE SOURCE OF TRUTH)
export function calculateInvestmentModel(formData, projectionHorizon = '10', rawBackendResult = null) {
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const qm = Number(formData?.qm || 0);
  const ekEuro = Number(formData?.ek_euro || 0);
  const baujahr = Number(formData?.baujahr || 2000);

  // INITIALER ZUSTAND (SOLANGE NOCH KEINE BACKEND-ANTWORT DA IST)
  if (!rawBackendResult) {
    const grwtP = Number(formData?.grwt_p ?? 5.0);
    const notarP = Number(formData?.notar_p ?? 2.0);
    const maklerP = Number(formData?.makler_p ?? 3.57);
    const sonstNk = Number(formData?.sonst_nk ?? 0);

    const grwtEuro = kaufpreis * (grwtP / 100);
    const notarEuro = kaufpreis * (notarP / 100);
    const maklerEuro = kaufpreis * (maklerP / 100);
    const nkTotal = grwtEuro + notarEuro + maklerEuro + sonstNk;
    const gesamtKosten = kaufpreis + nkTotal;

    const gesamtDarlehen = Math.max(0, gesamtKosten - ekEuro);
    const kfwAmt = Number(formData?.kfw_amt || 0);
    const kfwDarlehen = Math.min(gesamtDarlehen, kfwAmt);
    const hauptDarlehen = Math.max(0, gesamtDarlehen - kfwDarlehen);

    return {
      stammDaten: {
        kaufpreis,
        qm,
        baujahr,
        kaufpreisProQm: qm > 0 ? kaufpreis / qm : 0,
        gesamtKostenProQm: qm > 0 ? gesamtKosten / qm : 0
      },
      kaufnebenkosten: {
        grwtEuro,
        notarEuro,
        maklerEuro,
        sonstNk,
        nkTotal,
        gesamtKosten,
        isEkCoveringNk: Math.round(ekEuro) >= Math.round(nkTotal)
      },
      finanzierung: {
        gesamtDarlehen,
        hauptDarlehen,
        kfwDarlehen,
        ekEuro,
        ltv: kaufpreis > 0 ? (gesamtDarlehen / kaufpreis) * 100 : 0,
        ekQuote: gesamtKosten > 0 ? (ekEuro / gesamtKosten) * 100 : 0
      },
      kpis: {
        avgMonthlyCashflow: 0,
        isCfPositive: false,
        avgBruttoRendite: 0,
        validIrr: 0,
        gesamtGewinn: 0,
        horizonYears: 10,
        kaufpreisfaktor: 0,
        nettoKaufpreisfaktor: 0,
        bruttoMietrenditeInitial: 0,
        nettoMietrenditeInitial: 0,
        cashOnCashReturn: 0,
        dscrInitial: 0,
        breakEvenMieteMo: 0,
        breakEvenMieteSqmMo: 0
      },
      projection: [],
      slicedProjection: [],
      totals: {
        miete: 0, opex: 0, noi: 0, zins: 0, tilgung: 0, kapitaldienst: 0,
        afaEuro: 0, zuVersteuerndesEinkommen: 0, steuerErgebnis: 0, cashflowNachSteuerPa: 0
      }
    };
  }

  // NORMALIERE DAS BACKEND-ERGEBNIS FÜR DIE FRONTEND-ANSICHT
  const fullProjection = rawBackendResult.projection || [];

  let horizonYears = 10;
  if (projectionHorizon === '15') horizonYears = 15;
  else if (projectionHorizon === '20') horizonYears = 20;
  else if (projectionHorizon === '30') horizonYears = 30;
  else if (projectionHorizon === 'payoff') {
    const payoffIdx = fullProjection.findIndex(r => (r.restschuld || r.Restschuld || 0) <= 0);
    horizonYears = payoffIdx !== -1 ? payoffIdx + 1 : fullProjection.length;
  }

  const slicedProjection = fullProjection.slice(0, horizonYears);

  const totals = slicedProjection.reduce(
    (acc, r) => {
      acc.miete += r.miete || r['Mieteinnahmen IST'] || 0;
      acc.opex += r.opex || r.Bewirtschaftungskosten || 0;
      acc.noi += r.noi || 0;
      acc.zins += r.zins || r.Zinsen || 0;
      acc.tilgung += r.tilgung || r.Tilgung || 0;
      acc.kapitaldienst += r.kapitaldienst || r.Kapitaldienst || 0;
      acc.afaEuro += r.afaEuro || r.AfA || 0;
      acc.zuVersteuerndesEinkommen += r.zuVersteuerndesEinkommen || 0;
      acc.steuerErgebnis += r.steuerErgebnis || r.Steuer || 0;
      acc.cashflowNachSteuerPa += r.cashflowNachSteuer || r['Cashflow Netto'] || 0;
      return acc;
    },
    {
      miete: 0, opex: 0, noi: 0, zins: 0, tilgung: 0, kapitaldienst: 0,
      afaEuro: 0, zuVersteuerndesEinkommen: 0, steuerErgebnis: 0, cashflowNachSteuerPa: 0
    }
  );

  const totalNetCashflow = totals.cashflowNachSteuerPa;
  const avgMonthlyCashflow = totalNetCashflow / (horizonYears * 12);
  const avgBruttoRendite = kaufpreis > 0 ? (totals.miete / horizonYears / kaufpreis) * 100 : 0;

  const lastRow = slicedProjection[slicedProjection.length - 1] || {};
  const exitPropertyValue = lastRow.immobilienwert || lastRow.Immobilienwert || kaufpreis;
  const exitRestschuld = lastRow.restschuld || lastRow.Restschuld || 0;
  const exitCosts = exitPropertyValue * (Number(formData?.exit_cost || 0) / 100);
  const netExitProceeds = exitPropertyValue - exitCosts - exitRestschuld;

  const gesamtGewinn = totalNetCashflow + (netExitProceeds - ekEuro);

  const backendKpis = rawBackendResult.kpis || {};
  const backendStamm = rawBackendResult.stammDaten || {};
  const backendNk = rawBackendResult.kaufnebenkosten || {};
  const backendFin = rawBackendResult.finanzierung || {};

  return {
    stammDaten: {
      kaufpreis: backendStamm.kaufpreis ?? kaufpreis,
      qm: backendStamm.qm ?? qm,
      baujahr: backendStamm.baujahr ?? baujahr,
      kaufpreisProQm: backendStamm.kaufpreisProQm ?? (qm > 0 ? kaufpreis / qm : 0),
      gesamtKostenProQm: backendStamm.gesamtKostenProQm ?? 0
    },
    kaufnebenkosten: {
      grwtEuro: backendNk.grwtEuro ?? 0,
      notarEuro: backendNk.notarEuro ?? 0,
      maklerEuro: backendNk.maklerEuro ?? 0,
      sonstNk: backendNk.sonstNk ?? 0,
      nkTotal: backendNk.nkTotal ?? 0,
      gesamtKosten: backendNk.gesamtKosten ?? kaufpreis,
      isEkCoveringNk: backendNk.isEkCoveringNk ?? (Math.round(ekEuro) >= Math.round(backendNk.nkTotal || 0))
    },
    finanzierung: {
      gesamtDarlehen: backendFin.gesamtDarlehen ?? 0,
      hauptDarlehen: backendFin.hauptDarlehen ?? 0,
      kfwDarlehen: backendFin.kfwDarlehen ?? 0,
      ekEuro: backendFin.ekEuro ?? ekEuro,
      ltv: backendFin.ltv ?? 0,
      ekQuote: backendFin.ekQuote ?? 0
    },
    kpis: {
      avgMonthlyCashflow,
      isCfPositive: avgMonthlyCashflow >= 0,
      avgBruttoRendite,
      validIrr: Number(backendKpis.validIrr ?? (rawBackendResult.summary?.irr ? rawBackendResult.summary.irr * 100 : 0)),
      gesamtGewinn,
      horizonYears,
      kaufpreisfaktor: backendKpis.kaufpreisfaktor ?? 0,
      nettoKaufpreisfaktor: backendKpis.nettoKaufpreisfaktor ?? 0,
      bruttoMietrenditeInitial: backendKpis.bruttoMietrenditeInitial ?? 0,
      nettoMietrenditeInitial: backendKpis.nettoMietrenditeInitial ?? 0,
      cashOnCashReturn: backendKpis.cashOnCashReturn ?? 0,
      dscrInitial: backendKpis.dscrInitial ?? 0,
      breakEvenMieteMo: backendKpis.breakEvenMieteMo ?? 0,
      breakEvenMieteSqmMo: backendKpis.breakEvenMieteSqmMo ?? 0
    },
    projection: fullProjection,
    slicedProjection,
    totals
  };
}
