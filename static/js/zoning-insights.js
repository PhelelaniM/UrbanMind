// Comprehensive zoning insights based on investment analysis framework
const zoningInsights = {
    'agricultural': {
        score: 42,
        thesis: "Low-cost, large parcels at metro edge; value comes from logistics/energy plays or future-corridor optionality, not near-term vertical bulk.",
        upliftDrivers: [
            { factor: "Regional route adjacency (N1/N2/N7) for agro-logistics", impact: "+3-10%" },
            { factor: "Grid/substation proximity for PV/BESS ground-mount", impact: "+3-10%" },
            { factor: "Future densification corridors in MSDF/TOD catchments", impact: "+3-10%" }
        ],
        headwinds: [
            { factor: "BioNet/Critical Biodiversity Area overlaps & riparian buffers", impact: "-5-15%" },
            { factor: "Water rights/irrigation dependency and drought risk", impact: "-5-15%" },
            { factor: "Servitudes (pipelines/HV lines) constraining platforms", impact: "-5-15%" }
        ],
        recommendedDevelopment: "Agri-logistics land bank near N1/N7 nodes, Solar PPA leases with minimal earthworks",
        kpis: ["contiguous_ha", "grid_connect_lead_months", "truck_turn_time_min"],
        scoringDimensions: {
            rights_flexibility: 38,
            accessibility: 45,
            amenity_edge: 30,
            infra_resilience: 55,
            overlay_constraints: 40
        }
    },
    
    'community': {
        score: 59,
        thesis: "Civic anchors create reliable daytime footfall—edge parcels monetize via small convenience retail and affordable rental within safe walksheds.",
        upliftDrivers: [
            { factor: "School/clinic cluster within 400-800m", impact: "+3-9%" },
            { factor: "Taxi/BRT headways and lit pedestrian links", impact: "+3-9%" },
            { factor: "Shared-parking & curb management", impact: "+3-9%" }
        ],
        headwinds: [
            { factor: "Peak curb stress at school hours", impact: "-2-7%" },
            { factor: "Ageing civic stock OPEX (retrofits)", impact: "-2-7%" },
            { factor: "Security perceptions after dark", impact: "-2-7%" }
        ],
        recommendedDevelopment: "Edge-of-campus convenience (≤5,000m² GLA), Energy/water retrofits via ESCO",
        kpis: ["daytime_pop_800m", "GLA_per_1000_residents", "dwell_time_min"],
        scoringDimensions: {
            rights_flexibility: 46,
            accessibility: 70,
            amenity_edge: 65,
            infra_resilience: 58,
            overlay_constraints: 55
        }
    },
    
    'general_business': {
        score: 71,
        thesis: "Highest commercial intensity; value is unlocked by underutilised bulk + TOD adjacency; reposition offices to hybrid retail/flex where vacancies persist.",
        upliftDrivers: [
            { factor: "FAR/height headroom vs. as-built", impact: "+6-15%" },
            { factor: "≤300m to BRT/rail with strong headways", impact: "+6-15%" },
            { factor: "Active ground-floor frontage + curb access", impact: "+6-15%" }
        ],
        headwinds: [
            { factor: "Office oversupply in CBD/peri-CBD nodes", impact: "-4-12%" },
            { factor: "HPOZ heritage controls on façades/massing", impact: "-4-12%" },
            { factor: "Traffic impact mitigation costs", impact: "-4-12%" }
        ],
        recommendedDevelopment: "Retail-active podium + flex/last-mile above, Green-lease retrofits to lift NOI",
        kpis: ["rent_vs_node_benchmark", "capex_per_added_FAR", "post_retrofit_kWh_m2"],
        scoringDimensions: {
            rights_flexibility: 82,
            accessibility: 78,
            amenity_edge: 75,
            infra_resilience: 62,
            overlay_constraints: 58
        }
    },
    
    'general_industrial': {
        score: 62,
        thesis: "Defensive cashflow via warehousing/light-manufacturing; demand spikes near highways and dense townships for last-mile and dark stores.",
        upliftDrivers: [
            { factor: "≤6 min to freeway ramps", impact: "+4-12%" },
            { factor: "Small-bay modernisation (250-1,000 m²)", impact: "+4-12%" },
            { factor: "Rooftop PV + demand management for uptime/OPEX", impact: "+4-12%" }
        ],
        headwinds: [
            { factor: "100-year flood platforms; attenuation CAPEX", impact: "-3-10%" },
            { factor: "Residential interface (noise/traffic complaints)", impact: "-3-10%" },
            { factor: "Hazmat & pipeline servitudes", impact: "-3-10%" }
        ],
        recommendedDevelopment: "Rooftop PV + demand management, Edge-of-township e-commerce micro-hubs",
        kpis: ["vacancy_%_6m", "dock_doors_per_1000m2", "solar_fraction_%"],
        scoringDimensions: {
            rights_flexibility: 72,
            accessibility: 73,
            amenity_edge: 35,
            infra_resilience: 70,
            overlay_constraints: 60
        }
    },
    
    'general_residential': {
        score: 68,
        thesis: "Medium-high density resi that wins on TOD siting + park adjacency; BTR/student/affordable typologies underwrite best with amenity-light OPEX.",
        upliftDrivers: [
            { factor: "≤600m to high-frequency transit (safe, lit paths)", impact: "+5-12%" },
            { factor: "Open-space adjacency (quality OS2 edge)", impact: "+5-12%" },
            { factor: "Inclusionary mix priced into pro-forma", impact: "+5-12%" }
        ],
        headwinds: [
            { factor: "Parking minima off-TOD (feasibility drag)", impact: "-3-8%" },
            { factor: "Unpriced inclusionary obligations (IRR hit)", impact: "-3-8%" },
            { factor: "Noise contours / flight paths near airport", impact: "-3-8%" }
        ],
        recommendedDevelopment: "BTR walk-ups with amenity-light OPEX, Inclusionary mix in IOZ/priority corridors",
        kpis: ["absorption_units_per_month", "du_per_net_ha", "rent_to_income_%"],
        scoringDimensions: {
            rights_flexibility: 74,
            accessibility: 76,
            amenity_edge: 72,
            infra_resilience: 57,
            overlay_constraints: 62
        }
    },
    
    'limited_use': {
        score: 42,
        thesis: "Restrictive/temporary rights—treat as holding/special-purpose with cash-neutral interim activations.",
        upliftDrivers: [
            { factor: "Permissible interim uses (events/markets/charging)", impact: "+1-5%" },
            { factor: "Wayleave-driven micro-infrastructure (small cells/IoT)", impact: "+1-5%" }
        ],
        headwinds: [
            { factor: "Short consent horizons", impact: "-3-8%" },
            { factor: "Tight operations schedules/enforcement risk", impact: "-3-8%" }
        ],
        recommendedDevelopment: "Pop-ups, EV charging, micro-infra wayleaves",
        kpis: ["yield_permitted_use_R_m2", "permit_duration_months"],
        scoringDimensions: {
            rights_flexibility: 28,
            accessibility: 45,
            amenity_edge: 30,
            infra_resilience: 40,
            overlay_constraints: 65
        }
    },
    
    'local_business': {
        score: 63,
        thesis: "Neighbourhood-serving formats thrive on walkability and taxi desire lines; resilience rises in mixed-income catchments.",
        upliftDrivers: [
            { factor: "Taxi stop ≤150m & school flows", impact: "+3-9%" },
            { factor: "Competition gap (GLA undersupply within 1.5km)", impact: "+3-9%" },
            { factor: "Upper-floor medical/co-work conversions", impact: "+3-9%" }
        ],
        headwinds: [
            { factor: "Kerb conflict without managed loading", impact: "-3-7%" },
            { factor: "Security perceptions after dark", impact: "-3-7%" }
        ],
        recommendedDevelopment: "Small-format FMCG anchor + services, Upper-floor medical/co-work conversions",
        kpis: ["sales_density_R_m2", "dwell_time_min", "gla_vacancy_%"],
        scoringDimensions: {
            rights_flexibility: 64,
            accessibility: 72,
            amenity_edge: 66,
            infra_resilience: 55,
            overlay_constraints: 58
        }
    },
    
    'mixed_use': {
        score: 73,
        thesis: "Most flexible rights; value is created by activation and curation, not bulk alone—phase to match absorption.",
        upliftDrivers: [
            { factor: "≥60% active street frontage", impact: "+6-12%" },
            { factor: "Transit adjacency & bike network connectivity", impact: "+6-12%" },
            { factor: "Phased shell-and-core delivery", impact: "+6-12%" }
        ],
        headwinds: [
            { factor: "Mixed-use management complexity (late-trade acoustics)", impact: "-2-6%" },
            { factor: "Heritage frontage controls in HPOZs", impact: "-2-6%" }
        ],
        recommendedDevelopment: "Retail ground + resi/flex above, Night-time economy where acoustics allow",
        kpis: ["blend_to_core_vacancy_%", "lease_up_days", "street_activation_index"],
        scoringDimensions: {
            rights_flexibility: 85,
            accessibility: 80,
            amenity_edge: 78,
            infra_resilience: 60,
            overlay_constraints: 60
        }
    },
    
    'open_space': {
        score: 61,
        thesis: "You don't build bulk on OS; you monetize adjacency—quality, safe, well-lit parks increase absorption and pricing on neighbouring GR/MU/GB parcels.",
        upliftDrivers: [
            { factor: "Quality OS2 frontage (lighting, programming)", impact: "+4-10%" },
            { factor: "Trailheads/amenities that extend dwell", impact: "+4-10%" },
            { factor: "Viewshed (mountain/sea) protection", impact: "+4-10%" }
        ],
        headwinds: [
            { factor: "Degraded/unsafe parks (premium reverses)", impact: "-3-9%" },
            { factor: "Conservation/flood buffers restricting adjacent massing", impact: "-3-9%" }
        ],
        recommendedDevelopment: "Park-facing resi premiums, Micro-concessions (kiosks/trailheads) where permissible",
        kpis: ["adjacency_premium_%", "lease_up_speed_days", "visitor_counts_trend"],
        scoringDimensions: {
            rights_flexibility: 20,
            accessibility: 55,
            amenity_edge: 90,
            infra_resilience: 62,
            overlay_constraints: 78
        }
    },
    
    'single_residential': {
        score: 59,
        thesis: "Small-scale intensification (second dwellings/backyard units) near transit is the quiet compounding play—if services/parking are solved.",
        upliftDrivers: [
            { factor: "TOD-adjacent second dwellings (legal, serviced)", impact: "+3-9%" },
            { factor: "Corner-lot home enterprise where allowed", impact: "+3-9%" },
            { factor: "Park/school walkability", impact: "+3-9%" }
        ],
        headwinds: [
            { factor: "Community pushback (character/parking)", impact: "-2-6%" },
            { factor: "Stormwater/sewer capacity triggers DCs", impact: "-2-6%" }
        ],
        recommendedDevelopment: "Compliant micro-dev (granny flats/duplex) with services, Corner-lot home enterprise (where allowed)",
        kpis: ["dus_per_ha_after_intensification", "approval_cycle_days", "micro_rent_psm"],
        scoringDimensions: {
            rights_flexibility: 52,
            accessibility: 60,
            amenity_edge: 62,
            infra_resilience: 58,
            overlay_constraints: 64
        }
    },
    
    'transport': {
        score: 62,
        thesis: "Rights-of-way & hubs shape curb value—adjacent parcels gain via TOD, kerbside management and over-station concepts (where lawful).",
        upliftDrivers: [
            { factor: "Station-area TOD (≤300m, reliable headways)", impact: "+4-11%" },
            { factor: "Paid loading/ride-hail bays with sensors", impact: "+4-11%" },
            { factor: "Park-and-ride retail pods at interchanges", impact: "+4-11%" }
        ],
        headwinds: [
            { factor: "Congestion/noise & multi-agency approvals", impact: "-2-6%" },
            { factor: "UDS/accessibility compliance burdens", impact: "-2-6%" }
        ],
        recommendedDevelopment: "Air-rights/over-station concepts, Park-and-ride retail pods (policy-dependent)",
        kpis: ["curb_revenue_R_per_20m", "mode_share_shift_%", "station_area_absorption"],
        scoringDimensions: {
            rights_flexibility: 34,
            accessibility: 92,
            amenity_edge: 55,
            infra_resilience: 65,
            overlay_constraints: 66
        }
    },
    
    'utility': {
        score: 52,
        thesis: "Backbone land for energy/water/waste—resilience projects and long-duration PPAs underpin value; adjacency can support data/process users.",
        upliftDrivers: [
            { factor: "Feeder capacity for BESS/PV", impact: "+3-8%" },
            { factor: "Industrial precinct adjacency for water reuse", impact: "+3-8%" },
            { factor: "Security & access control", impact: "+3-8%" }
        ],
        headwinds: [
            { factor: "Critical asset restrictions/servitudes", impact: "-3-6%" },
            { factor: "High capex & specialised approvals", impact: "-3-6%" }
        ],
        recommendedDevelopment: "Grid-support projects (BESS), Utility-adjacent data/process users (policy-compliant)",
        kpis: ["availability_%_SLA", "ppa_term_years", "mw_or_ml_day_added"],
        scoringDimensions: {
            rights_flexibility: 40,
            accessibility: 50,
            amenity_edge: 20,
            infra_resilience: 85,
            overlay_constraints: 65
        }
    },
    
    'null': {
        score: 0,
        thesis: "Data hygiene first—unknown rights = unknown risks; validate before underwriting.",
        upliftDrivers: [
            { factor: "Rapid zoning certificate & spatial join to official DMS", impact: "0%" }
        ],
        headwinds: [
            { factor: "Hidden overlays (HPOZ/Coastal/Scenic/BioNet) & split zoning", impact: "-10-20%" }
        ],
        recommendedDevelopment: "Impute zoning via spatial join to official DMS layer; request Zoning Certificate",
        kpis: ["%_records_cleaned", "avg_validation_days"],
        scoringDimensions: {
            rights_flexibility: 0,
            accessibility: 0,
            amenity_edge: 0,
            infra_resilience: 0,
            overlay_constraints: 0
        }
    }
};

