import { formatEuroInt } from './formatters';

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

export function calculateInvestmentModel(formData, projectionHorizon = '10', rawBackendResult = null) {
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const qm = Number(formData?.qm || 0);
  const ekEuro = Number(formData?.ek_euro || 0);
  const baujahr = Number(formData?.baujahr || 2000);

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

  const kaufpreisProQm = qm > 0 ? kaufpreis / qm : 0;
  const gesamtKostenProQm = qm > 0 ? gesamtKosten / qm : 0;

  // 2. FINANZIERUNG
  const gesamtDarlehen = Math.max(0, gesamtKosten - ekEuro);
  const kfwAmt = Number(formData?.kfw_amt || 0);
  const kfwDarlehen = Math.min(gesamtDarlehen, kfwAmt);
  const hauptDarlehen = Math.max(0, gesamtDarlehen - kfwDarlehen);

  const ltv = kaufpreis > 0 ? (gesamtDarlehen / kaufpreis) * 100 : 0;
  const ekQuote = gesamtKosten > 0 ? (ekEuro / gesamtKosten) * 100 : 0;

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

  // 3. STEUER- & AFA-MODELLIERUNG
  const taxRateP = Number(formData?.tax_rate_pct ?? 42) / 100;
  const gebaeudeAnteilP = Number(formData?.gebaeude_anteil_pct ?? 80) / 100;
  const gebaeudeWert = kaufpreis * gebaeudeAnteilP;
  const gebaeudeWertProQm = qm > 0 ? gebaeudeWert / qm : 0;

  const afaModel = formData?.afa_model || 'Linear Standard';
  let afaRateBase = Number(formData?.afa_lin ?? 2.0) / 100;

  const istSonderAfaBerechtigt = gebaeudeWertProQm > 0 && gebaeudeWertProQm <= 5200;
  const sonderAfaBemessungsgrundlage = Math.min(gebaeudeWert, 4000 * qm);
  const sanierungKosten = Number(formData?.sanierung || 0);

  // 4. BEWIRTSCHAFTUNG INITIAL
  const baseIstMo = Number(formData?.kaltmiete_monat || 0);
  const targetMo = Number(formData?.target_monat || baseIstMo);
  const mieteInitialPa = baseIstMo * 12;

  const hausgeldNichtUmlegbarMo = Number(formData?.hausgeld_nicht_umlegbar || 0);
  const mgtMonat = Number(formData?.mgt_monat || 30);
  const instSqmPa = Number(formData?.inst_sqm || 12);
  const vacRateP = Number(formData?.vac_rate_pct || 2.0) / 100;

  const vacInitialPa = mieteInitialPa * vacRateP;
  const opexInitialPa = (hausgeldNichtUmlegbarMo + mgtMonat) * 12 + (instSqmPa * qm) + vacInitialPa;
  const noiInitialPa = mieteInitialPa - opexInitialPa;

  const kaufpreisfaktor = mieteInitialPa > 0 ? kaufpreis / mieteInitialPa : 0;
  const nettoKaufpreisfaktor = noiInitialPa > 0 ? gesamtKosten / noiInitialPa : 0;
  const bruttoMietrenditeInitial = kaufpreis > 0 ? (mieteInitialPa / kaufpreis) * 100 : 0;
  const nettoMietrenditeInitial = gesamtKosten > 0 ? (noiInitialPa / gesamtKosten) * 100 : 0;

  // 5. JAHRESSCHEIBEN-PROJEKTION (JAHRE 1 BIS 30)
  let horizonYears = 10;
  if (projectionHorizon === '15') horizonYears = 15;
  else if (projectionHorizon === '20') horizonYears = 20;
  else if (projectionHorizon === '30') horizonYears = 30;
  else if (projectionHorizon === 'payoff') horizonYears = 30;

  const rawArray = rawBackendResult?.jahres_projektion || rawBackendResult?.projection || [];

  let restschuldHaupt = hauptDarlehen;
  let restschuldKfw = kfwDarlehen;
  let initialAnnuitaetHaupt = hauptDarlehen * (hbZinsP + hbTilgP);

  let cumCashflowVorSteuer = -ekEuro;
  let cumCashflowNachSteuer = -ekEuro;
  let currentGebaeudeBuchwert = gebaeudeWert;

  const projection = [];

  for (let year = 1; year <= 30; year++) {
    const rawRow = rawArray[year - 1] || {};

    const mietIncP = Number(formData?.miet_inc ?? 1.0) / 100;
    const adjYear = Number(formData?.adj_year || 1);
    let baseMieteMo = year >= adjYear ? targetMo : baseIstMo;
    let mietePa = baseMieteMo * 12 * Math.pow(1 + mietIncP, Math.max(0, year - 1));

    if (rawRow['Kaltmiete p.a.'] || rawRow.kaltmiete_pa || rawRow.miete_pa) {
      mietePa = Number(rawRow['Kaltmiete p.a.'] ?? rawRow.kaltmiete_pa ?? rawRow.miete_pa);
    }

    const vacPa = mietePa * vacRateP;
    const opexPa = (hausgeldNichtUmlegbarMo + mgtMonat) * 12 + (instSqmPa * qm) + vacPa;
    const noiPa = mietePa - opexPa;

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

    let zinsKfw = restschuldKfw * kfwZinsP;
    let tilgKfw = year <= kfwGraceYears ? 0 : Math.min(restschuldKfw, kfwDarlehen * kfwTilgP);

    const zinsTotal = zinsHaupt + zinsKfw;
    const tilgTotal = tilgHaupt + tilgKfw;
    const kapitaldienstPa = zinsTotal + tilgTotal;

    restschuldHaupt = Math.max(0, restschuldHaupt - tilgHaupt);
    restschuldKfw = Math.max(0, restschuldKfw - tilgKfw);
    const restschuldEnd = restschuldHaupt + restschuldKfw;

    const capexList = formData?.capexList || [];
    let capexYear = 0;
    capexList.forEach(item => {
      if (Number(item.year || item.jahr) === year) capexYear += Number(item.amount || item.betrag || 0);
    });
    if (year === 1) capexYear += sanierungKosten;

    // DYNAMISCHE AFA BERECHNUNG
    let afaEuro = 0;

    if (afaModel === 'Linear Neubau') {
      afaEuro = gebaeudeWert * 0.03;
    } else if (afaModel === 'Degressiv') {
      afaEuro = currentGebaeudeBuchwert * 0.05;
      currentGebaeudeBuchwert = Math.max(0, currentGebaeudeBuchwert - afaEuro);
    } else if (afaModel === 'Kombination: Degressiv + Sonder-AfA') {
      const degressivEuro = currentGebaeudeBuchwert * 0.05;
      let sonderAfaEuro = 0;
      if (year <= 4 && istSonderAfaBerechtigt) {
        sonderAfaEuro = sonderAfaBemessungsgrundlage * 0.05;
      }
      afaEuro = degressivEuro + sonderAfaEuro;
      currentGebaeudeBuchwert = Math.max(0, currentGebaeudeBuchwert - afaEuro);
    } else if (afaModel === 'Denkmalgeschützt') {
      // ALTBESTAND: LINEARE STANDARD-AFA (2,0 % P.A.)
      const altbestandAfa = gebaeudeWert * 0.02;
      
      // SANIERUNGSAUFWAND: 9,0 % (JAHRE 1-8), 7,0 % (JAHRE 9-12) (§ 7h / § 7i EStG)
      let denkmalAfa = 0;
      if (year <= 8) {
        denkmalAfa = sanierungKosten * 0.09;
      } else if (year <= 12) {
        denkmalAfa = sanierungKosten * 0.07;
      }

      afaEuro = altbestandAfa + denkmalAfa;
    } else {
      afaEuro = gebaeudeWert * afaRateBase;
    }

    const zuVersteuerndesEinkommen = noiPa - zinsTotal - afaEuro;
    const steuerErgebnis = zuVersteuerndesEinkommen * taxRateP;

    const cashflowVorSteuerPa = mietePa - opexPa - kapitaldienstPa - capexYear;
    const cashflowNachSteuerPa = cashflowVorSteuerPa - steuerErgebnis;

    const valIncP = Number(formData?.val_inc ?? 1.0) / 100;
    const immobilienwert = kaufpreis * Math.pow(1 + valIncP, year);
    const netEquity = Math.max(0, immobilienwert - restschuldEnd);

    cumCashflowVorSteuer += cashflowVorSteuerPa;
    cumCashflowNachSteuer += cashflowNachSteuerPa;

    const totalReturnVorSteuer = cumCashflowVorSteuer + netEquity;
    const totalReturnNachSteuer = cumCashflowNachSteuer + netEquity;

    const dscr = kapitaldienstPa > 0 ? noiPa / kapitaldienstPa : 0;

    projection.push({
      jahr: year,
      jahrLabel: `${year}`,
      immobilienwert,
      restschuld: restschuldEnd,
      netEquity,
      miete: mietePa,
      opex: opexPa,
      noi: noiPa,
      zins: zinsTotal,
      tilgung: tilgTotal,
      kapitaldienst: kapitaldienstPa,
      capex: capexYear,
      afaEuro,
      zuVersteuerndesEinkommen,
      steuerErgebnis,
      cashflowVorSteuer: cashflowVorSteuerPa,
      cashflowVorSteuerMo: cashflowVorSteuerPa / 12,
      cashflowNachSteuer: cashflowNachSteuerPa,
      cashflowNachSteuerMo: cashflowNachSteuerPa / 12,
      cumCashflowVorSteuer,
      cumCashflowNachSteuer,
      totalReturnVorSteuer,
      totalReturnNachSteuer,
      dscr
    });
  }

  const slicedProjection = projection.slice(0, horizonYears);

  const totalNetCashflowNachSteuer = slicedProjection.reduce((sum, r) => sum + r.cashflowNachSteuer, 0);
  const avgMonthlyCashflow = totalNetCashflowNachSteuer / (horizonYears * 12);

  const totalRent = slicedProjection.reduce((sum, r) => sum + r.miete, 0);
  const avgRentPerYear = totalRent / horizonYears;
  const avgBruttoRendite = kaufpreis > 0 ? (avgRentPerYear / kaufpreis) * 100 : 0;

  const lastRow = slicedProjection[slicedProjection.length - 1] || {};
  const exitPropertyValue = lastRow.immobilienwert || (kaufpreis * Math.pow(1 + (Number(formData?.val_inc || 1) / 100), horizonYears));
  const exitRestschuld = lastRow.restschuld || 0;
  const exitCosts = exitPropertyValue * (Number(formData?.exit_cost || 0) / 100);
  const netExitProceeds = exitPropertyValue - exitCosts - exitRestschuld;

  const cashflowsForIRR = [-ekEuro];
  slicedProjection.forEach((r, idx) => {
    if (idx === slicedProjection.length - 1) {
      cashflowsForIRR.push(r.cashflowNachSteuer + netExitProceeds);
    } else {
      cashflowsForIRR.push(r.cashflowNachSteuer);
    }
  });

  const irrRate = ekEuro > 0 ? calculateIRR(cashflowsForIRR) * 100 : 0;
  const validIrr = isNaN(irrRate) || !isFinite(irrRate) ? 0 : irrRate;

  const gesamtGewinn = totalNetCashflowNachSteuer + (netExitProceeds - ekEuro);

  const year1Row = slicedProjection[0] || {};
  const cashOnCashReturn = ekEuro > 0 ? (year1Row.cashflowNachSteuer / ekEuro) * 100 : 0;

  const criticalMietePa = year1Row.opex + year1Row.kapitaldienst + year1Row.steuerErgebnis;
  const breakEvenMieteMo = criticalMietePa / 12;
  const breakEvenMieteSqmMo = qm > 0 ? breakEvenMieteMo / qm : 0;

  return {
    stammDaten: {
      kaufpreis,
      qm,
      baujahr,
      kaufpreisProQm,
      gesamtKostenProQm
    },
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
      ekEuro,
      ltv,
      ekQuote
    },
    kpis: {
      avgMonthlyCashflow,
      isCfPositive: avgMonthlyCashflow >= 0,
      avgBruttoRendite,
      validIrr,
      gesamtGewinn,
      horizonYears,
      kaufpreisfaktor,
      nettoKaufpreisfaktor,
      bruttoMietrenditeInitial,
      nettoMietrenditeInitial,
      cashOnCashReturn,
      dscrInitial: year1Row.dscr || 0,
      breakEvenMieteMo,
      breakEvenMieteSqmMo
    },
    projection,
    slicedProjection
  };
}
