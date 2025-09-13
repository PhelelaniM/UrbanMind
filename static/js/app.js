// Main application functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const locationForm = document.getElementById('location-form');
    const inputTypeRadios = document.querySelectorAll('input[name="input_type"]');
    const gpsInputs = document.getElementById('gps-inputs');
    const erfInputs = document.getElementById('erf-inputs');
    const informationCard = document.getElementById('information-card');
    const informationLocationBadge = document.getElementById('information-location-badge');
    const erfInfoContent = document.getElementById('erf-info-content');
    const investmentAnalysisContent = document.getElementById('investment-analysis-content');
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.info-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Add event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    // Switch tab function
    function switchTab(tabId) {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to selected button and pane
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }
    
    // Toggle input fields based on selected input type
    function toggleInputFields() {
        const selectedType = document.querySelector('input[name="input_type"]:checked').value;
        
        if (selectedType === 'gps') {
            gpsInputs.style.display = 'block';
            erfInputs.style.display = 'none';
        } else {
            gpsInputs.style.display = 'none';
            erfInputs.style.display = 'block';
        }
    }
    // Expose to global scope for map.js click handler
    window.toggleInputFields = toggleInputFields;
    
    // Add event listeners to radio buttons
    inputTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleInputFields);
    });
    
    // Handle form submission
    locationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state in both tabs
        erfInfoContent.innerHTML = '<div class="loader"></div><p class="text-center text-muted">Analyzing property data...</p>';
        investmentAnalysisContent.innerHTML = '<div class="loader"></div><p class="text-center text-muted">Calculating investment potential...</p>';
        informationCard.style.display = 'block';
        
        // Get form data
        const inputType = document.querySelector('input[name="input_type"]:checked').value;
        
        if (inputType === 'gps') {
            const coordinates = document.getElementById('coordinates').value.trim();
            
            // Validate inputs
            if (!coordinates) {
                showError('Please enter valid GPS coordinates.');
                return;
            }
            
            // Send request to server
            fetch('/get_information', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ coordinates })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update map marker with returned location
                    if (data.location) {
                        updateMapMarker([data.location.lat, data.location.lng]);
                    }
                    
                    // Display information
                    displayInformation(data);
                } else {
                    showError(data.error || 'An error occurred while fetching information.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('An error occurred while fetching information.');
            });
        } else {
            const erfNumber = document.getElementById('erf_number').value.trim();
            
            // Validate inputs
            if (!erfNumber) {
                showError('Please enter a valid ERF number.');
                return;
            }
            
            // Search for ERF in the GeoJSON data
            const erfResult = zoomToErf(erfNumber);
            
            if (erfResult) {
                // Get zoning information from the feature
                const feature = erfResult.feature;
                const zoneType = feature.properties.INT_ZONE_CODE.toLowerCase();
                const zoneDesc = feature.properties.INT_ZONE_DESC;
                
                // Create a data object similar to what the server would return
                const data = {
                    success: true,
                    location: {
                        lat: erfResult.lat,
                        lng: erfResult.lng
                    },
                    erf_number: erfNumber,
                    zoning_type: zoneType,
                    zoning_info: {
                        description: zoneDesc,
                        permitted_uses: getPermittedUsesForZone(zoneType),
                        restrictions: getRestrictionsForZone(zoneType)
                    }
                };
                
                // Display information
                displayInformation(data);
            } else {
                showError(`ERF number ${erfNumber} not found in the zoning data.`);
            }
        }
    });
    
    // Helper function to get permitted uses for a zone type
    function getPermittedUsesForZone(zoneType) {
        // This is a simplified version - in a real app, this would come from a database
        const zoneUses = {
            'sr1': ["Single-family homes", "Home occupation (with restrictions)", "Second dwelling (with restrictions)"],
            'gr2': ["Multi-family dwellings", "Townhouses", "Flats", "Residential buildings"],
            'tr2': ["Public roads", "Public parking", "Transport facilities"],
            'os3': ["Special open space", "Environmental conservation", "Cultural and historical sites"]
        };
        
        return zoneUses[zoneType] || ["Information not available"];
    }
    
    // Helper function to get restrictions for a zone type
    function getRestrictionsForZone(zoneType) {
        // This is a simplified version - in a real app, this would come from a database
        const zoneRestrictions = {
            'sr1': ["Height limit: 2-3 stories", "Setback: 3-5m from street", "Coverage: 60% max"],
            'gr2': ["Height limit: 4-5 stories", "Setback: 4.5m from street", "Coverage: 60% max"],
            'tr2': ["Special restrictions apply", "Contact municipality for details"],
            'os3': ["Development restrictions apply", "Environmental impact assessment required", "Heritage approval may be required"]
        };
        
        return zoneRestrictions[zoneType] || ["Information not available"];
    }
    
    // Display error message
    function showError(message) {
        erfInfoContent.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `;
        investmentAnalysisContent.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `;
        informationLocationBadge.textContent = '';
    }
    
    // Display zoning information in both tabs
    function displayInformation(data) {
        const zoningType = data.zoning_type;
        const zoningInfo = data.zoning_info;
        
        // Update location badge
        if (data.erf_number) {
            informationLocationBadge.textContent = `ERF: ${data.erf_number}`;
        } else {
            informationLocationBadge.textContent = `GPS Location`;
        }
        
        // Populate Erf Information tab with AI-style progressive loading
        displayErfInfoWithAI(data);
        
        // Populate Investment Analysis tab
        displayInvestmentAnalysis(data);
        
        // Smooth scroll to information
        informationCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // AI-style progressive loading for Erf Information
    function displayErfInfoWithAI(data) {
        const zoningType = data.zoning_type;
        const zoningInfo = data.zoning_info;
        
        // Start with AI thinking animation
        erfInfoContent.innerHTML = `
            <div class="ai-thinking">
                <div class="thinking-dots">
                    <div class="thinking-dot"></div>
                    <div class="thinking-dot"></div>
                    <div class="thinking-dot"></div>
                </div>
                <span class="thinking-text">Analyzing property data and zoning regulations...</span>
            </div>
        `;
        
        // Progressive content sections
        const sections = [
            {
                title: 'Property Overview',
                delay: 1500,
                content: `
                    <div class="zoning-${zoningType}">
                        <h4 class="mb-3">Zoning Classification: ${formatZoningType(zoningType)}</h4>
                        <p><strong>Zone Description:</strong> ${zoningInfo.description || 'Standard zoning classification'}</p>
                        ${data.erf_number ? `<p><strong>ERF Number:</strong> ${data.erf_number}</p>` : ''}
                        <p><strong>Coordinates:</strong> ${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)}</p>
                        <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                `
            },
            {
                title: 'Permitted Land Uses',
                delay: 2500,
                content: `
                    <h5 class="mt-4">What you can build or operate:</h5>
                    ${zoningInfo.permitted_uses && zoningInfo.permitted_uses.length > 0 ? 
                        '<ul class="list-disc">' + 
                        zoningInfo.permitted_uses.map(use => `<li>${use}</li>`).join('') + 
                        '</ul>' 
                        : '<p class="text-muted">Reviewing municipal regulations for permitted uses...</p>'}
                `
            },
            {
                title: 'Development Restrictions',
                delay: 3500,
                content: `
                    <h5 class="mt-4">Important Limitations:</h5>
                    ${zoningInfo.restrictions && zoningInfo.restrictions.length > 0 ? 
                        '<ul class="list-disc">' + 
                        zoningInfo.restrictions.map(restriction => `<li>${restriction}</li>`).join('') + 
                        '</ul>' 
                        : '<p class="text-muted">Standard municipal development guidelines apply.</p>'}
                `
            },
            {
                title: 'Compliance & Next Steps',
                delay: 4500,
                content: `
                    <div class="alert alert-info">
                        <h5 class="mb-2">📋 Recommended Actions</h5>
                        <ul class="mb-0">
                            <li>Verify current zoning with City of Cape Town</li>
                            <li>Review building line restrictions and setbacks</li>
                            <li>Consult with town planner for development applications</li>
                            <li>Check for any special conditions or overlays</li>
                        </ul>
                    </div>
                `
            }
        ];
        
        // Progressively add sections
        sections.forEach((section, index) => {
            setTimeout(() => {
                const sectionElement = `
                    <div class="info-section">
                        <div class="info-section-title">${section.title}</div>
                        ${section.content}
                    </div>
                `;
                erfInfoContent.innerHTML += sectionElement;
                
                // Remove thinking animation after first section
                if (index === 0) {
                    const thinkingElement = erfInfoContent.querySelector('.ai-thinking');
                    if (thinkingElement) {
                        thinkingElement.remove();
                    }
                }
            }, section.delay);
        });
    }
    
    // Display investment analysis
    function displayInvestmentAnalysis(data) {
        const zoningType = data.zoning_type;
        const zoningInfo = data.zoning_info;
        
        // Get enhanced zoning intelligence
        const zoningIntelligence = getZoningIntelligence(zoningType);
        const investmentScore = (zoningIntelligence.baseScore / 100).toFixed(2);
        const investmentGrade = getInvestmentGrade(zoningIntelligence.baseScore);
        
        const analysisContent = `
            <div class="investment-score">
                <div>
                    <div class="score-value">${investmentScore}</div>
                    <div class="score-label">Investment Potential (Normalised)</div>
                    <div class="score-description">Grade: ${investmentGrade}</div>
                </div>
            </div>
            
            <div class="quick-take">
                <div class="quick-take-title">Investment Thesis</div>
                <p>${zoningIntelligence.investment_thesis}</p>
            </div>
            
            <div class="scoring-dimensions">
                ${getDimensionScores(zoningType).map(dimension => `
                    <div class="dimension-item">
                        <div class="dimension-header">
                            <h6 class="dimension-title">${dimension.name}</h6>
                            <span class="dimension-score">${dimension.score}/100</span>
                        </div>
                        <div class="dimension-bar">
                            <div class="dimension-bar-fill ${dimension.grade.toLowerCase()}" style="width: ${dimension.score}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="value-metrics">
                <div class="value-section uplifts">
                    <div class="value-section-title">📈 Value Uplift Drivers</div>
                    ${zoningIntelligence.value_uplifts.map(uplift => `
                        <div class="value-item">
                            <span class="value-driver">${uplift.driver}</span>
                            <span class="value-impact positive">${uplift.impact_pct}%</span>
                        </div>
                    `).join('')}
                </div>
                <div class="value-section drags">
                    <div class="value-section-title">📉 Investment Headwinds</div>
                    ${zoningIntelligence.value_drags.map(drag => `
                        <div class="value-item">
                            <span class="value-driver">${drag.risk}</span>
                            <span class="value-impact negative">${drag.impact_pct}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="deal-strategies">
                <div class="deal-strategies-title">Recommended Development Strategy</div>
                ${zoningIntelligence.deal_plays.map(strategy => `
                    <div class="deal-item">${strategy}</div>
                `).join('')}
            </div>
            
            <div class="ai-disclaimer">
                <strong>AI-powered intelligence</strong> informing investment decisions, property optimization and strategic development planning. This analysis is based on zoning information and general market conditions. Simulated % impacts are conservative, like-for-like within node. Please verify with official Zoning Certificate & overlays. Consult with real estate professionals and conduct thorough due diligence before making investment decisions.
            </div>
        `;
        
        setTimeout(() => {
            investmentAnalysisContent.innerHTML = analysisContent;
        }, 1000);
    }
    
    // Calculate investment score based on zoning
    function calculateInvestmentScore(zoningType) {
        const scores = {
            'gr1': 75, 'gr2': 78, 'gr3': 72, 'gr4': 70, 'gr5': 68, 'gr6': 65,
            'sr1': 85, 'sr2': 80,
            'gb1': 82, 'gb2': 78, 'gb3': 75, 'gb4': 72, 'gb5': 70, 'gb6': 68, 'gb7': 65,
            'lb1': 70, 'lb2': 68,
            'mu1': 88, 'mu2': 85, 'mu3': 80,
            'gi1': 55, 'gi2': 50,
            'co1': 60, 'co2': 58,
            'os1': 25, 'os2': 30, 'os3': 35,
            'tr1': 20, 'tr2': 25,
            'ut': 15, 'lu': 40, 'ag': 45
        };
        return scores[zoningType.toLowerCase()] || 50;
    }
    
    // Get investment grade
    function getInvestmentGrade(score) {
        if (score >= 80) return 'A - Excellent';
        if (score >= 70) return 'B - Good';
        if (score >= 60) return 'C - Fair';
        if (score >= 50) return 'D - Below Average';
        return 'E - Poor';
    }
    
    // Get quick take for zoning
    function getQuickTakeForZoning(zoningType) {
        const takes = {
            'sr1': 'Prime residential zoning with strong development potential and good market demand.',
            'gr': 'Versatile residential zoning allowing multiple dwelling types, excellent for rental income.',
            'gb': 'Commercial zoning offers business opportunities with steady income potential.',
            'mu': 'Mixed-use zoning provides maximum flexibility and strong investment returns.',
            'os': 'Open space designation limits development but offers environmental value.',
            'tr': 'Transport zoning has limited development options with specialized uses only.',
            'gi': 'Industrial zoning suitable for manufacturing and logistics operations.',
            'co': 'Community zoning for public and institutional uses with stable long-term value.'
        };
        
        // Find matching zone type
        for (const [key, value] of Object.entries(takes)) {
            if (zoningType.toLowerCase().startsWith(key)) {
                return value;
            }
        }
        return 'This zoning classification offers specific development opportunities worth exploring.';
    }
    
    // Get investment drivers
    function getInvestmentDrivers(zoningType) {
        const type = zoningType.toLowerCase();
        
        if (type.startsWith('sr') || type.startsWith('gr')) {
            return [
                { type: 'positive', text: 'Strong residential demand in Cape Town' },
                { type: 'positive', text: 'Flexible development options' },
                { type: 'negative', text: 'Market saturation in some areas' },
                { type: 'positive', text: 'Good rental yield potential' }
            ];
        } else if (type.startsWith('gb') || type.startsWith('lb')) {
            return [
                { type: 'positive', text: 'Commercial activity generates steady income' },
                { type: 'positive', text: 'Business development opportunities' },
                { type: 'negative', text: 'Economic cycles affect demand' },
                { type: 'positive', text: 'Strategic location advantages' }
            ];
        } else if (type.startsWith('mu')) {
            return [
                { type: 'positive', text: 'Maximum development flexibility' },
                { type: 'positive', text: 'Multiple income streams possible' },
                { type: 'positive', text: 'High market demand' },
                { type: 'negative', text: 'Higher development complexity' }
            ];
        } else {
            return [
                { type: 'positive', text: 'Specialized use opportunities' },
                { type: 'negative', text: 'Limited development flexibility' },
                { type: 'positive', text: 'Lower competition' },
                { type: 'negative', text: 'Market demand varies' }
            ];
        }
    }
    
    // Get comprehensive zoning intelligence
    function getZoningIntelligence(zoningType) {
        const zoningData = {
            'ag': {
                baseScore: 45,
                investment_thesis: "Large, low-cost parcels at metro edge; best for agri-logistics, agro-processing, renewables and optionality along future growth corridors.",
                value_uplifts: [
                    { driver: "Highway + market access (N1/N2/N7 ≤ 10 min)", impact_pct: "+4–9" },
                    { driver: "Grid adjacency for PV/BESS (≤2 km to substation)", impact_pct: "+6–10" },
                    { driver: "Inside densification/IOZ influence area (future conversion option)", impact_pct: "+3–7" }
                ],
                value_drags: [
                    { risk: "Biodiversity or riparian buffers overlap", impact_pct: "−5–12" },
                    { risk: "Urban Edge overlay + water rights constraints", impact_pct: "timeline & feasibility risk" }
                ],
                deal_plays: ["Assemble along regional routes; land-bank with wayleaves", "Renewables lease (ground-mount PV/BESS) pending grid capacity"]
            },
            'co': {
                baseScore: 60,
                investment_thesis: "Civic anchors concentrate daytime footfall; adjacency supports neighbourhood convenience retail and affordable/student housing within 400–800 m.",
                value_uplifts: [
                    { driver: "Taxi/rail/BRT within 300–600 m + school cluster", impact_pct: "+4–8" },
                    { driver: "Edge interface with LB/GB parcels for daily needs", impact_pct: "+3–6" }
                ],
                value_drags: [
                    { risk: "Peak curb stress at school hours without managed loading", impact_pct: "−2–5" },
                    { risk: "Aged civic stock OPEX drift if owner-funded retrofits", impact_pct: "−3–7" }
                ],
                deal_plays: ["5,000 m² GLA convenience centre on safe pedestrian desire lines", "ESCO: solar/water retrofits to stabilise OPEX for civic tenants"]
            },
            'gb': {
                baseScore: 78,
                investment_thesis: "Highest commercial intensity; value unlocked by vertical headroom, TOD adjacency and repositioning from mono-office to hybrid formats.",
                value_uplifts: [
                    { driver: "Underutilised FAR/height (≥25% headroom)", impact_pct: "+8–15" },
                    { driver: "≤300 m to quality transit headways", impact_pct: "+4–10" },
                    { driver: "IOZ rights/timing incentives", impact_pct: "programme acceleration" }
                ],
                value_drags: [
                    { risk: "Structural office vacancy in node", impact_pct: "−6–12" },
                    { risk: "HPOZ façade/massing controls", impact_pct: "−3–7 (+time)" }
                ],
                deal_plays: ["Retail-active podium + flex/last-mile above", "Green-lease retrofits to lift NOI; OPEX intensity down"]
            },
            'gi': {
                baseScore: 52,
                investment_thesis: "Defensive cashflows (warehousing/light-mfg); premium near highways and dense townships for e-commerce micro-fulfilment.",
                value_uplifts: [
                    { driver: "≤6 min to freeway interchange", impact_pct: "+6–12" },
                    { driver: "Small-bay modernisation (250–1,000 m²)", impact_pct: "+4–8" },
                    { driver: "On-site PV/demand management", impact_pct: "NOI uplift via OPEX cut" }
                ],
                value_drags: [
                    { risk: "100-year flood platform costs", impact_pct: "−5–10" },
                    { risk: "Residential interface (nuisance risk)", impact_pct: "−3–6" }
                ],
                deal_plays: ["Edge-of-township logistics micro-hubs (15–30 min rings)", "Rooftop solar + BESS; truck turn-time optimisation"]
            },
            'gr': {
                baseScore: 74,
                investment_thesis: "Medium–high density rights; strongest when paired with TOD and high-quality open space; ideal for BTR, student and inclusionary mixes.",
                value_uplifts: [
                    { driver: "≤600 m to high-frequency transit", impact_pct: "+7–12" },
                    { driver: "Park/greenway frontage with CPTED lighting", impact_pct: "+4–9" },
                    { driver: "IOZ density/time incentives with priced inclusionary mix", impact_pct: "+3–6" }
                ],
                value_drags: [
                    { risk: "Parking minima off-TOD exceed market need", impact_pct: "−3–7" },
                    { risk: "Unpriced inclusionary obligations", impact_pct: "−2–6 (margin squeeze)" }
                ],
                deal_plays: ["Amenity-light, OPEX-lean walk-ups", "Stacked unit mix to de-risk absorption; early SDP engagement"]
            },
            'lb': {
                baseScore: 69,
                investment_thesis: "Neighbourhood-serving formats; resilient where walkability and taxi desire lines intersect schools and clinics.",
                value_uplifts: [
                    { driver: "Taxi stop ≤150 m + strong pedestrian flows", impact_pct: "+5–9" },
                    { driver: "GLA undersupply within 1.5 km", impact_pct: "+3–6" }
                ],
                value_drags: [
                    { risk: "Kerb conflict/security after dark", impact_pct: "−3–7" },
                    { risk: "Parking/egress constraints at peaks", impact_pct: "−2–5" }
                ],
                deal_plays: ["Small-format FMCG anchors + services", "Upper-floor conversions to medical/co-work"]
            },
            'lu': {
                baseScore: 40,
                investment_thesis: "Restrictive rights (existing lawful use only). Treat as holding/special-purpose with interim low-impact income.",
                value_uplifts: [
                    { driver: "Interim activation (events/markets/EV charging) where permissible", impact_pct: "+2–5" }
                ],
                value_drags: [
                    { risk: "No rezoning route or short consent horizons", impact_pct: "−4–8" },
                    { risk: "Operational curfews/strict schedules", impact_pct: "−2–5" }
                ],
                deal_plays: ["Temporary concessions; wayleave micro-infrastructure", "Data collection to motivate future rights"]
            },
            'mu': {
                baseScore: 84,
                investment_thesis: "Most flexible rights; value is created by curation (active ground floors) and phasing (shell-and-core, staged release).",
                value_uplifts: [
                    { driver: "≥60% active frontage on primary street", impact_pct: "+6–12" },
                    { driver: "Transit + bike network connectivity", impact_pct: "+3–7" }
                ],
                value_drags: [
                    { risk: "Management complexity of mixed tenancies", impact_pct: "−3–6" },
                    { risk: "HPOZ/Local Area Overlay massing constraints", impact_pct: "−2–5 (+time)" }
                ],
                deal_plays: ["Ground-floor activation + resi/flex above", "Night-time economy where acoustic buffers allow"]
            },
            'os': {
                baseScore: 30,
                investment_thesis: "Direct development is limited; value is monetised on adjacent parcels through quality, safety and activation of the open space edge.",
                value_uplifts: [
                    { driver: "High-quality, safe park frontage (OS2)", impact_pct: "+4–10" },
                    { driver: "Viewshed/trail network (OS1/OS3)", impact_pct: "+3–8" }
                ],
                value_drags: [
                    { risk: "Degraded/unsafe open space (O&M deficit)", impact_pct: "−3–7" },
                    { risk: "Riparian/biodiversity buffers restrict adjacent massing", impact_pct: "−4–9" }
                ],
                deal_plays: ["Park-facing resi premiums; kiosks/concessions where lawful", "Edge CPTED lighting, eyes-on-park design"]
            },
            'sr': {
                baseScore: 82,
                investment_thesis: "Low-rise fabric with strong small-scale rental potential (second dwellings/backyard units), especially in TOD/IOZ areas.",
                value_uplifts: [
                    { driver: "Legal second dwelling/backyard rental near transit", impact_pct: "+4–9" },
                    { driver: "Corner-lot/home-enterprise permissibility", impact_pct: "+2–5" }
                ],
                value_drags: [
                    { risk: "Non-compliant additions (enforcement/insurance risk)", impact_pct: "−3–8" },
                    { risk: "Parking/character pushback delaying approvals", impact_pct: "−2–5 (+time)" }
                ],
                deal_plays: ["Compliant micro-dev with shared services", "Subdivision/duplex on larger SR1 lots where rules allow"]
            },
            'tr': {
                baseScore: 22,
                investment_thesis: "Rights-of-way and hubs create curb value and TOD opportunities; monetise edges and air/underground rights where viable.",
                value_uplifts: [
                    { driver: "Station-area development (≤300 m; good headways)", impact_pct: "+5–11" },
                    { driver: "Kerbside monetisation (managed loading/ride-hail bays)", impact_pct: "+2–5" }
                ],
                value_drags: [
                    { risk: "Congestion/noise exposure at peaks", impact_pct: "−3–6" },
                    { risk: "Multi-agency approvals for air/underground rights", impact_pct: "timeline risk" }
                ],
                deal_plays: ["Over-station concepts; park-and-ride retail pods", "Dynamic curb pricing and logistics bays"]
            },
            'ut': {
                baseScore: 15,
                investment_thesis: "Backbone infrastructure land; strongest for resilience projects (BESS/PV, water reuse) and utility-adjacent users.",
                value_uplifts: [
                    { driver: "Feeder/transformer capacity for BESS/PV PPAs", impact_pct: "+4–8" },
                    { driver: "Industrial adjacency for water reuse/heat loops", impact_pct: "+2–5" }
                ],
                value_drags: [
                    { risk: "Security/servitude buffers limiting buildability", impact_pct: "−3–6" }
                ],
                deal_plays: ["Grid-support BESS; utility-linked data/process users (policy-compliant)"]
            }
        };
        
        const type = zoningType.toLowerCase();
        
        // Match by exact code or prefix
        for (const [key, data] of Object.entries(zoningData)) {
            if (type === key || type.startsWith(key)) {
                return data;
            }
        }
        
        // Default fallback
        return {
            baseScore: 50,
            investment_thesis: "This zoning classification offers specific development opportunities worth exploring.",
            value_uplifts: [{ driver: "Location-specific advantages", impact_pct: "+2–5" }],
            value_drags: [{ risk: "Regulatory constraints may apply", impact_pct: "−2–5" }],
            deal_plays: ["Verify zoning rights and explore permitted uses with municipal authorities"]
        };
    }
    
    // Get dimension scores for investment analysis
    function getDimensionScores(zoningType) {
        const type = zoningType.toLowerCase();
        let dimensions;
        
        if (type.startsWith('sr') || type.startsWith('gr')) {
            dimensions = [
                { name: "Rights Flexibility", score: 74, grade: "Good" },
                { name: "Accessibility", score: 78, grade: "Good" },
                { name: "Amenity Edge", score: 72, grade: "Good" },
                { name: "Infrastructure Resilience", score: 67, grade: "Fair" }
            ];
        } else if (type.startsWith('gb') || type.startsWith('lb')) {
            dimensions = [
                { name: "Rights Flexibility", score: 85, grade: "Excellent" },
                { name: "Accessibility", score: 82, grade: "Excellent" },
                { name: "Amenity Edge", score: 75, grade: "Good" },
                { name: "Infrastructure Resilience", score: 70, grade: "Good" }
            ];
        } else if (type.startsWith('mu')) {
            dimensions = [
                { name: "Rights Flexibility", score: 95, grade: "Excellent" },
                { name: "Accessibility", score: 88, grade: "Excellent" },
                { name: "Amenity Edge", score: 80, grade: "Excellent" },
                { name: "Infrastructure Resilience", score: 75, grade: "Good" }
            ];
        } else if (type.startsWith('gi')) {
            dimensions = [
                { name: "Rights Flexibility", score: 65, grade: "Fair" },
                { name: "Accessibility", score: 70, grade: "Good" },
                { name: "Amenity Edge", score: 45, grade: "Poor" },
                { name: "Infrastructure Resilience", score: 80, grade: "Excellent" }
            ];
        } else if (type.startsWith('os')) {
            dimensions = [
                { name: "Rights Flexibility", score: 15, grade: "Poor" },
                { name: "Accessibility", score: 60, grade: "Fair" },
                { name: "Amenity Edge", score: 85, grade: "Excellent" },
                { name: "Infrastructure Resilience", score: 40, grade: "Poor" }
            ];
        } else {
            dimensions = [
                { name: "Rights Flexibility", score: 50, grade: "Fair" },
                { name: "Accessibility", score: 60, grade: "Fair" },
                { name: "Amenity Edge", score: 55, grade: "Fair" },
                { name: "Infrastructure Resilience", score: 50, grade: "Fair" }
            ];
        }
        
        return dimensions;
    }
    
    // Format zoning type for display
    function formatZoningType(type) {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Initialize the form
    toggleInputFields();
});
