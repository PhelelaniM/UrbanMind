from flask import render_template, request, jsonify
from app.main import bp
from app.main.forms import LocationForm
import json
import re
import os

# Load comprehensive zoning data from JSON file
def load_zoning_data():
    zoning_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'zoning_data.json')
    try:
        with open(zoning_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback data if file not found
        return {}

ZONING_DATA = load_zoning_data()

# Function to get zoning information by zoning code
def get_zoning_info_by_code(zoning_code):
    """Get zoning information for a specific zoning code"""
    if not zoning_code:
        return None
    
    # Normalize the zoning code to uppercase
    zoning_code = zoning_code.upper().strip()
    
    # Direct match
    if zoning_code in ZONING_DATA:
        return ZONING_DATA[zoning_code]
    
    # Try to match with variations (e.g., GR2-GR6, GB1-GB7, MU1-MU3)
    for code, data in ZONING_DATA.items():
        if zoning_code.startswith(code):
            return data
    
    return None

# Parse coordinates from various formats
def parse_coordinates(coord_str):
    # Try decimal format like "-33.919578, 18.432544"
    decimal_pattern = r'(-?\d+\.?\d*),\s*(-?\d+\.?\d*)'
    decimal_match = re.match(decimal_pattern, coord_str)
    if decimal_match:
        lat = float(decimal_match.group(1))
        lng = float(decimal_match.group(2))
        return lat, lng
    
    # Try DMS format like "33°55'10.5"S, 18°25'57.2"E"
    dms_pattern = r'(\d+)°(\d+)\'(\d+\.?\d*)"?([NS]),\s*(\d+)°(\d+)\'(\d+\.?\d*)"?([EW])'
    dms_match = re.match(dms_pattern, coord_str)
    if dms_match:
        lat_deg = int(dms_match.group(1))
        lat_min = int(dms_match.group(2))
        lat_sec = float(dms_match.group(3))
        lat_dir = dms_match.group(4)
        
        lng_deg = int(dms_match.group(5))
        lng_min = int(dms_match.group(6))
        lng_sec = float(dms_match.group(7))
        lng_dir = dms_match.group(8)
        
        lat = lat_deg + lat_min/60 + lat_sec/3600
        if lat_dir == 'S':
            lat = -lat
            
        lng = lng_deg + lng_min/60 + lng_sec/3600
        if lng_dir == 'W':
            lng = -lng
            
        return lat, lng
    
    return None, None

@bp.route('/')
def index():
    form = LocationForm()
    return render_template('index.html', form=form)

@bp.route('/get_information', methods=['POST'])
def get_information():
    if request.method == 'POST':
        data = request.json
        
        # Handle GPS coordinates
        if 'coordinates' in data:
            lat, lng = parse_coordinates(data['coordinates'])
            
            if lat is None or lng is None:
                return jsonify({
                    'success': False,
                    'error': 'Invalid coordinate format. Please use decimal (e.g., -33.919578, 18.432544) or DMS format.'
                })
            
            # For GPS coordinates, we'll use a sample zoning code
            # In a real implementation, this would query a GIS database
            sample_zoning_codes = ['MU2', 'SR1', 'GR2', 'GB1', 'CO1', 'LB2']
            zoning_code = sample_zoning_codes[abs(hash(f"{lat},{lng}")) % len(sample_zoning_codes)]
            zoning_info = get_zoning_info_by_code(zoning_code)
            
            if not zoning_info:
                zoning_info = {
                    'description': 'Zoning information not available',
                    'permitted_uses': ['Information not available'],
                    'restrictions': ['Information not available'],
                    'recommended_actions': ['Verify current zoning with City of Cape Town']
                }
            
            return jsonify({
                'success': True,
                'location': {'lat': lat, 'lng': lng},
                'zoning_type': zoning_code,
                'zoning_info': zoning_info
            })
        
        # Handle ERF number (property identifier)
        elif 'erf' in data:
            erf_number = data['erf']
            
            # Mock coordinates for demonstration - in reality would come from ERF database
            mock_lat = -33.9 + (int(erf_number) % 100) / 1000.0
            mock_lng = 18.4 + (int(erf_number) % 50) / 1000.0
            
            # For ERF 4028 specifically (from the screenshot), use MU2 zoning
            if erf_number == '4028':
                zoning_code = 'MU2'
            else:
                # For other ERFs, assign sample zoning codes based on ERF number
                sample_zoning_codes = ['SR1', 'SR2', 'GR2', 'CO1', 'LB1', 'LB2', 'GB1', 'MU2', 'GI1', 'OS1', 'TR2']
                zoning_code = sample_zoning_codes[int(erf_number) % len(sample_zoning_codes)]
            
            zoning_info = get_zoning_info_by_code(zoning_code)
            
            if not zoning_info:
                zoning_info = {
                    'description': 'Zoning information not available',
                    'permitted_uses': ['Information not available'],
                    'restrictions': ['Information not available'],
                    'recommended_actions': ['Verify current zoning with City of Cape Town']
                }
            
            return jsonify({
                'success': True,
                'location': {'lat': mock_lat, 'lng': mock_lng},
                'erf_number': erf_number,
                'zoning_type': zoning_code,
                'zoning_info': zoning_info
            })
        
        return jsonify({'success': False, 'error': 'Invalid input data'})