// Function to get insights for a specific zone type
function getZoneInsights(zoneType) {
    // Normalize zone type
    const normalizedType = normalizeZoneType(zoneType);
    
    // Return insights or null zone if not found
    return zoningInsights[normalizedType] || zoningInsights['null'];
}

// Function to normalize zone types to match our insights keys
function normalizeZoneType(zoneType) {
    if (!zoneType || zoneType === '') return 'null';
    
    const lowerType = zoneType.toLowerCase();
    
    // Map specific codes to general categories
    const mappings = {
        'ag': 'agricultural',
        'agricultural': 'agricultural',
        'co1': 'community',
        'co2': 'community',
        'community': 'community',
        'gb1': 'general_business',
        'gb2': 'general_business',
        'gb3': 'general_business',
        'gb4': 'general_business',
        'gb5': 'general_business',
        'gb6': 'general_business',
        'gb7': 'general_business',
        'general business': 'general_business',
        'gi1': 'general_industrial',
        'gi2': 'general_industrial',
        'general industrial': 'general_industrial',
        'gr1': 'general_residential',
        'gr2': 'general_residential',
        'gr3': 'general_residential',
        'gr4': 'general_residential',
        'gr5': 'general_residential',
        'gr6': 'general_residential',
        'group housing': 'general_residential',
        'general residential': 'general_residential',
        'lu': 'limited_use',
        'limited use': 'limited_use',
        'lb': 'local_business',
        'lb2': 'local_business',
        'local business': 'local_business',
        'mu1': 'mixed_use',
        'mu2': 'mixed_use',
        'mu3': 'mixed_use',
        'mixed use': 'mixed_use',
        'os1': 'open_space',
        'os2': 'open_space',
        'os3': 'open_space',
        'open space': 'open_space',
        'sr1': 'single_residential',
        'sr2': 'single_residential',
        'single residential': 'single_residential',
        'tr1': 'transport',
        'tr2': 'transport',
        'tr3': 'transport',
        'transport': 'transport',
        'ut': 'utility',
        'utility': 'utility',
        'null': 'null'
    };
    
    return mappings[lowerType] || 'null';
}
