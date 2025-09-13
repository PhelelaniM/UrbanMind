// Map initialization and handling
let map = null;
let marker = null;
const defaultCenter = [-33.9249, 18.4241]; // Cape Town, South Africa
let baseMaps = {};
let currentBaseMap = null;
let zoningLayer = null;
let zoningData = null;
let legend = null;
let basemapControl = null;

// Initialize the map with default center
function initializeMap() {
    // Only initialize if the map element exists and map is not already initialized
    if (document.getElementById('map') && !map) {
        // Create the map
        map = L.map('map').setView(defaultCenter, 13);
        
        // Add the OpenStreetMap tile layer
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        });
        
        // Add Google Hybrid layer using Google Maps tiles
        const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            attribution: '&copy; Google Maps',
            maxZoom: 20
        });
        
        // Add the satellite layer
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        });
        
        // Define base maps for layer control
        baseMaps = {
            "OpenStreetMap": osmLayer,
            "Google Hybrid": googleHybrid,
            "Satellite": satelliteLayer
        };
        
        // Add the default layer to the map
        osmLayer.addTo(map);
        currentBaseMap = osmLayer;
        
        // Create custom basemap toggle control
        createBasemapToggle();
        
        // Create legend control
        createLegend();
        
        // Fix Leaflet's default icon issues
        fixLeafletIcons();
        
        // Add click event to the map
        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Update form inputs with clicked coordinates
            document.getElementById('coordinates').value = lat.toFixed(6) + ", " + lng.toFixed(6);
            
            // Switch to GPS input mode
            document.getElementById('gps_radio').checked = true;
            toggleInputFields();
            
            // Update marker
            updateMapMarker([lat, lng]);
        });
        
        // Load and display the zoning GeoJSON data
        loadZoningData();
    }
}

// Load the zoning GeoJSON data
function loadZoningData() {
    fetch('/static/data/Zoning_cpt_4_subset.geojson')
        .then(response => response.json())
        .then(data => {
            zoningData = data;
            displayZoningLayer();
        })
        .catch(error => {
            console.error('Error loading zoning data:', error);
        });
}

// Display the zoning layer on the map
function displayZoningLayer() {
    if (zoningLayer) {
        map.removeLayer(zoningLayer);
    }
    
    zoningLayer = L.geoJSON(zoningData, {
        style: function(feature) {
            // Style based on zoning type
            const zoneCode = feature.properties.INT_ZONE_CODE;
            return getZoneStyle(zoneCode);
        },
        onEachFeature: function(feature, layer) {
            // Add popup with comprehensive zoning information
            const props = feature.properties;
            const popupContent = `
                <div class="popup-content">
                    <h6 class="popup-title">Property Information</h6>
                    <table class="popup-table">
                        <tr><td><strong>ERF:</strong></td><td>${props.SL_LAND_PRCL_KEY || 'N/A'}</td></tr>
                        <tr><td><strong>Zone Code:</strong></td><td>${props.INT_ZONE_CODE || 'N/A'}</td></tr>
                        <tr><td><strong>Zone Type:</strong></td><td>${props.INT_ZONE_DESC || 'N/A'}</td></tr>
                        <tr><td><strong>SG Code:</strong></td><td>${props.SG26_CODE || 'N/A'}</td></tr>
                        <tr><td><strong>Area:</strong></td><td>${props.Shape__Area ? Math.round(props.Shape__Area) + ' m²' : 'N/A'}</td></tr>
                    </table>
                </div>
            `;
            layer.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'modern-popup'
            });
            
            // Add hover effects
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        }
    }).addTo(map);
}

