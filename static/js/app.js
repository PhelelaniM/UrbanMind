// Main application functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const locationForm = document.getElementById('location-form');
    const inputTypeRadios = document.querySelectorAll('input[name="input_type"]');
    const gpsInputs = document.getElementById('gps-inputs');
    const erfInputs = document.getElementById('erf-inputs');
    const informationCard = document.getElementById('information-card');
    const informationContent = document.getElementById('information-content');
    const informationLocationBadge = document.getElementById('information-location-badge');
    
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
    
    // Add event listeners to radio buttons
    inputTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleInputFields);
    });
    
    // Handle form submission
    locationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        informationContent.innerHTML = '<div class="loader"></div><p class="text-center text-muted">Generating information...</p>';
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
        informationContent.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `;
        informationLocationBadge.textContent = '';
    }
    
    // Display zoning information
    function displayInformation(data) {
        const zoningType = data.zoning_type;
        const zoningInfo = data.zoning_info;
        
        // Update location badge
        if (data.erf_number) {
            informationLocationBadge.textContent = `ERF: ${data.erf_number}`;
        } else {
            informationLocationBadge.textContent = `GPS Location`;
        }
        
        // Create a more modern layout for information
        let html = `<div class="grid row">`;
        
        // Left column
        html += `<div class="col-md-6">`;
        
        // Zoning type and location info
        html += `
            <div class="zoning-${zoningType}">
                <h4 class="mb-3">Zoning Type: ${formatZoningType(zoningType)}</h4>
                <p>${zoningInfo.description || ''}</p>
            </div>
        `;
        
        if (data.erf_number) {
            html += `<p><strong>ERF Number:</strong> ${data.erf_number}</p>`;
        }
        html += `<p><strong>Coordinates:</strong> ${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)}</p>`;
        
        // Permitted uses
        html += `<h5 class="mt-4">Permitted Uses</h5>`;
        if (zoningInfo.permitted_uses && zoningInfo.permitted_uses.length > 0) {
            html += '<ul class="list-disc">';
            zoningInfo.permitted_uses.forEach(use => {
                html += `<li>${use}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>No information available</p>';
        }
        
        html += `</div>`;
        
        // Right column
        html += `<div class="col-md-6">`;
        
        // Recommended zoning (mock)
        html += `
            <div class="alert alert-info mb-4">
                <h5 class="mb-2">Recommended Zoning</h5>
                <p class="mb-0">${formatZoningType(zoningType)}</p>
            </div>
        `;
        
        // Restrictions
        html += `<h5 class="mt-4">Restrictions</h5>`;
        if (zoningInfo.restrictions && zoningInfo.restrictions.length > 0) {
            html += '<ul class="list-disc">';
            zoningInfo.restrictions.forEach(restriction => {
                html += `<li>${restriction}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>No information available</p>';
        }
        
        html += `
            <div class="mt-4 text-end">
                <small class="text-muted">Last updated: ${new Date().toLocaleDateString()}</small>
            </div>
        `;
        
        html += `</div>`;
        html += `</div>`;
        
        informationContent.innerHTML = html;
        
        // Smooth scroll to information
        informationCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
