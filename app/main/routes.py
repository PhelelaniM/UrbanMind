from flask import render_template, request, jsonify
from app.main import bp
from app.main.forms import LocationForm
import json
import re

# Mock data for zoning information - in a real app, this would come from a database or API
ZONING_DATA = {
    "residential": {
        "description": "Areas designated for housing and related uses",
        "permitted_uses": ["Single-family homes", "Multi-family dwellings", "Townhouses"],
        "restrictions": ["Height limit: 3 stories", "Setback: 5m from street", "Coverage: 60% max"]
    },
    "commercial": {
        "description": "Areas designated for business and commercial activities",
        "permitted_uses": ["Retail stores", "Offices", "Restaurants", "Hotels"],
        "restrictions": ["Height limit: 5 stories", "Setback: 3m from street", "Coverage: 80% max"]
    },
    "industrial": {
        "description": "Areas designated for manufacturing and industrial activities",
        "permitted_uses": ["Factories", "Warehouses", "Distribution centers"],
        "restrictions": ["Height limit: 4 stories", "Setback: 10m from street", "Coverage: 70% max"]
    },
    "mixed_use": {
        "description": "Areas allowing a combination of residential and commercial uses",
        "permitted_uses": ["Residential units", "Retail on ground floor", "Offices"],
        "restrictions": ["Height limit: 6 stories", "Setback: 4m from street", "Coverage: 75% max"]
    }
}

# Mock function to determine zoning type based on coordinates
def get_zoning_for_location(lat, lng):
    # This is a simplified mock implementation
    # In a real app, this would query a GIS database or API
    
    # For demo purposes, we'll return different zoning types based on coordinate ranges
    if lat > 0 and lng > 0:
        return "residential"
    elif lat > 0 and lng < 0:
        return "commercial"
    elif lat < 0 and lng > 0:
        return "industrial"
    else:
        return "mixed_use"

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
            
            # Get zoning information for the location
            zoning_type = get_zoning_for_location(lat, lng)
            zoning_info = ZONING_DATA.get(zoning_type, {})
            
            return jsonify({
                'success': True,
                'location': {'lat': lat, 'lng': lng},
                'zoning_type': zoning_type,
                'zoning_info': zoning_info
            })
        
        # Handle ERF number (property identifier)
        elif 'erf' in data:
            erf_number = data['erf']
            
            # In a real app, you would look up the ERF in a database to get coordinates
            # For demo purposes, we'll generate mock coordinates based on the ERF number
            mock_lat = (int(erf_number) % 100) / 100.0
            mock_lng = (int(erf_number) % 50) / 50.0
            
            # Get zoning information for the location
            zoning_type = get_zoning_for_location(mock_lat, mock_lng)
            zoning_info = ZONING_DATA.get(zoning_type, {})
            
            return jsonify({
                'success': True,
                'location': {'lat': mock_lat, 'lng': mock_lng},
                'erf_number': erf_number,
                'zoning_type': zoning_type,
                'zoning_info': zoning_info
            })
        
        return jsonify({'success': False, 'error': 'Invalid input data'})
