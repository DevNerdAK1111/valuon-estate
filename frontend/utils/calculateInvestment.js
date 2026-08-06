import { formatEuroInt } from './formatters';

// NEWTON-RAPHSON MODELL FÜR PRÄZISE EK-RENDITE (IRR)
export function calculateIRR(cfs, guess = 0.1) {
  const maxIter = 100;
  const precision = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cfs.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cfs[t] / denom;
      dnpv -= (t * cfs[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < precision) return rate;
    if (Math.abs(dnpv) < precision) break;
    const newRate = rate - npv / dnpv;
    if (isNaN(newRate) || !isFinite(newRate)) break;
    rate = newRate;
  }
  return rate;
}

// ZENTRALE INVESTITIONS-BERECHNUNG (SINGLE SOURCE OF TRUTH)
export function calculateInvestmentModel(formData, projectionHorizon = '10', rawBackendResult = null) {
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const qm = Number(formData?.qm || 0);
  const ekEuro = Number(formData?.ek_euro || 0);

  // 1. KAUFNEBENKOSTEN
  const grwtP = Number(formData?.grwt_p ?? 5.0);
  const notarP = Number(formData?.notar_p ?? 2.0);
  const maklerP = Number(formData?.makler_p ?? 3.57);
  const sonstNk = Number(formData?.sonst_nk ?? 0);

  const grwtEuro = kaufpreis * (grwtP / 100);
  const notarEuro = kaufpreis * (notarP / 100);
  const maklerEuro = kaufpreis * (maklerP / 100);
  const nkTotal = grwtEuro + notarEuro + maklerEuro + sonstNk;
  const gesamtKosten = kaufpreis + nkTotal;
  const isEkCoveringNk = Math.round(ekEuro) >= Math.round(nkTotal);

  // 2. DARLEHEN & FINANZIERUNG
  const gesamtDarlehen = Math.max(0, gesamtKosten - ekEuro);
  const kfwAmt = Number(formData?.kfw_amt || 0);
  const kfwDarlehen = Math.min(gesamtDarlehen, kfwAmt);
  const hauptDarlehen = Math.max(0, gesamtDarlehen - kfwDarlehen);

  const hbZinsP = Number(formData?.hb_zins ?? 3.8) / 100;
  const hbTilgP = Number(formData?.hb_tilg ?? 2.0) / 100;
  const graceYears = Number(formData?.grace_years || 0);
  const zinsbindung = Number(formData?.zinsbindung || 10);
  const sondertilg = Number(formData?.sondertilg || 0);

  const folgeZinsP = Number(formData?.folge_zins ?? 3.8) / 100;
  const folgeMode = formData?.folge_mode || 'Rate konstant halten (Annuität)';
  const folgeTilgP = Number(formData?.folge_tilg ?? 2.0) / 100;

  const kfwZinsP = Number(formData?.kfw_zins ?? 2.1) / 100;
  const kfwTilgP = Number(formData?.kfw_tilg ?? 3.0) / 100;
  const kfwGraceYears = Number(formData?.kfw_grace_years || 0);

  // BETRACHTUNGSHORIZONT IN JAHREN
  let horizonYears = 10;
  if (projectionHorizon === '15') horizonYears = 15;
  else if (projectionHorizon === '20') horizonYears = 20;
  else if (projectionHorizon === '30') horizonYears = 30;
  else if (projectionHorizon === 'payoff') horizonYears = 30;

  const rawArray = rawBackendResult?.jahres_projektion || rawBackendResult?.projection || [];

  // 3. JAHRESSCHEIBEN-PROJEKTION (JAHRE 1 BIS 30)
  let restschuldHaupt = hauptDarlehen;
  let restschuldKfw = kfwDarlehen;
  let initialAnnuitaetHaupt = hauptDarlehen * (hbZinsP + hbTilgP);
  let cumCashflow = -ekEuro;

  const projection = [];

  for (let year = 1; year <= 30; year++) {
    const rawRow = rawArray[year - 1] || {};

    // Miete p.a.
    const mietIncP = Number(formData?.miet_inc ?? 1.0) / 100;
    const baseIstMo = Number(formData?.kaltmiete_monat || 0);
    const targetMo = Number(formData?.target_monat || baseIstMo);
    const adjYear = Number(formData?.adj_year || 1);

    let baseMieteMo = year >= adjYear ? targetMo : baseIstMo;
    let mietePa = baseMieteMo * 12 * Math.pow(1 + mietIncP, Math.max(0, year - 1));

    if (rawRow['Kaltmiete p.a.'] || rawRow.kaltmiete_pa || rawRow.miete_pa) {
      mietePa = Number(rawRow['Kaltmiete p.a.'] ?? rawRow.kaltmiete_pa ?? rawRow.miete_pa);
    }

    // OpEx p.a.
    const hausgeldNichtUmlegbar = Number(formData?.hausgeld_nicht_umlegbar || 0);
    const mgtMonat = Number(formData?.mgt_monat || 30);
    const instSqm = Number(formData?.inst_sqm || 12);
    const vacRateP = Number(formData?.vac_rate_pct || 2.0) / 100;

    const vacPa = mietePa * vacRateP;
    const opexPa = (hausgeldNichtUmlegbar + mgtMonat) * 12 + (instSqm * qm) + vacPa;

    // Hauptdarlehen Zins & Tilgung
    let currentZinsP = year <= zinsbindung ? hbZinsP : folgeZinsP;
    let zinsHaupt = restschuldHaupt * currentZinsP;
    let tilgHaupt = 0;

    if (year <= graceYears) {
      tilgHaupt = 0;
    } else if (year <= zinsbindung) {
      tilgHaupt = Math.max(0, initialAnnuitaetHaupt - zinsHaupt) + sondertilg;
    } else {
      if (folgeMode === 'Rate konstant halten (Annuität)') {
        tilgHaupt = Math.max(0, initialAnnuitaetHaupt - zinsHaupt) + sondertilg;
      } else {
        tilgHaupt = (restschuldHaupt * folgeTilgP) + sondertilg;
      }
    }
    tilgHaupt = Math.min(restschuldHaupt, tilgHaupt);

    // KfW Zins & Tilgung
    let zinsKfw = restschuldKfw * kfwZinsP;
    let tilgKfw = year <= kfwGraceYears ? 0 : Math.min(restschuldKfw, kfwDarlehen * kfwTilgP);

    // Zins & Tilgung Summe
    const zinsTotal = zinsHaupt + zinsKfw;
    const tilgTotal = tilgHaupt + tilgKfw;
    const kapitaldienstPa = zinsTotal + tilgTotal;

    restschuldHaupt = Math.max(0, restschuldHaupt - tilgHaupt);
    restschuldKfw = Math.max(0, restschuldKfw - tilgKfw);
    const restschuldEnd = restschuldHaupt + restschuldKfw;

    // CapEx
    const capexList = formData?.capexList || [];
    let capexYear = 0;
    capexList.forEach(item => {
      if (Number(item.year || item.jahr) === year) {
        capexYear += Number(item.amount || item.betrag || 0);
      }
    });
    if (year === 1) capexYear += Number(formData?.sanierung || 0);

    // Netto-Cashflow
    let cashflowNettoPa = mietePa - opexPa - kapitaldienstPa - capexYear;
    if (rawRow['Cashflow Netto'] !== undefined || rawRow.cashflow_netto !== undefined) {
      cashflowNettoPa = Number(rawRow['Cashflow Netto'] ?? rawRow.cashflow_netto);
    }
    const cashflowNettoMo = cashflowNettoPa / 12;

    // Immobilienwert & NAV
    const valIncP = Number(formData?.val_inc ?? 1.0) / 100;
    const immobilienwert = kaufpreis * Math.pow(1 + valIncP, year);
    const netEquity = Math.max(0, immobilienwert - restschuldEnd);

    cumCashflow += cashflowNettoPa;
    const totalReturn = cumCashflow + netEquity;

    projection.push({
      jahr: year,
      jahrLabel: `${year}`,
      immobilienwert,
      restschuld: restschuldEnd,
      netEquity,
      miete: mietePa,
      zins: zinsTotal,
      tilgung: tilgTotal,
      kapitaldienst: kapitaldienstPa,
      opex: opexPa,
      capex: capexYear,
      nettoCashflow: cashflowNettoPa,
      nettoCashflowMo: cashflowNettoMo,
      cumCashflow,
      totalReturn
    });
  }

  // SLICED GESAMTEN HORIZONT
  const slicedProjection = projection.slice(0, horizonYears);

  // 4. METRIKEN & KPIS FÜR DEN HORIZONT
  const totalNetCashflow = slicedProjection.reduce((sum, r) => sum + r.nettoCashflow, 0);
  const avgMonthlyCashflow = totalNetCashflow / (horizonYears * 12);

  const totalRent = slicedProjection.reduce((sum, r) => sum + r.miete, 0);
  const avgRentPerYear = totalRent / horizonYears;
  const avgBruttoRendite = kaufpreis > 0 ? (avgRentPerYear / kaufpreis) * 100 : 0;

  // IRR BEI EXIT NACH N JAHREN
  const lastRow = slicedProjection[slicedProjection.length - 1] || {};
  const exitPropertyValue = lastRow.immobilienwert || (kaufpreis * Math.pow(1 + (Number(formData?.val_inc || 1) / 100), horizonYears));
  const exitRestschuld = lastRow.restschuld || 0;
  const exitCosts = exitPropertyValue * (Number(formData?.exit_cost || 0) / 100);
  const netExitProceeds = exitPropertyValue - exitCosts - exitRestschuld;

  const cashflowsForIRR = [-ekEuro];
  slicedProjection.forEach((r, idx) => {
    if (idx === slicedProjection.length - 1) {
      cashflowsForIRR.push(r.nettoCashflow + netExitProceeds);
    } else {
      cashflowsForIRR.push(r.nettoCashflow);
    }
  });

  const irrRate = ekEuro > 0 ? calculateIRR(cashflowsForIRR) * 100 : 0;
  const validIrr = isNaN(irrRate) || !isFinite(irrRate) ? 0 : irrRate;

  const gesamtGewinn = totalNetCashflow + (netExitProceeds - ekEuro);

  return {
    kaufnebenkosten: {
      grwtEuro,
      notarEuro,
      maklerEuro,
      sonstNk,
      nkTotal,
      gesamtKosten,
      isEkCoveringNk
    },
    finanzierung: {
      gesamtDarlehen,
      hauptDarlehen,
      kfwDarlehen,
      ekEuro
    },
    kpis: {
      avgMonthlyCashflow,
      isCfPositive: avgMonthlyCashflow >= 0,
      avgBruttoRendite,
      validIrr,
      gesamtGewinn,
      horizonYears
    },
    projection,
    slicedProjection
  };
}
