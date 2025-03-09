// Main application functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const locationForm = document.getElementById('location-form');
    const inputTypeRadios = document.querySelectorAll('input[name="input_type"]');
    const gpsInputs = document.getElementById('gps-inputs');
    const erfInputs = document.getElementById('erf-inputs');
    const insightsCard = document.getElementById('insights-card');
    const insightsContent = document.getElementById('insights-content');
    
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
        insightsContent.innerHTML = '<div class="loader"></div>';
        insightsCard.style.display = 'block';
        
        // Get form data
        const inputType = document.querySelector('input[name="input_type"]:checked').value;
        let requestData = {};
        
        if (inputType === 'gps') {
            const coordinates = document.getElementById('coordinates').value.trim();
            
            // Validate inputs
            if (!coordinates) {
                showError('Please enter valid GPS coordinates.');
                return;
            }
            
            requestData = { coordinates };
            
            // Don't update map marker here, it will be updated when we get the response
        } else {
            const erfNumber = document.getElementById('erf_number').value.trim();
            
            // Validate inputs
            if (!erfNumber) {
                showError('Please enter a valid ERF number.');
                return;
            }
            
            requestData = { erf: erfNumber };
        }
        
        // Send request to server
        fetch('/get_insights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update map marker with returned location
                if (data.location) {
                    updateMapMarker([data.location.lat, data.location.lng]);
                }
                
                // Display insights
                displayInsights(data);
            } else {
                showError(data.error || 'An error occurred while fetching insights.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred while fetching insights.');
        });
    });
    
    // Display error message
    function showError(message) {
        insightsContent.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `;
    }
    
    // Display zoning insights
    function displayInsights(data) {
        const zoningType = data.zoning_type;
        const zoningInfo = data.zoning_info;
        
        let locationInfo = '';
        if (data.erf_number) {
            locationInfo = `<p><strong>ERF Number:</strong> ${data.erf_number}</p>`;
        }
        locationInfo += `<p><strong>Coordinates:</strong> ${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)}</p>`;
        
        let permittedUsesList = '';
        if (zoningInfo.permitted_uses && zoningInfo.permitted_uses.length > 0) {
            permittedUsesList = '<ul class="zoning-info-list">' + 
                zoningInfo.permitted_uses.map(use => `<li>${use}</li>`).join('') + 
                '</ul>';
        }
        
        let restrictionsList = '';
        if (zoningInfo.restrictions && zoningInfo.restrictions.length > 0) {
            restrictionsList = '<ul class="zoning-info-list">' + 
                zoningInfo.restrictions.map(restriction => `<li>${restriction}</li>`).join('') + 
                '</ul>';
        }
        
        insightsContent.innerHTML = `
            <div class="zoning-${zoningType}">
                <h4 class="mb-3">Zoning Type: ${formatZoningType(zoningType)}</h4>
                ${locationInfo}
                <p>${zoningInfo.description || ''}</p>
                
                <h5 class="mt-4">Permitted Uses</h5>
                ${permittedUsesList}
                
                <h5 class="mt-4">Restrictions</h5>
                ${restrictionsList}
            </div>
        `;
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
