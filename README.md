# UrbanMind

UrbanMind will one day change the way we process applications and deal with illegal developments and strategically un-aligned developments. The nature of planning is creative and in service to the needs of the city - not administrative & bureaucratic as modern planning has been reduced to development applications and paper pushing.

A Python Flask application that provides urban planning and zoning information based on GPS coordinates or ERF numbers.

## Features

- Input location data using GPS coordinates or ERF numbers
- Interactive map with Leaflet.js for visualizing locations
- Zoning insights for urban planning
- Responsive design with Bootstrap

## Technology Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript
- **Map**: Leaflet.js
- **Styling**: Bootstrap 5
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Python 3.8+
- Docker and Docker Compose (optional)

### Running with Docker (Recommended)

1. Clone the repository
2. Navigate to the project directory
3. Build and run with Docker Compose:

```bash
docker-compose up --build
```

The application will be available at http://localhost:5000

### Running Locally

1. Clone the repository
2. Navigate to the project directory
3. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Run the application:

```bash
python run.py
```

The application will be available at http://localhost:5000

## Project Structure

```
UrbanMind/
├── app/                    # Application package
│   ├── __init__.py         # App initialization
│   └── main/               # Main blueprint
│       ├── __init__.py     # Blueprint initialization
│       ├── forms.py        # Form definitions
│       └── routes.py       # Route handlers
├── static/                 # Static files
│   ├── css/                # CSS files
│   │   └── style.css       # Custom styles
│   ├── js/                 # JavaScript files
│   │   ├── app.js          # Main application logic
│   │   └── map.js          # Map handling logic
│   └── images/             # Image assets
├── templates/              # HTML templates
│   ├── base.html           # Base template
│   └── index.html          # Main page template
├── config.py               # Configuration settings
├── run.py                  # Application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
└── docker-compose.yml      # Docker Compose configuration
```

## Usage

1. Open the application in your browser
2. Choose input type (GPS Coordinates or ERF Number)
3. Enter the required information
4. Click "Get Information" to view zoning information
5. The map will update to show the selected location
6. Zoning information will be displayed below the map

## Mock Data

This demo version uses mock data for zoning information. In a production environment, this would be replaced with actual data from a GIS database or API.
