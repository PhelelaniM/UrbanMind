// Map initialization and handling
let map = null;
let marker = null;
const defaultCenter = [-33.9249, 18.4241]; // Cape Town, South Africa
let baseMaps = {};
let currentBaseMap = null;
let zoningLayer = null;
let zoningData = null;

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
        
        // Add the satellite layer
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        });
        
        // Add the hybrid satellite layer
        const hybridLayer = L.layerGroup([
            satelliteLayer,
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
                maxZoom: 19,
                pane: 'overlayPane'
            })
        ]);
        
        // Define base maps for layer control
        baseMaps = {
            "OpenStreetMap": osmLayer,
            "Satellite": satelliteLayer,
            "Hybrid": hybridLayer
        };
        
        // Add the default layer to the map
        osmLayer.addTo(map);
        currentBaseMap = osmLayer;
        
        // Add layer control to the map
        L.control.layers(baseMaps, {}).addTo(map);
        
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
    fetch('/static/data/coct_zoning_sample.geojson')
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
            // Add popup with zoning information
            const props = feature.properties;
            const popupContent = `
                <strong>ERF: ${props.SL_LAND_PRCL_KEY}</strong><br>
                <strong>Zone: ${props.INT_ZONE_CODE}</strong><br>
                ${props.INT_ZONE_DESC}<br>
                SG Code: ${props.SG26_CODE}
            `;
            layer.bindPopup(popupContent);
        }
    }).addTo(map);
}

// Get style for different zone types
function getZoneStyle(zoneCode) {
    // Define colors for different zone types
    const zoneColors = {
        'SR1': '#ffff00', // Single Residential - Yellow
        'GR2': '#ff9900', // General Residential - Orange
        'TR2': '#cccccc', // Transport - Gray
        'OS3': '#33cc33', // Open Space - Green
        // Add more zone types as needed
    };
    
    // Default style
    const style = {
        fillColor: '#3388ff',
        weight: 1,
        opacity: 1,
        color: '#666666',
        fillOpacity: 0.5
    };
    
    // Set color based on zone code if available
    if (zoneCode && zoneColors[zoneCode]) {
        style.fillColor = zoneColors[zoneCode];
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

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
});
