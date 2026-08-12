'use client';
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// Mittelauflösende GeoJSON der deutschen Landkreise/Städte
const GEO_URL = "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/4_kreise/3_mittel.geo.json";

// Unsere Dummy-Datenbank für den ersten Test
const DUMMY_METRICS = {
  "Oldenburg (Oldenburg)": { 
    kaufpreis_neubau: 4200, 
    trend: "+2.1%", 
    color: "#059669" // Kräftiges Valuon-Grün für hohe Preise
  },
  "Diepholz": { 
    kaufpreis_neubau: 3100, 
    trend: "+1.4%", 
    color: "#34d399" // Helleres Grün
  }
};

export default function LocationAtlas() {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  return (
    <div className="max-w-[1000px] mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-valuon-border shadow-sm flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-valuon-border pb-5">
        <h2 className="m-0 text-2xl font-black text-valuon-green tracking-tight">Standort Atlas</h2>
        <span className="text-sm font-medium text-slate-500 block">
          Interaktive Makro-Analyse der regionalen Immobilienmärkte.
        </span>
      </div>

      {/* Karten-Container */}
      <div className="relative w-full h-[600px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        
        {/* Schwebendes Info-Dashboard (wird später erweitert) */}
        {hoveredRegion && (
          <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 z-10 min-w-[220px] pointer-events-none">
            <h3 className="text-sm font-black text-slate-800 m-0 mb-2 border-b border-slate-100 pb-2">
              {hoveredRegion.name}
            </h3>
            {hoveredRegion.data ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Ø Neubau:</span>
                  <span className="text-slate-800 font-bold">{hoveredRegion.data.kaufpreis_neubau} €/m²</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Trend:</span>
                  <span className="text-valuon-green font-bold">{hoveredRegion.data.trend}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium m-0">Keine Daten verfügbar</p>
            )}
          </div>
        )}

        {/* Die interaktive Karte */}
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 3500, // Zoom-Faktor für Deutschland
            center: [10.4515, 51.1657] // Geografischer Mittelpunkt
          }}
          width={800}
          height={600}
          className="w-full h-full outline-none"
        >
          {/* Zoom & Pan (Schieben) aktivieren */}
          <ZoomableGroup zoom={1} minZoom={1} maxZoom={6}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  // Der Name des Landkreises versteckt sich in den Properties der GeoJSON
                  const regionName = geo.properties.NAME_3 || geo.properties.name || "Unbekannt";
                  const regionData = DUMMY_METRICS[regionName];
                  
                  // Standardfarbe ist Grau, wenn wir Daten haben, nehmen wir die definierte Farbe
                  const defaultFill = regionData ? regionData.color : "#e2e8f0";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        setHoveredRegion({ name: regionName, data: regionData });
                      }}
                      onMouseLeave={() => {
                        setHoveredRegion(null);
                      }}
                      onClick={() => {
                        console.log("Klick auf Region:", regionName);
                        // Hier öffnen wir später die Sidebar
                      }}
                      style={{
                        default: {
                          fill: defaultFill,
                          stroke: "#ffffff",
                          strokeWidth: 0.5,
                          outline: "none",
                          transition: "fill 0.2s ease"
                        },
                        hover: {
                          fill: "#10b981", // Valuon Hover-Grün
                          stroke: "#ffffff",
                          strokeWidth: 1.5,
                          outline: "none",
                          cursor: "pointer"
                        },
                        pressed: {
                          fill: "#047857",
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}