// Get style for different zone types based on INT_ZONE_DESC
function getZoneStyle(zoneCode, zoneDesc) {
    // Comprehensive color mapping based on zoning types from the data
    const zoneColors = {
        // Agricultural
        'AG': '#8BC34A', // Light Green
        
        // Community Zones
        'CO1': '#9C27B0', // Purple
        'CO2': '#9C27B0', // Purple
        
        // General Business
        'GB1': '#FF9800', // Orange
        'GB2': '#FF9800', // Orange  
        'GB3': '#FF9800', // Orange
        'GB4': '#FF9800', // Orange
        'GB5': '#FF9800', // Orange
        'GB6': '#FF9800', // Orange
        'GB7': '#FF9800', // Orange
        
        // General Industrial
        'GI1': '#795548', // Brown
        'GI2': '#795548', // Brown
        
        // General Residential
        'GR1': '#2196F3', // Blue
        'GR2': '#2196F3', // Blue
        'GR3': '#2196F3', // Blue
        'GR4': '#2196F3', // Blue
        'GR5': '#2196F3', // Blue
        'GR6': '#2196F3', // Blue
        
        // Limited Use
        'LU': '#9E9E9E', // Gray
        
        // Local Business
        'LB1': '#FF5722', // Deep Orange
        'LB2': '#FF5722', // Deep Orange
        
        // Mixed Use
        'MU1': '#4CAF50', // Green
        'MU2': '#4CAF50', // Green
        'MU3': '#4CAF50', // Green
        
        // Open Space
        'OS1': '#00E676', // Bright Green
        'OS2': '#00E676', // Bright Green
        'OS3': '#00E676', // Bright Green
        
        // Single Residential
        'SR1': '#81C784', // Light Blue
        'SR2': '#81C784', // Light Blue
        
        // Transport
        'TR1': '#607D8B', // Blue Gray
        'TR2': '#607D8B', // Blue Gray
        
        // Utility
        'UT': '#455A64', // Dark Gray
        
        // Default for unknown types
        'DEFAULT': '#9E9E9E'
    };
    
    // Default style
    const style = {
        fillColor: '#9E9E9E',
        weight: 1,
        opacity: 0.8,
        color: '#ffffff',
        fillOpacity: 0.7,
        dashArray: null
    };
    
    // Set color based on zone code if available
    if (zoneCode && zoneColors[zoneCode]) {
        style.fillColor = zoneColors[zoneCode];
    } else if (zoneDesc) {
        // Try to match based on description keywords
        const desc = zoneDesc.toLowerCase();
        if (desc.includes('residential')) {
            style.fillColor = desc.includes('single') ? zoneColors['SR1'] : zoneColors['GR1'];
        } else if (desc.includes('business') || desc.includes('commercial')) {
            style.fillColor = zoneColors['GB1'];
        } else if (desc.includes('industrial')) {
            style.fillColor = zoneColors['GI1'];
        } else if (desc.includes('transport')) {
            style.fillColor = zoneColors['TR1'];
        } else if (desc.includes('open space')) {
            style.fillColor = zoneColors['OS1'];
        } else if (desc.includes('mixed use')) {
            style.fillColor = zoneColors['MU1'];
        }
    }
    
    return style;
}

// Find ERF by SL_LAND_PRCL_KEY
function findErfByKey(erfNumber) {
    if (!zoningData || !zoningData.features) {
        console.error('Zoning data not loaded yet');
        return null;
    }
    
    // Convert to number for comparison
    const erfKey = parseInt(erfNumber);
    
    // Find the feature with matching SL_LAND_PRCL_KEY
    const feature = zoningData.features.find(f => 
        f.properties.SL_LAND_PRCL_KEY === erfKey
    );
    
    return feature;
}

// Zoom to ERF
function zoomToErf(erfNumber) {
    const feature = findErfByKey(erfNumber);
    
    if (feature) {
        // Create a GeoJSON layer just for this feature
        const erfLayer = L.geoJSON(feature);
        
        // Zoom to the bounds of the feature
        map.fitBounds(erfLayer.getBounds());
        
        // Get the center of the feature for the marker
        const bounds = erfLayer.getBounds();
        const center = bounds.getCenter();
        
        // Update marker
        updateMapMarker([center.lat, center.lng]);
        
        // Return the center coordinates
        return {
            lat: center.lat,
            lng: center.lng,
            feature: feature
        };
    }
    
    return null;
}

// Fix Leaflet's default icon issues
function fixLeafletIcons() {
    // Delete the default icon settings
    delete L.Icon.Default.prototype._getIconUrl;
    
    // Set global default icon options
    L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

// Create a custom icon
function createCustomIcon() {
    return L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

// Update or add a marker to the map
function updateMapMarker(coordinates) {
    // Remove existing marker if it exists
    if (marker) {
        map.removeLayer(marker);
    }
    
    // Create a new marker with custom icon
    marker = L.marker(coordinates, { icon: createCustomIcon() })
        .addTo(map)
        .bindPopup(`Selected Location<br>Lat: ${coordinates[0].toFixed(6)}, Lng: ${coordinates[1].toFixed(6)}`);
    
    // Center the map on the marker
    map.setView(coordinates, 13);
}

// Create custom basemap toggle control
function createBasemapToggle() {
    const BasemapToggle = L.Control.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'basemap-toggle leaflet-bar');
            container.innerHTML = `
                <div class="basemap-toggle-content">
                    <button class="basemap-btn active" data-layer="OpenStreetMap" title="OpenStreetMap">
                        <span>OSM</span>
                    </button>
                    <button class="basemap-btn" data-layer="Google Hybrid" title="Google Hybrid">
                        <span>Hybrid</span>
                    </button>
                    <button class="basemap-btn" data-layer="Satellite" title="Satellite">
                        <span>Satellite</span>
                    </button>
                </div>
            `;
            
            // Add click event listeners
            container.addEventListener('click', function(e) {
                if (e.target.closest('.basemap-btn')) {
                    const btn = e.target.closest('.basemap-btn');
                    const layerName = btn.dataset.layer;
                    
                    // Remove active class from all buttons
                    container.querySelectorAll('.basemap-btn').forEach(b => b.classList.remove('active'));
                    
                    // Add active class to clicked button
                    btn.classList.add('active');
                    
                    // Switch basemap
                    switchBasemap(layerName);
                }
            });
            
            return container;
        },
        onRemove: function(map) {}
    });
    
    basemapControl = new BasemapToggle({ position: 'topright' });
    basemapControl.addTo(map);
}

// Switch basemap function
function switchBasemap(layerName) {
    // Remove current basemap
    if (currentBaseMap) {
        map.removeLayer(currentBaseMap);
    }
    
    // Add new basemap
    currentBaseMap = baseMaps[layerName];
    currentBaseMap.addTo(map);
}

// Create legend control
function createLegend() {
    const Legend = L.Control.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'legend-control');
            container.innerHTML = `
                <div class="legend-header">
                    <h6>Zoning Legend</h6>
                    <button class="legend-toggle" title="Collapse/Expand">
                        <span class="legend-arrow">▼</span>
                    </button>
                </div>
                <div class="legend-content">
                    <div class="legend-item"><div class="legend-color" style="background: #2196F3;"></div><span>General Residential (GR)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #81C784;"></div><span>Single Residential (SR)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #FF9800;"></div><span>General Business (GB)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #FF5722;"></div><span>Local Business (LB)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #795548;"></div><span>General Industrial (GI)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #4CAF50;"></div><span>Mixed Use (MU)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #00E676;"></div><span>Open Space (OS)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #607D8B;"></div><span>Transport (TR)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #9C27B0;"></div><span>Community (CO)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #455A64;"></div><span>Utility (UT)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #8BC34A;"></div><span>Agricultural (AG)</span></div>
                    <div class="legend-item"><div class="legend-color" style="background: #9E9E9E;"></div><span>Limited Use (LU)</span></div>
                </div>
            `;
            
            // Make the legend draggable
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            
            // Add toggle functionality
            const toggleBtn = container.querySelector('.legend-toggle');
            const content = container.querySelector('.legend-content');
            const arrow = container.querySelector('.legend-arrow');
            let collapsed = false;
            
            toggleBtn.addEventListener('click', function() {
                collapsed = !collapsed;
                if (collapsed) {
                    content.style.display = 'none';
                    arrow.textContent = '▶';
                    container.classList.add('collapsed');
                } else {
                    content.style.display = 'block';
                    arrow.textContent = '▼';
                    container.classList.remove('collapsed');
                }
            });
            
            return container;
        },
        onRemove: function(map) {}
    });
    
    legend = new Legend({ position: 'bottomright' });
    legend.addTo(map);
}

// Highlight feature on mouseover
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#ffffff',
        dashArray: '',
        fillOpacity: 0.9
    });
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Reset highlight on mouseout
function resetHighlight(e) {
    zoningLayer.resetStyle(e.target);
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
});
