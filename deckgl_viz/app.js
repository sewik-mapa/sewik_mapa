const { DeckGL, GeoJsonLayer, TileLayer, BitmapLayer, PolygonLayer } = deck;

class AccidentVisualization {
  constructor() {
    this.deckgl = null;
    this.currentData = null;
    this.metadata = null;
    this.fileIndex = null;
    
    // Cache for loaded GeoJSON files
    this.geoJsonCache = new Map();
    
    // Selection state
    this.selectedYears = new Set();
    this.selectedVoivodeships = new Set();
    
    // Persistent tooltip state
    this.persistentTooltip = null;
    this.selectedFeature = null;
    this.selectedFeatureId = null; // Track selected feature ID
    
    // Current language
    this.currentLanguage = 'pl';
    
    // Severity visibility state
    this.severityVisibility = {
      'Fatal': true,
      'Serious': true,
      'Slight': true,
      'DamageOnly': true
    };
    
    // Vehicle type filter states
    this.vehicleFilters = {
      pedestrian: false,
      motorcycle: false,
      bicycle: false,
      uto: false,
      uwr: false
    };
    
    // Pie filter state
    this.pieFilterEnabled = false;
    
    // Polygon analysis state
    this.analysisPolygons = [];
    this.isDrawingMode = false;
    this.currentDrawingPolygon = null;
    this.analysisResults = null;
    this.analysisVisible = false;

    // Translations
    this.translations = {
      en: {
        title: 'Road Accidents in Poland',
        languageLabel: 'Language / Język:',
        mapStyleLabel: 'Map Style:',
        yearsLabel: 'Years:',
        voivodeshipsLabel: 'Voivodeships:',
        showAll: 'Show All',
        clearAll: 'Clear All',
        pointSize: 'Point Size:',
        opacity: 'Opacity:',
        noDataLoaded: 'No data loaded',
        selection: 'Selection:',
        years: 'Years:',
        voivodeships: 'Voivodeships:',
        totalAccidents: 'Total Accidents:',
        displayed: 'Displayed:',
        severity: 'Severity:',
        damageOnly: 'Damage Only',
        slight: 'Slight',
        serious: 'Serious',
        fatal: 'Fatal',
        loadingData: 'Loading data...',
        accidentDetails: 'Accident Details',
        year: 'Year',
        voivodeship: 'Voivodeship:',
        city: 'City:',
        fatalities: 'Fatalities:',
        injuries: 'Injuries:',
        unknown: 'Unknown',
        accidentId: 'Accident ID:',
        date: 'Date:',
        casualties: 'Casualties:',
        fatal: 'Fatal',
        serious: 'Serious',
        slight: 'Slight',
        other: 'Damage Only',
        viewInSewik: 'View in SEWIK Database',
        clickToPin: 'Click to pin tooltip',
        showCategory: 'Show',
        hideCategory: 'Hide',
        severityControls: 'Severity Controls:',
        allVisible: 'All Visible',
        allHidden: 'All Hidden',
        downloadSelected: 'Download selected',
        vehicleFilters: 'Vehicle Type Filters:',
        pedestrian: 'Pedestrian',
        motorcycle: 'Motorcycle',
        bicycle: 'Bicycle',
        uto: 'E-scooters etc.',
        uwr: 'Human powered street vehicles',
        areaAnalysis: 'Area Analysis',
        drawPolygon: 'Draw Analysis Polygon',
        clearPolygons: 'Clear Polygons',
        analysisResults: 'Analysis Results',
        totalInArea: 'Total in Area:',
        byYear: 'By Year:',
        bySeverity: 'By Severity:',
        clickToStartDrawing: 'Click to start drawing polygon',
        clickToFinishDrawing: 'Click to finish polygon',
        polygonArea: 'Polygon Area:',
        noPolygonDrawn: 'No analysis polygon drawn',
        startDrawing: 'Start Drawing',
        finishDrawing: 'Finish Drawing',
        cancelDrawing: 'Finish Drawing',
        total: 'Total'
      },
      pl: {
        title: 'Wypadki drogowe w Polsce',
        languageLabel: 'Język / Language:',
        mapStyleLabel: 'Styl mapy:',
        yearsLabel: 'Lata:',
        voivodeshipsLabel: 'Województwa:',
        showAll: 'Pokaż Wszystkie',
        clearAll: 'Wyczyść wszystkie',
        pointSize: 'Rozmiar punktu:',
        opacity: 'Przezroczystość:',
        noDataLoaded: 'Brak załadowanych danych',
        selection: 'Wybór:',
        years: 'Lata',
        voivodeships: 'Województwa:',
        totalAccidents: 'Łączna liczba wypadków:',
        displayed: 'Wyświetlone:',
        severity: 'Ofiary:',
        damageOnly: 'Kolizje',
        slight: 'Lekkie',
        serious: 'Ciężkie',
        fatal: 'Śmiertelne',
        loadingData: 'Ładowanie danych...',
        accidentDetails: 'Szczegóły wypadku',
        year: 'Rok',
        voivodeship: 'Województwo:',
        city: 'Miasto:',
        fatalities: 'Ofiary śmiertelne:',
        injuries: 'Ranni:',
        unknown: 'Nieznane',
        accidentId: 'ID Wypadku:',
        date: 'Data:',
        casualties: 'Ofiary:',
        fatal_c: 'Śmiertelne',
        serious_c: 'Ciężko ranni',
        slight_c: 'Lekko ranni',
        other: 'Bez obrażeń',
        viewInSewik: 'Zobacz w bazie SEWIK',
        clickToPin: 'Kliknij aby przypiąć',
        showCategory: 'Pokaż',
        hideCategory: 'Ukryj',
        severityControls: 'Kategorie wypadków:',
        allVisible: 'Wszystkie widoczne',
        allHidden: 'Wszystkie ukryte',
        downloadSelected: 'Pobierz wybrane',
        vehicleFilters: 'Filtr użytkowników:',
        pedestrian: 'Pieszy',
        motorcycle: 'Motocyklista',
        bicycle: 'Rowerzysta',
        uto: 'Użytkownik UTO',
        uwr: 'Użytkownik UWR',
        areaAnalysis: 'Analiza obszaru',
        drawPolygon: 'Narysuj obszar analizy',
        clearPolygons: 'Wyczyść',
        analysisResults: 'Wyniki analizy',
        totalInArea: 'Łącznie w obszarze:',
        byYear: 'Według roku:',
        bySeverity: 'Według kategorii:',
        clickToStartDrawing: 'Kliknij aby rozpocząć rysowanie obszaru',
        clickToFinishDrawing: 'Kliknij aby zakończyć obszaru',
        polygonArea: 'Powierzchnia obszaru:',
        noPolygonDrawn: 'Nie narysowano obszaru analizy',
        startDrawing: 'Rozpocznij rysowanie',
        finishDrawing: 'Zakończ rysowanie i analizuj',
        cancelDrawing: 'Zakończ rysowanie i analizuj',
        total: 'Suma'
      }
    };
    
    // Pre-defined years and voivodeships (fallback values)
    this.years = [];
    this.voivodeships = [];
    
    // Voivodeship code to name mapping (will be populated from metadata)
    this.voivodeshipCodeToName = {};
    this.voivodeshipNameToCode = {};
    
    const attributionAndGit = '<a href="https://github.com/sewik-mapa/sewik_mapa" target="_blank">Github</a> | Dane: <a href="https://sewik.pl" target="_blank">System Ewidencji Wypadków i Kolizji</a><br>'

    // Available map styles
    this.mapStyles = {
      'openstreetmap': {
        name: 'OpenStreetMap',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: attributionAndGit + '© OpenStreetMap contributors',
        bodyColor: '#f0f0f0',
        mapDependentBorderColorSelected:  'rgba(0, 0, 0, 1)',
        mapDependentBorderColor:  'rgba(70, 70, 70, 1)',
      },
      'satellite': {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: attributionAndGit + 'Esri, Maxar, GeoEye, Earthstar Geographics',
        bodyColor: '#1a1a1a',
        mapDependentBorderColorSelected:  'rgba(255, 255, 255, 1)',
        mapDependentBorderColor:  'rgba(167, 167, 167, 1)',
      },
      'cartodb-light': {
        name: 'CartoDB Light',
        url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        attribution: attributionAndGit + '© OpenStreetMap contributors © CARTO',
        bodyColor: '#f5f5f5',
        mapDependentBorderColorSelected:  'rgba(0, 0, 0, 1)',
        mapDependentBorderColor:  'rgba(70, 70, 70, 1)',
      },
      'cartodb-dark': {
        name: 'CartoDB Dark',
        url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        attribution: attributionAndGit + '© OpenStreetMap contributors © CARTO',
        bodyColor: 'rgba(44, 44, 44, 1)',
        mapDependentBorderColorSelected:  'rgba(255, 255, 255, 1)',
        mapDependentBorderColor:  'rgba(167, 167, 167, 1)',
      }
    };
    
    this.currentMapStyle = 'cartodb-light';
    
    // Severity mapping
    this.severityMapping = {
      0: 'DamageOnly',
      1: 'Slight', 
      2: 'Serious',
      3: 'Fatal'
    };
    
    // UI state
    this.controlPanelVisible = true;
    
    // URL state management
    this.isInitializing = true; // Prevent URL updates during initialization
    this.updateUrlTimeout = null; // Debounce URL updates
    this.currentViewState = null; // Store current view state
    
    this.init();
  }
  
  async init() {
    try {
      // Initialize deck.gl first
      this.initDeckGL();
      
      // Setup controls with pre-defined data
      this.setupControls();
      
      // Read URL parameters first, then set defaults if nothing specified
      this.readUrlParameters();
      
      // If no URL parameters, set default selections
      if (this.selectedYears.size === 0 && this.selectedVoivodeships.size === 0) {
        this.setDefaultSelections();
      }
      
      // Try to load metadata and file index (optional)
      await this.loadMetadata();
      
      // Load initial data
      await this.loadData();
      
      // Enable URL updates after initialization with a small delay
      setTimeout(() => {
        this.isInitializing = false;
        console.log('Initialization complete - URL updates now enabled');
      }, 1000); // 1 second delay to ensure everything is fully loaded
      
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  }
  
  setDefaultSelections() {
    // Select the last year by default
    if (this.years.length > 0) {
      const lastYear = Math.max(...this.years);
      this.selectedYears.add(lastYear);
    }
    
    // Select the first voivodeship by default
    // if (this.voivodeships.length > 0) {
    //   this.selectedVoivodeships.add(this.voivodeships[0]);
    // }
    
    this.updateButtonStates();
  }
  
  async loadMetadata() {
    try {
      const [metadataResponse, indexResponse] = await Promise.all([
        fetch('metadata.json'),
        fetch('data/file_index.json')
      ]);
      
      this.metadata = await metadataResponse.json();
      this.fileIndex = await indexResponse.json();
      
      console.log('Loaded metadata:', this.metadata);
      console.log('Loaded file index:', this.fileIndex.length, 'files');
      
      // Update years from metadata
      if (this.metadata.years && this.metadata.years.length > 0) {
        this.years = this.metadata.years.sort((a, b) => b - a);
        console.log('Updated years from metadata:', this.years);
      } else {
        // Fallback years if not in metadata
        this.years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
        console.log('Using fallback years:', this.years);
      }
      
      // Handle voivodeships from metadata
      if (this.metadata.voivodeships) {
        if (typeof this.metadata.voivodeships === 'object' && !Array.isArray(this.metadata.voivodeships)) {
          // New format: dict with name: code mapping
          this.voivodeshipNameToCode = this.metadata.voivodeships;
          // Create reverse mapping: code to name
          this.voivodeshipCodeToName = {};
          Object.entries(this.metadata.voivodeships).forEach(([name, code]) => {
            this.voivodeshipCodeToName[code] = name;
          });
          // Use names for selection
          this.voivodeships = Object.keys(this.metadata.voivodeships).sort();
          console.log('Updated voivodeships from metadata (dict):', this.voivodeships);
          console.log('Code to name mapping:', this.voivodeshipCodeToName);
        } else if (Array.isArray(this.metadata.voivodeships)) {
          // Old format: array of names
          this.voivodeships = this.metadata.voivodeships.sort();
          console.log('Updated voivodeships from metadata (array):', this.voivodeships);
        }
      } else {
        // Fallback voivodeships if not in metadata
        this.voivodeships = [
          'DOLNOŚLĄSKIE',
          'KUJAWSKO-POMORSKIE',
          'LUBELSKIE',
          'LUBUSKIE',
          'ŁÓDZKIE',
          'MAŁOPOLSKIE',
          'MAZOWIECKIE',
          'OPOLSKIE',
          'PODKARPACKIE',
          'PODLASKIE',
          'POMORSKIE',
          'ŚLĄSKIE',
          'ŚWIĘTOKRZYSKIE',
          'WARMIŃSKO-MAZURSKIE',
          'WIELKOPOLSKIE',
          'ZACHODNIOPOMORSKIE'
        ];
        console.log('Using fallback voivodeships:', this.voivodeships);
      }
      
      // Recreate buttons with updated data
      this.createYearButtons();
      this.createVoivodeshipButtons();
      
      // Reset default selections with new data
      this.setDefaultSelections();
      
    } catch (error) {
      console.warn('Failed to load metadata, using pre-defined values:', error);
      // Set fallback values
      this.years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
      this.voivodeships = [
        'DOLNOŚLĄSKIE',
        'KUJAWSKO-POMORSKIE',
        'LUBELSKIE',
        'LUBUSKIE',
        'ŁÓDZKIE',
        'MAŁOPOLSKIE',
        'MAZOWIECKIE',
        'OPOLSKIE',
        'PODKARPACKIE',
        'PODLASKIE',
        'POMORSKIE',
        'ŚLĄSKIE',
        'ŚWIĘTOKRZYSKIE',
        'WARMIŃSKO-MAZURSKIE',
        'WIELKOPOLSKIE',
        'ZACHODNIOPOMORSKIE'
      ];
      this.metadata = {
        years: this.years,
        voivodeships: this.voivodeships
      };
      this.fileIndex = [];
    }
  }
  
  initDeckGL() {
    // Read initial view state from URL or use defaults
    const urlParams = new URLSearchParams(window.location.search);
    const initialViewState = {
      longitude: parseFloat(urlParams.get('lon')) || 19.5,
      latitude: parseFloat(urlParams.get('lat')) || 52.0,
      zoom: parseFloat(urlParams.get('zoom')) || 7,
      maxZoom: 18,
      minZoom: 1,
      pitch: 0,
      bearing: 0
    };

    console.log('Initial view state:', initialViewState);

    this.deckgl = new DeckGL({
      container: 'map',
      initialViewState: initialViewState,
      controller: true, // Simplified controller configuration
      getTooltip: this.getTooltip.bind(this),
      onClick: this.onClick.bind(this),
      onViewStateChange: this.handleViewStateChange.bind(this),
      layers: this.createLayers()
    });
  }

  handleViewStateChange({ viewState }) {
    console.log('View state changing:', viewState);
    console.log('Current lat:', viewState.latitude, 'lon:', viewState.longitude, 'zoom:', viewState.zoom);
    
    // Store the current view state
    this.currentViewState = {
      latitude: viewState.latitude,
      longitude: viewState.longitude,
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    };
    
    console.log('Stored view state:', this.currentViewState);
    
    // Hide persistent tooltip when map view changes
    this.hidePersistentTooltip();
    
    // Update URL with new view state (debounced)
    if (!this.isInitializing) {
      console.log('Calling updateUrlParameters from handleViewStateChange');
      this.updateUrlParameters();
    } else {
      console.log('Skipping URL update - still initializing');
    }
    
    // Return the viewState to allow deck.gl to update
    return viewState;
  }
  
  createTileLayer() {
    const style = this.mapStyles[this.currentMapStyle];
    
    return new TileLayer({
      id: 'tile-layer',
      data: style.url,
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      
      renderSubLayers: props => {
        const { tile } = props;
        const { x, y, z } = tile.index;
        const { west, south, east, north } = tile.bbox;
        
        // Create the tile URL
        const tileUrl = style.url
          .replace('{x}', x)
          .replace('{y}', y)
          .replace('{z}', z);
        
        return new BitmapLayer(props, {
          data: null,
          image: tileUrl,
          bounds: [west, south, east, north],
          // Add fade-in animation
          opacity: tile.isLoaded ? 1 : 0,
          transitions: {
            opacity: {
              duration: 300,
              easing: t => t * t * (3.0 - 2.0 * t) // smoothstep easing
            }
          }
        });
      },
      
      onTileError: (tile, error) => {
        console.warn('Tile error:', tile.index, error);
      }
    });
  }
  
  createLayers() {
    const layers = [this.createTileLayer()];
    
    // Define map-dependent border colors based on current map style
    const currentStyle = this.mapStyles[this.currentMapStyle];
    const mapDependentBorderColorSelected = currentStyle.mapDependentBorderColorSelected;
    const mapDependentBorderColor = currentStyle.mapDependentBorderColor;
    
    if (this.currentData && this.currentData.features.length > 0) {
      const radius = parseInt(document.getElementById('radius-slider')?.value || '5');
      const opacity = parseFloat(document.getElementById('opacity-slider')?.value || '0.6');
      
      // Filter features based on severity visibility and vehicle filters
      const visibleFeatures = this.currentData.features.filter(feature => {
        const severity = this.getSeverityFromFeature(feature);
        const severityVisible = this.severityVisibility[severity];
        
        // Check if any vehicle filters are enabled
        const anyVehicleFilterEnabled = Object.values(this.vehicleFilters).some(enabled => enabled);
        
        if (anyVehicleFilterEnabled) {
          const props = feature.properties;
          
          // Check each vehicle type filter
          let vehicleMatches = false;
          
          if (this.vehicleFilters.pedestrian && props.pie !== undefined && props.pie >= 0) {
            vehicleMatches = true;
          }
          if (this.vehicleFilters.motorcycle && props.mot !== undefined && props.mot >= 0) {
            vehicleMatches = true;
          }
          if (this.vehicleFilters.bicycle && props.row !== undefined && props.row >= 0) {
            vehicleMatches = true;
          }
          if (this.vehicleFilters.uto && props.uto !== undefined && props.uto >= 0) {
            vehicleMatches = true;
          }
          if (this.vehicleFilters.uwr && props.uwr !== undefined && props.uwr >= 0) {
            vehicleMatches = true;
          }
          
          return severityVisible && vehicleMatches;
        }
        
        return severityVisible;
      });
      
      const filteredData = {
        type: 'FeatureCollection',
        features: visibleFeatures
      };
      
      const accidentLayer = new GeoJsonLayer({
        id: 'accidents',
        data: filteredData,
        pointType: 'circle',
        getPointRadius: radius,
        getFillColor: d => d.properties.c || [255, 0, 0, 160],
        getLineColor: d => {
          // Highlight selected feature with thick black border
          const featureId = this.getFeatureId(d);
          if (this.selectedFeatureId && featureId === this.selectedFeatureId) {
            return mapDependentBorderColorSelected; // Selected border color
          }
          return mapDependentBorderColor; // Default border color
        },
        getLineWidth: d => {
          // Thicker border for selected feature
          const featureId = this.getFeatureId(d);
          if (this.selectedFeatureId && featureId === this.selectedFeatureId) {
            return 3; // Thick border for selected
          }
          return 1; // Default border width
        },
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 3,
        opacity: opacity,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 200]
      });
      
      layers.push(accidentLayer);
    }
    // Add polygon layers
    if (this.analysisPolygons.length > 0) {
      const polygonLayer = new PolygonLayer({
        id: 'analysis-polygons',
        data: this.analysisPolygons.map(polygon => ({
          polygon: polygon.coordinates[0]
        })),
        getPolygon: d => d.polygon,
        getFillColor: [0, 150, 255, 50],
        getLineColor: [0, 100, 200, 255],
        getLineWidth: 2,
        lineWidthMinPixels: 2,
        pickable: false
      });
      layers.push(polygonLayer);
    }
    
    // Add current drawing polygon
    if (this.currentDrawingPolygon && this.currentDrawingPolygon.length > 0) {
      const drawingData = [{
        polygon: this.currentDrawingPolygon.length >= 3 ? 
          [...this.currentDrawingPolygon, this.currentDrawingPolygon[0]] : 
          this.currentDrawingPolygon
      }];
      
      const drawingLayer = new PolygonLayer({
        id: 'drawing-polygon',
        data: drawingData,
        getPolygon: d => d.polygon,
        getFillColor: [255, 0, 0, 30],
        getLineColor: [255, 0, 0, 200],
        getLineWidth: 2,
        lineWidthMinPixels: 2,
        pickable: false
      });
      layers.push(drawingLayer);
    }    // Add polygon layers
    if (this.analysisPolygons.length > 0) {
      const polygonLayer = new PolygonLayer({
        id: 'analysis-polygons',
        data: this.analysisPolygons.map(polygon => ({
          polygon: polygon.coordinates[0]
        })),
        getPolygon: d => d.polygon,
        getFillColor: [0, 150, 255, 50],
        getLineColor: [0, 100, 200, 255],
        getLineWidth: 2,
        lineWidthMinPixels: 2,
        pickable: false
      });
      layers.push(polygonLayer);
    }
    
    // Add current drawing polygon
    if (this.currentDrawingPolygon && this.currentDrawingPolygon.length > 0) {
      const drawingData = [{
        polygon: this.currentDrawingPolygon.length >= 3 ? 
          [...this.currentDrawingPolygon, this.currentDrawingPolygon[0]] : 
          this.currentDrawingPolygon
      }];
      
      const drawingLayer = new PolygonLayer({
        id: 'drawing-polygon',
        data: drawingData,
        getPolygon: d => d.polygon,
        getFillColor: [255, 0, 0, 30],
        getLineColor: [255, 0, 0, 200],
        getLineWidth: 2,
        lineWidthMinPixels: 2,
        pickable: false
      });
      layers.push(drawingLayer);
    }
    
    return layers;
  }
  
  setupControls() {
    // Create year and voivodeship buttons
    this.createYearButtons();
    this.createVoivodeshipButtons();
    
    // Create severity control buttons
    this.createSeverityControls();
    
    // Populate map style dropdown
    this.updateMapStyleDropdown();
    
    // Create area analysis controls
    this.createAreaAnalysisControls();
        
    // Add event listeners with null checks
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.currentLanguage = e.target.value;
        this.updateLanguage();
        this.updateUrlParameters();
      });
    }
    
    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleSelect) {
      mapStyleSelect.addEventListener('change', (e) => {
        this.currentMapStyle = e.target.value;
        this.updateMapAttribution();
        this.updateBodyColor();
        this.updateUrlParameters();
        this.updateLayers();
      });
    }
    
    // Radius slider - add both 'input' and 'change' events for real-time updates
    const radiusSlider = document.getElementById('radius-slider');
    if (radiusSlider) {
      const updateRadius = (e) => {
        this.updateUrlParameters();
        this.updateLayers();
      };
      radiusSlider.addEventListener('input', updateRadius);
      radiusSlider.addEventListener('change', updateRadius);
    }
    
    // Opacity slider - add both 'input' and 'change' events for real-time updates
    const opacitySlider = document.getElementById('opacity-slider');
    if (opacitySlider) {
      const updateOpacity = (e) => {
        this.updateUrlParameters();
        this.updateLayers();
      };
      opacitySlider.addEventListener('input', updateOpacity);
      opacitySlider.addEventListener('change', updateOpacity);
    }
    
    // Initialize language
    this.updateLanguage();
  }
  
  createYearButtons() {
    const container = document.getElementById('year-buttons');
    if (!container) {
      console.warn('Year buttons container not found');
      return;
    }
    
    container.innerHTML = '';
    
    this.years.forEach(year => {
      const button = document.createElement('button');
      button.className = 'selection-button';
      button.textContent = year;
      button.onclick = () => this.toggleYear(year);
      container.appendChild(button);
    });
  }
  
  createVoivodeshipButtons() {
    const container = document.getElementById('voivodeship-buttons');
    if (!container) {
      console.warn('Voivodeship buttons container not found');
      return;
    }
    
    container.innerHTML = '';
    
    this.voivodeships.forEach(voivodeship => {
      const button = document.createElement('button');
      button.className = 'selection-button';
      button.textContent = voivodeship;
      button.title = voivodeship; // Full name on hover
      button.onclick = () => this.toggleVoivodeship(voivodeship);
      container.appendChild(button);
    });
  }
  

  createSeverityControls() {
    const container = document.getElementById('severity-controls');
    if (!container) {
      console.warn('Severity controls container not found');
      return;
    }
    
    container.innerHTML = '';
    
    const severityOrder = ['Fatal', 'Serious', 'Slight', 'DamageOnly'];
    const severityColors = {
      'Fatal': 'rgb(139, 0, 0)',
      'Serious': 'rgb(255, 136, 0)',
      'Slight': 'rgb(255, 204, 0)',
      'DamageOnly': 'rgb(128, 128, 128)'
    };
    
    severityOrder.forEach(severity => {
      const controlDiv = document.createElement('div');
      controlDiv.className = 'severity-control';
      controlDiv.style.cssText = 'display: flex; align-items: center; margin: 5px 0; padding: 5px; border-radius: 4px; background: rgba(255,255,255,0.1);';
      
      const colorIndicator = document.createElement('div');
      colorIndicator.style.cssText = `
        width: 16px;
        height: 16px;
        background-color: ${severityColors[severity]};
        margin-right: 8px;
        border-radius: 50%;
        border: 2px solid white;
      `;
      
      const label = document.createElement('span');
      label.style.cssText = 'flex: 1; margin-right: 8px; font-size: 12px;';
      label.textContent = this.getSeverityDisplayName(severity);
      label.id = `severity-label-${severity}`;
      
      const countSpan = document.createElement('span');
      countSpan.style.cssText = 'margin-right: 8px; font-size: 11px; color: #ccc; min-width: 40px; text-align: right;';
      countSpan.textContent = '0';
      countSpan.id = `severity-count-${severity}`;
      
      const button = document.createElement('button');
      button.className = 'severity-toggle-button';
      button.style.cssText = `
        padding: 2px 8px;
        font-size: 10px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        min-width: 50px;
      `;
      
      button.onclick = () => this.toggleSeverityVisibility(severity);
      button.id = `severity-button-${severity}`;
      
      controlDiv.appendChild(colorIndicator);
      controlDiv.appendChild(label);
      controlDiv.appendChild(countSpan);
      controlDiv.appendChild(button);
      container.appendChild(controlDiv);
    });
    
    // Add vehicle filter controls after severity buttons
    this.createVehicleFilterControls(container);
    
    this.updateSeverityButtonStates();
  }
  
  
createVehicleFilterControls(container) {
    const t = this.translations[this.currentLanguage];
    
    // Create section header
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.3);';
    
    const headerLabel = document.createElement('span');
    headerLabel.style.cssText = 'font-size: 12px; font-weight: bold; color: #333;';
    headerLabel.textContent = t.vehicleFilters;
    headerLabel.id = 'vehicle-filters-label';
    
    headerDiv.appendChild(headerLabel);
    container.appendChild(headerDiv);
    
    // Vehicle filter mappings
    const vehicleTypes = [
      { key: 'pedestrian', property: 'pie' },
      { key: 'motorcycle', property: 'mot' },
      { key: 'bicycle', property: 'row' },
      { key: 'uto', property: 'uto' },
      { key: 'uwr', property: 'uwr' }
    ];
    
    vehicleTypes.forEach(vehicleType => {
      const controlDiv = document.createElement('div');
      controlDiv.className = 'vehicle-filter-control';
      controlDiv.style.cssText = 'display: flex; align-items: center; margin: 3px 0; padding: 5px; border-radius: 3px; background: rgba(255,255,255,0.1);';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `${vehicleType.key}-filter-checkbox`;
      checkbox.checked = this.vehicleFilters[vehicleType.key];
      checkbox.style.cssText = 'margin-right: 8px; transform: scale(1.1);';
      checkbox.addEventListener('change', (e) => {
        this.vehicleFilters[vehicleType.key] = e.target.checked;
        this.updateUrlParameters();
        this.updateLayers();
        
        // Recalculate polygon analysis if there's an active polygon
        if (this.analysisPolygons.length > 0) {
          const latestPolygon = this.analysisPolygons[this.analysisPolygons.length - 1];
          this.analyzePolygonArea(latestPolygon);
        }
      });
      
      const label = document.createElement('label');
      label.htmlFor = `${vehicleType.key}-filter-checkbox`;
      label.style.cssText = 'flex: 1; font-size: 11px; cursor: pointer;';
      label.textContent = t[vehicleType.key];
      label.id = `${vehicleType.key}-filter-label`;
      
      controlDiv.appendChild(checkbox);
      controlDiv.appendChild(label);
      container.appendChild(controlDiv);
    });
    
    // Add separator
    const separator = document.createElement('div');
    separator.style.cssText = 'margin: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);';
    container.appendChild(separator);
  }
  
  createAreaAnalysisControls() {
    // Create floating polygon button
    const polygonButton = document.createElement('div');
    polygonButton.id = 'polygon-button';
    polygonButton.className = 'floating-button';
    polygonButton.innerHTML = '⬟';
    polygonButton.title = 'Area Analysis Tool';
    polygonButton.onclick = () => this.toggleDrawingMode();
    
    // Create analysis panel
    const analysisPanel = document.createElement('div');
    analysisPanel.id = 'analysis-panel';
    analysisPanel.className = 'analysis-panel hidden';
    analysisPanel.innerHTML = `
      <div class="analysis-header">
        <h4 id="analysis-title">Area Analysis</h4>
        <button onclick="app.toggleAnalysisPanel()" class="close-button">×</button>
      </div>
      <div class="analysis-content">
        <div class="analysis-controls">
          <button id="draw-polygon-btn" onclick="app.toggleDrawingMode()" class="analysis-button">
            <span id="draw-polygon-text">Start Drawing</span>
          </button>
          <button id="clear-polygons-btn" onclick="app.clearPolygons()" class="analysis-button secondary">
            <span id="clear-polygons-text">Clear Polygons</span>
          </button>
        </div>
        <div id="analysis-results" class="analysis-results">
          <div id="no-polygon-message">No analysis polygon drawn</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(polygonButton);
    document.body.appendChild(analysisPanel);
    
    // Add click handler for map to handle polygon drawing
    this.setupPolygonDrawing();
  }
  
  setupPolygonDrawing() {
    // Store original onClick handler
    this.originalOnClick = this.onClick.bind(this);
    
    // Add keyboard event listener for ESC to cancel drawing
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isDrawingMode) {
        this.cancelDrawing();
      }
    });
  }
  
  toggleDrawingMode() {
    this.isDrawingMode = !this.isDrawingMode;
    
    if (this.isDrawingMode) {
      this.startDrawing();
    } else {
      this.finishDrawing();
    }
    
    this.updateDrawingUI();
  }
  
  startDrawing() {
    this.currentDrawingPolygon = [];
    this.isDrawingMode = true;
    
    // Show analysis panel
    this.analysisVisible = true;
    this.updateAnalysisPanel();
    
    // Change cursor
    document.getElementById('map').style.cursor = 'crosshair';
  }
  
  finishDrawing() {
    if (this.currentDrawingPolygon && this.currentDrawingPolygon.length >= 3) {
      // Close the polygon by adding the first point at the end
      const closedPolygon = [...this.currentDrawingPolygon, this.currentDrawingPolygon[0]];
      
      const polygon = {
        id: Date.now(),
        coordinates: [closedPolygon],
        type: 'Polygon'
      };
      
      this.analysisPolygons.push(polygon);
      this.analyzePolygonArea(polygon);
    }
    
    this.currentDrawingPolygon = null;
    this.isDrawingMode = false;
    
    // Reset cursor
    document.getElementById('map').style.cursor = 'default';
    
    this.updateLayers();
  }
  
  cancelDrawing() {
    this.currentDrawingPolygon = null;
    this.isDrawingMode = false;
    
    // Reset cursor
    document.getElementById('map').style.cursor = 'default';
    
    this.updateDrawingUI();
    this.updateLayers();
  }
  
  clearPolygons() {
    this.analysisPolygons = [];
    this.currentDrawingPolygon = null;
    this.isDrawingMode = false;
    this.analysisResults = null;
    this.updateLayers();
  }
  
  toggleAnalysisPanel() {
    this.analysisVisible = !this.analysisVisible;
    this.updateAnalysisPanel();
  }
  
  updateDrawingUI() {
    const drawButton = document.getElementById('draw-polygon-btn');
    const drawText = document.getElementById('draw-polygon-text');
    const t = this.translations[this.currentLanguage];
    
    if (drawButton && drawText) {
      if (this.isDrawingMode) {
        drawButton.className = 'analysis-button danger';
        drawText.textContent = t.cancelDrawing;
      } else {
        drawButton.className = 'analysis-button';
        drawText.textContent = t.startDrawing;
      }
    }
  }
  
  updateAnalysisPanel() {
    const panel = document.getElementById('analysis-panel');
    if (panel) {
      if (this.analysisVisible) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    }
  }
  
  analyzePolygonArea(polygon) {
    if (!this.currentData || !this.currentData.features) {
      this.analysisResults = { total: 0, byYear: {}, bySeverity: {} };
      this.updateAnalysisResults();
      return;
    }
    
    // Filter features first based on severity visibility and vehicle filters (same as layer filtering)
    const visibleFeatures = this.currentData.features.filter(feature => {
      const severity = this.getSeverityFromFeature(feature);
      const severityVisible = this.severityVisibility[severity];
      
      // Check if any vehicle filters are enabled
      const anyVehicleFilterEnabled = Object.values(this.vehicleFilters).some(enabled => enabled);
      
      if (anyVehicleFilterEnabled) {
        const props = feature.properties;
        
        // Check each vehicle type filter
        let vehicleMatches = false;
        
        if (this.vehicleFilters.pedestrian && props.pie !== undefined && props.pie >= 0) {
          vehicleMatches = true;
        }
        if (this.vehicleFilters.motorcycle && props.mot !== undefined && props.mot >= 0) {
          vehicleMatches = true;
        }
        if (this.vehicleFilters.bicycle && props.row !== undefined && props.row >= 0) {
          vehicleMatches = true;
        }
        if (this.vehicleFilters.uto && props.uto !== undefined && props.uto >= 0) {
          vehicleMatches = true;
        }
        if (this.vehicleFilters.uwr && props.uwr !== undefined && props.uwr >= 0) {
          vehicleMatches = true;
        }
        
        return severityVisible && vehicleMatches;
      }
      
      return severityVisible;
    });
    
    // Then filter by polygon
    const pointsInPolygon = visibleFeatures.filter(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      return this.isPointInPolygon([lon, lat], polygon.coordinates[0]);
    });
    
    // Calculate statistics
    const byYear = {};
    const bySeverity = { Fatal: 0, Serious: 0, Slight: 0, DamageOnly: 0 };
    
    pointsInPolygon.forEach(feature => {
      const year = feature.properties.yr || 'Unknown';
      const severity = this.getSeverityFromFeature(feature);
      
      byYear[year] = (byYear[year] || 0) + 1;
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;
    });
    
    this.analysisResults = {
      total: pointsInPolygon.length,
      byYear: byYear,
      bySeverity: bySeverity
    };
    
    this.updateAnalysisResults();
  }
  
  isPointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }
  
  // ...existing code...
  
    updateAnalysisResults() {
      const resultsDiv = document.getElementById('analysis-results');
      const noPolygonMessage = document.getElementById('no-polygon-message');
      const t = this.translations[this.currentLanguage];
      
      if (!resultsDiv) return;
      
      if (!this.analysisResults || this.analysisResults.total === 0) {
        if (noPolygonMessage) {
          noPolygonMessage.textContent = t.noPolygonDrawn;
          noPolygonMessage.style.display = 'block';
        }
        
        // Clear any existing results table
        const existingTable = resultsDiv.querySelector('.results-table');
        if (existingTable) {
          existingTable.remove();
        }
        return;
      }
      
      // Hide no polygon message
      if (noPolygonMessage) {
        noPolygonMessage.style.display = 'none';
      }
      
      // Create results table
      let tableHtml = `
        <div class="results-table">
          <h5>${t.analysisResults}</h5>
          <div class="result-item">
            <strong>${t.totalInArea}</strong> ${this.analysisResults.total.toLocaleString()}
          </div>
          
          <h6>${t.bySeverity}</h6>
          <table class="severity-table">
      `;
      
      // Add severity rows
      const severityOrder = ['Fatal', 'Serious', 'Slight', 'DamageOnly'];
      severityOrder.forEach(severity => {
        const count = this.analysisResults.bySeverity[severity] || 0;
        const percentage = this.analysisResults.total > 0 ? (count / this.analysisResults.total * 100).toFixed(1) : 0;
        tableHtml += `
          <tr>
            <td>${this.getSeverityDisplayName(severity)}</td>
            <td>${count.toLocaleString()}</td>
            <td>(${percentage}%)</td>
          </tr>
        `;
      });
      
      tableHtml += `
          </table>
          
          <h6>${t.byYear}</h6>
          <table class="year-table">
            <thead>
              <tr>
                <th>${t.year}</th>
                <th>${this.getSeverityDisplayName('Fatal')}</th>
                <th>${this.getSeverityDisplayName('Serious')}</th>
                <th>${this.getSeverityDisplayName('Slight')}</th>
                <th>${this.getSeverityDisplayName('DamageOnly')}</th>
                <th>${t.total}</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Calculate year-severity breakdown
      const yearSeverityBreakdown = {};
      
      // Initialize the breakdown structure
      Object.keys(this.analysisResults.byYear).forEach(year => {
        yearSeverityBreakdown[year] = {
          Fatal: 0,
          Serious: 0,
          Slight: 0,
          DamageOnly: 0,
          total: this.analysisResults.byYear[year]
        };
      });
      
      // Re-analyze the polygon to get detailed breakdown by year and severity
      if (this.currentData && this.currentData.features && this.analysisPolygons.length > 0) {
        const polygon = this.analysisPolygons[this.analysisPolygons.length - 1]; // Use latest polygon
        
        // Filter features based on current filters
        const visibleFeatures = this.currentData.features.filter(feature => {
          const severity = this.getSeverityFromFeature(feature);
          const severityVisible = this.severityVisibility[severity];
          
          const anyVehicleFilterEnabled = Object.values(this.vehicleFilters).some(enabled => enabled);
          
          if (anyVehicleFilterEnabled) {
            const props = feature.properties;
            let vehicleMatches = false;
            
            if (this.vehicleFilters.pedestrian && props.pie !== undefined && props.pie >= 0) {
              vehicleMatches = true;
            }
            if (this.vehicleFilters.motorcycle && props.mot !== undefined && props.mot >= 0) {
              vehicleMatches = true;
            }
            if (this.vehicleFilters.bicycle && props.row !== undefined && props.row >= 0) {
              vehicleMatches = true;
            }
            if (this.vehicleFilters.uto && props.uto !== undefined && props.uto >= 0) {
              vehicleMatches = true;
            }
            if (this.vehicleFilters.uwr && props.uwr !== undefined && props.uwr >= 0) {
              vehicleMatches = true;
            }
            
            return severityVisible && vehicleMatches;
          }
          
          return severityVisible;
        });
        
        // Filter by polygon and count by year and severity
        visibleFeatures.forEach(feature => {
          const [lon, lat] = feature.geometry.coordinates;
          if (this.isPointInPolygon([lon, lat], polygon.coordinates[0])) {
            const year = feature.properties.yr || 'Unknown';
            const severity = this.getSeverityFromFeature(feature);
            
            if (yearSeverityBreakdown[year]) {
              yearSeverityBreakdown[year][severity] = (yearSeverityBreakdown[year][severity] || 0) + 1;
            }
          }
        });
      }
      
      // Add year rows (sorted)
      const sortedYears = Object.keys(yearSeverityBreakdown).sort((a, b) => b - a);
      sortedYears.forEach(year => {
        const yearData = yearSeverityBreakdown[year];
        tableHtml += `
          <tr>
            <td><strong>${year}</strong></td>
            <td style="color: rgb(139, 0, 0);">${yearData.Fatal || 0}</td>
            <td style="color: rgb(255, 136, 0);">${yearData.Serious || 0}</td>
            <td style="color: rgb(255, 204, 0);">${yearData.Slight || 0}</td>
            <td style="color: rgb(128, 128, 128);">${yearData.DamageOnly || 0}</td>
            <td><strong>${yearData.total || 0}</strong></td>
          </tr>
        `;
      });
      
      tableHtml += `
            </tbody>
          </table>
        </div>
      `;
      
      // Remove existing table and add new one
      const existingTable = resultsDiv.querySelector('.results-table');
      if (existingTable) {
        existingTable.remove();
      }
      
      resultsDiv.insertAdjacentHTML('beforeend', tableHtml);
    }
  
  // ...existing code...

  toggleYear(year) {
    if (this.selectedYears.has(year)) {
      this.selectedYears.delete(year);
    } else {
      this.selectedYears.add(year);
    }
    this.updateButtonStates();
    this.updateUrlParameters();
    this.loadData();
  }
  
  toggleVoivodeship(voivodeship) {
    if (this.selectedVoivodeships.has(voivodeship)) {
      this.selectedVoivodeships.delete(voivodeship);
    } else {
      this.selectedVoivodeships.add(voivodeship);
    }
    this.updateButtonStates();
    this.updateUrlParameters();
    this.loadData();
  }
  
  toggleSeverityVisibility(severity) {
    this.severityVisibility[severity] = !this.severityVisibility[severity];
    this.updateSeverityButtonStates();
    this.updateUrlParameters();
    this.updateLayers();
    
    // Recalculate polygon analysis if there's an active polygon
    if (this.analysisPolygons.length > 0) {
      const latestPolygon = this.analysisPolygons[this.analysisPolygons.length - 1];
      this.analyzePolygonArea(latestPolygon);
    }
  }
  
  clearYearSelection() {
    this.selectedYears.clear();
    this.updateButtonStates();
    this.updateUrlParameters();
    this.loadData();
  }
  
  clearVoivodeshipSelection() {
    this.selectedVoivodeships.clear();
    this.updateButtonStates();
    this.updateUrlParameters();
    this.loadData();
  }
  
  showAllYears() {
    this.selectedYears.clear();
    this.years.forEach(year => this.selectedYears.add(year));
    this.updateButtonStates();
    this.updateUrlParameters();
    this.loadData();
  }
  
  showAllVoivodeships() {
    this.selectedVoivodeships.clear();
    this.voivodeships.forEach(voivodeship => this.selectedVoivodeships.add(voivodeship));
    this.updateButtonStates();
    this.updateUrlParameters();
    this.loadData();
  }
  
  showAllSeverities() {
    Object.keys(this.severityVisibility).forEach(severity => {
      this.severityVisibility[severity] = true;
    });
    this.updateSeverityButtonStates();
    this.updateUrlParameters();
    this.updateLayers();
  }
  
  hideAllSeverities() {
    Object.keys(this.severityVisibility).forEach(severity => {
      this.severityVisibility[severity] = false;
    });
    this.updateSeverityButtonStates();
    this.updateUrlParameters();
    this.updateLayers();
  }
  
  updateButtonStates() {
    // Update year buttons
    const yearButtons = document.querySelectorAll('#year-buttons .selection-button');
    yearButtons.forEach(button => {
      const year = parseInt(button.textContent);
      if (this.selectedYears.has(year)) {
        button.classList.add('selected');
      } else {
        button.classList.remove('selected');
      }
    });
    
    // Update voivodeship buttons
    const voivodeshipButtons = document.querySelectorAll('#voivodeship-buttons .selection-button');
    voivodeshipButtons.forEach(button => {
      const voivodeship = button.textContent;
      if (this.selectedVoivodeships.has(voivodeship)) {
        button.classList.add('selected');
      } else {
        button.classList.remove('selected');
      }
    });
  }
  
  updateSeverityButtonStates() {
    const t = this.translations[this.currentLanguage];
    
    // Calculate current severity counts
    const severityCounts = { DamageOnly: 0, Slight: 0, Serious: 0, Fatal: 0 };
    if (this.currentData && this.currentData.features) {
      this.currentData.features.forEach(feature => {
        const severity = this.getSeverityFromFeature(feature);
        if (severityCounts.hasOwnProperty(severity)) {
          severityCounts[severity]++;
        }
      });
    }
    
    Object.keys(this.severityVisibility).forEach(severity => {
      const button = document.getElementById(`severity-button-${severity}`);
      const label = document.getElementById(`severity-label-${severity}`);
      const countSpan = document.getElementById(`severity-count-${severity}`);
      
      if (button && label) {
        const isVisible = this.severityVisibility[severity];
        
        button.textContent = isVisible ? t.hideCategory : t.showCategory;
        button.style.backgroundColor = isVisible ? '#ff4444' : '#4CAF50';
        button.style.color = 'white';
        
        // Update label text with current language
        label.textContent = this.getSeverityDisplayName(severity);
        
        // Update count
        if (countSpan) {
          const count = severityCounts[severity] || 0;
          countSpan.textContent = `${count.toLocaleString()}`;
          countSpan.style.color = '#000000ff';
        }
        
        // Update visual state
        const controlDiv = button.parentElement;
        controlDiv.style.opacity = isVisible ? '1' : '0.5';
      }
    });
  }
  
  updateMapStyleDropdown() {
    const mapStyleSelect = document.getElementById('map-style-select');
    if (!mapStyleSelect) {
      console.warn('Map style select not found');
      return;
    }
    
    mapStyleSelect.innerHTML = '';
    
    Object.entries(this.mapStyles).forEach(([key, style]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = style.name;
      mapStyleSelect.appendChild(option);
    });
    
    mapStyleSelect.value = this.currentMapStyle;
    this.updateMapAttribution();
    this.updateBodyColor();
  }
  
  updateMapAttribution() {
    const attributionElement = document.getElementById('map-attribution');
    const currentStyle = this.mapStyles[this.currentMapStyle];
    
    if (attributionElement && currentStyle) {
      attributionElement.innerHTML = currentStyle.attribution;
    }
  }

  updateBodyColor() {
    const currentStyle = this.mapStyles[this.currentMapStyle];
    if (currentStyle && currentStyle.bodyColor) {
      document.body.style.backgroundColor = currentStyle.bodyColor;
    }
  }
  
  toggleControlPanel() {
    this.controlPanelVisible = !this.controlPanelVisible;
    const panel = document.getElementById('control-panel');
    const toggleButton = document.getElementById('toggle-button');
    
    if (!panel || !toggleButton) {
      console.warn('Control panel or toggle button not found');
      return;
    }
    
    if (this.controlPanelVisible) {
      panel.classList.remove('hidden');
      toggleButton.classList.remove('panel-hidden');
      toggleButton.innerHTML = '☰';
    } else {
      panel.classList.add('hidden');
      toggleButton.classList.add('panel-hidden');
      toggleButton.innerHTML = '→';
    }
    
    // Update URL to reflect panel state
    this.updateUrlParameters();
  }
  
  async loadData() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'block';
    }
    
    try {
      const selectedYears = Array.from(this.selectedYears);
      const selectedVoivodeships = Array.from(this.selectedVoivodeships);
      
      console.log(`Loading data for years: [${selectedYears.join(', ')}], voivodeships: [${selectedVoivodeships.join(', ')}]`);
      
      if (selectedYears.length === 0 || selectedVoivodeships.length === 0) {
        this.currentData = { type: 'FeatureCollection', features: [] };
        this.updateLayers();
        if (loading) {
          loading.innerHTML = 'Loading data...';
        }
        return;
      }
      
      // Generate files to load
      let filesToLoad = [];
      
      if (this.fileIndex && this.fileIndex.length > 0) {
        filesToLoad = this.fileIndex.filter(file => 
          selectedYears.includes(file.year) && 
          selectedVoivodeships.includes(file.voivodeship)
        );
      } else {
        // Generate expected filenames
        for (const voivodeship of selectedVoivodeships) {
          for (const year of selectedYears) {
            const filename = `accidents_${year}_${voivodeship}.geojson`;
            filesToLoad.push({
              filename: filename,
              year: year,
              voivodeship: voivodeship
            });
          }
        }
      }
      
      console.log(`Attempting to load ${filesToLoad.length} files...`);
      
      // Load and combine GeoJSON files
      const features = [];
      let totalAccidents = 0;
      const severityCounts = { DamageOnly: 0, Slight: 0, Serious: 0, Fatal: 0 };
      let successfulLoads = 0;
      
      // Process all files (no limit)
      for (let i = 0; i < filesToLoad.length; i++) {
        const fileInfo = filesToLoad[i];
        
        // Update loading progress
        if (loading) {
          loading.innerHTML = `Loading file ${i + 1}/${filesToLoad.length}...<br>${fileInfo.filename}`;
        }
        
        try {
          // Check cache first
          if (this.geoJsonCache.has(fileInfo.filename)) {
            console.log(`Using cached data for ${fileInfo.filename}`);
            const geojson = this.geoJsonCache.get(fileInfo.filename);
            
            if (geojson.features && geojson.features.length > 0) {
              features.push(...geojson.features);
              successfulLoads++;
              
              // Count accidents and severity
              geojson.features.forEach(feature => {
                totalAccidents++;
                const severity = this.getSeverityFromFeature(feature);
                if (severityCounts.hasOwnProperty(severity)) {
                  severityCounts[severity]++;
                }
              });
            }
            continue;
          }
          
          const response = await fetch(`data/${fileInfo.filename}`);
          
          if (!response.ok) {
            console.warn(`File not found: ${fileInfo.filename}`);
            continue;
          }
          
          const geojson = await response.json();
          
          // Cache the loaded data
          this.geoJsonCache.set(fileInfo.filename, geojson);
          
          if (geojson.features && geojson.features.length > 0) {
            features.push(...geojson.features);
            successfulLoads++;
            
            // Count accidents and severity
            geojson.features.forEach(feature => {
              totalAccidents++;
              const severity = this.getSeverityFromFeature(feature);
              if (severityCounts.hasOwnProperty(severity)) {
                severityCounts[severity]++;
              }
            });
          }
          
        } catch (error) {
          console.warn(`Failed to load ${fileInfo.filename}:`, error);
        }
      }
      
      this.currentData = {
        type: 'FeatureCollection',
        features: features
      };
      
      console.log(`Successfully loaded ${successfulLoads} files with ${features.length} accident points`);
      
      this.updateLayers();
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      if (loading) {
        loading.style.display = 'none';
        loading.innerHTML = 'Loading data...';
      }
    }
  }
  
  updateLayers() {
    this.deckgl.setProps({ layers: this.createLayers() });
    // Update severity counts when layers change
    this.updateSeverityButtonStates();
  }
  
  updateLanguage() {
    const t = this.translations[this.currentLanguage];
    
    // Update document title
    document.title = t.title;
    
    // Update main UI elements with null checks
    const title = document.getElementById('title');
    if (title) title.textContent = t.title;
    
    // Update language and map style controls with compact horizontal layout
    const languageLabel = document.getElementById('language-label');
    const languageSelect = document.getElementById('language-select');
    if (languageLabel && languageSelect) {
      languageLabel.innerHTML = `${t.languageLabel} `;
      languageLabel.style.cssText = 'display: inline-block; margin-right: 5px;';
      languageSelect.style.cssText = 'display: inline-block; width: auto;';
    }
    
    const mapStyleLabel = document.getElementById('map-style-label');
    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleLabel && mapStyleSelect) {
      mapStyleLabel.innerHTML = `${t.mapStyleLabel} `;
      mapStyleLabel.style.cssText = 'display: inline-block; margin-right: 5px;';
      mapStyleSelect.style.cssText = 'display: inline-block; width: auto;';
    }
    
    const yearsLabel = document.getElementById('years-label');
    if (yearsLabel) {
      yearsLabel.innerHTML = `
        ${t.yearsLabel}
        <button class="show-button" onclick="app.showAllYears()" id="show-all-years">${t.showAll}</button>
        <button class="clear-button" onclick="app.clearYearSelection()" id="clear-all-years">${t.clearAll}</button>
      `;
    }
    
    const voivodeshipsLabel = document.getElementById('voivodeships-label');
    if (voivodeshipsLabel) {
      voivodeshipsLabel.innerHTML = `
        ${t.voivodeshipsLabel}
        <!-- <button class="show-button" onclick="app.showAllVoivodeships()" id="show-all-voivodeships">${t.showAll}</button> -->
        <button class="clear-button" onclick="app.clearVoivodeshipSelection()" id="clear-all-voivodeships">${t.clearAll}</button>
        <button class="download-button" onclick="app.downloadSelectedData()" id="download-selected" style="background: #2196F3; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; margin-left: 5px;">${t.downloadSelected}</button>
      `;
    }
    
    // Update severity controls label
    const severityControlsLabel = document.getElementById('severity-controls-label');
    if (severityControlsLabel) {
      severityControlsLabel.innerHTML = `
        ${t.severityControls}
        <button class="show-button" onclick="app.showAllSeverities()" style="margin-left: 10px; font-size: 10px; padding: 2px 6px;">${t.showAll}</button>
        <button class="clear-button" onclick="app.hideAllSeverities()" style="font-size: 10px; padding: 2px 6px;">${t.clearAll}</button>
      `;
    }
    
    // Update slider labels
    const radiusLabel = document.getElementById('radius-label');
    if (radiusLabel) radiusLabel.textContent = t.pointSize + ':';
    
    const opacityLabel = document.getElementById('opacity-label');
    if (opacityLabel) opacityLabel.textContent = t.opacity + ':';
    
    // Update legend items with consistent naming
    const severityLegend = document.getElementById('severity-legend');
    if (severityLegend) severityLegend.textContent = t.severity;
    
    const damageOnlyLegend = document.getElementById('damage-only-legend');
    if (damageOnlyLegend) damageOnlyLegend.textContent = t.damageOnly;
    
    const slightLegend = document.getElementById('slight-legend');
    if (slightLegend) slightLegend.textContent = t.slight;
    
    const seriousLegend = document.getElementById('serious-legend');
    if (seriousLegend) seriousLegend.textContent = t.serious;
    
    const fatalLegend = document.getElementById('fatal-legend');
    if (fatalLegend) fatalLegend.textContent = t.fatal;
    
    // Update loading text
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      if (loadingElement.innerHTML === 'Loading data...' || loadingElement.innerHTML.includes('Loading')) {
        loadingElement.innerHTML = t.loadingData;
      }
    }
    
    // Update severity control buttons
    this.updateSeverityButtonStates();
    
    // Update analysis panel language
    const analysisTitle = document.getElementById('analysis-title');
    if (analysisTitle) {
      const t = this.translations[this.currentLanguage];
      analysisTitle.textContent = t.areaAnalysis;
    }
    
    const clearPolygonsText = document.getElementById('clear-polygons-text');
    if (clearPolygonsText) {
      const t = this.translations[this.currentLanguage];
      clearPolygonsText.textContent = t.clearPolygons;
    }
    
    // Update drawing button text
    this.updateDrawingUI();
    
    // Refresh analysis results with new language
    if (this.analysisResults) {
      this.updateAnalysisResults();
    }

    // Update vehicle filter labels
    const vehicleFilterLabel = document.getElementById('vehicle-filters-label');
    if (vehicleFilterLabel) {
      vehicleFilterLabel.textContent = t.vehicleFilters;
    }
    
    const vehicleTypes = ['pedestrian', 'motorcycle', 'bicycle', 'uto', 'uwr'];
    vehicleTypes.forEach(vehicleType => {
      const label = document.getElementById(`${vehicleType}-filter-label`);
      if (label) {
        label.textContent = t[vehicleType];
      }
    });
  }
  
  updateStatsDisplay() {
    // Remove stats functionality - method kept for compatibility but does nothing
  }

  updateStats(totalAccidents, severityCounts) {
    // Remove stats functionality - method kept for compatibility but does nothing
  }
  
  getTooltip({ object }) {
    if (!object || this.persistentTooltip) return null; // Don't show hover tooltip if persistent is active
    
    const props = object.properties;
    const t = this.translations[this.currentLanguage];
    const severity = this.getSeverityFromFeature(object);
    const severityName = this.getCasualtySeverityDisplayName(severity);
    const accidentId = props.ID || props.id || t.unknown;

    // Get voivodeship name
    const voivodeshipName = this.voivodeshipCodeToName[props.WOJ] || props.WOJ || t.unknown;

    return {
      html: `
        <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
          <div><strong>${t.accidentId}</strong> ${accidentId}</div>
        <div><strong>${t.severity}</strong> ${severityName}</div>
          <strong>${t.year}</strong> ${props.yr || props.year || t.unknown}<br>
          <strong>${t.voivodeship}</strong> ${voivodeshipName}<br>
          <div style="font-size: 10px; color: #ccc; margin-top: 4px;">${t.clickToPin}</div>
        </div>
      `,
      style: {
        backgroundColor: 'transparent',
        fontSize: '12px'
      }
    };
  }
  
  onClick(info) {
    // Handle polygon drawing
    if (this.isDrawingMode) {
      const { coordinate } = info;
      if (coordinate) {
        this.currentDrawingPolygon.push(coordinate);
        this.updateLayers();
        
        // Auto-finish if we have many points
        if (this.currentDrawingPolygon.length >= 20) {
          this.finishDrawing();
        }
      }
      return; // Don't handle normal click behavior when drawing
    }
    
    if (info.object) {
      this.selectedFeature = info.object;
      this.selectedFeatureId = this.getFeatureId(info.object);
      this.showPersistentTooltip(info);
      this.updateLayers(); // Refresh layers to show selection highlight
    } else {
      this.hidePersistentTooltip();
    }
  }
  showPersistentTooltip(info) {
    this.hidePersistentTooltip(); // Remove any existing tooltip
    
    const props = info.object.properties;
    const t = this.translations[this.currentLanguage];
    const severity = this.getSeverityFromFeature(info.object);
    const severityName = this.getSeverityDisplayName(severity);
    
    // Create persistent tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'persistent-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      pointer-events: auto;
      left: ${info.x + 10}px;
      top: ${info.y + 10}px;
    `;
    
    // Format date if available
    let dateStr = t.unknown;
    if (props.dt || props.date || props.DATA_ZDARZENIA) {
      const dateValue = props.dt || props.date || props.DATA_ZDARZENIA;
      try {
        const date = new Date(dateValue);
        dateStr = date.toLocaleDateString();
      } catch (e) {
        dateStr = dateValue;
      }
    }
    
    // Get casualty counts using new column names
    const fatal = props.fat || 0;
    const serious = props.ser || 0;
    const slight = props.sli || 0;
    const other = props.dmg || 0;
    
    const accidentId = props.ID || t.unknown;
    
    // Get voivodeship name
    const voivodeshipName = this.voivodeshipCodeToName[props.WOJ] || props.WOJ || t.unknown;
    
    tooltip.innerHTML = `
      <div style="margin-bottom: 8px;">
        <strong>${t.accidentDetails}</strong>
        <button onclick="app.hidePersistentTooltip()" 
                style="float: right; background: #ff4444; color: white; border: none; 
                       border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 10px;">×</button>
      </div>
      <div><strong>${t.accidentId}</strong> ${accidentId}</div>
      <div><strong>${t.date}</strong> ${dateStr}</div>
      <div><strong>${t.severity}</strong> ${severityName}</div>
      <div><strong>${t.year}</strong> ${props.yr || props.year || t.unknown}</div>
      <div><strong>${t.voivodeship}</strong> ${voivodeshipName}</div>
      <div style="margin-top: 8px;"><strong>${t.casualties}</strong></div>
      <div style="margin-left: 10px;">
        ${t.fatal}: <span style="color: #ff4444;">${fatal}</span><br>
        ${t.serious}: <span style="color: #ff8800;">${serious}</span><br>
        ${t.slight}: <span style="color: #ffcc00;">${slight}</span><br>
        ${t.other}: <span style="color: #cccccc;">${other}</span>
      </div>
      ${accidentId !== t.unknown ? `
        <div style="margin-top: 10px;">
          <a href="https://sewik.pl/zdarzenie/${accidentId}" 
             target="_blank" 
             style="color: #4CAF50; text-decoration: none; font-weight: bold;">
            ${t.viewInSewik} ↗
          </a>
        </div>
      ` : ''}
    `;
    
    document.body.appendChild(tooltip);
    this.persistentTooltip = tooltip;
    
    // Adjust position if tooltip goes off screen
    setTimeout(() => {
      const rect = tooltip.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      if (rect.right > windowWidth) {
        tooltip.style.left = (info.x - rect.width - 10) + 'px';
      }
      if (rect.bottom > windowHeight) {
        tooltip.style.top = (info.y - rect.height - 10) + 'px';
      }
    }, 0);
  }
  
  hidePersistentTooltip() {
    if (this.persistentTooltip) {
      this.persistentTooltip.remove();
      this.persistentTooltip = null;
      this.selectedFeature = null;
      this.selectedFeatureId = null;
      this.updateLayers(); // Refresh layers to remove selection highlight
    }
  }

  // Helper method to get a unique ID for a feature
  getFeatureId(feature) {
    const props = feature.properties;
    // Try multiple possible ID fields
    return props.ID || props.id || props.accident_id || 
           `${props.yr || props.year || 'unknown'}_${props.WOJ || 'unknown'}_${feature.geometry.coordinates.join('_')}`;
  }

  getSeverityFromFeature(feature) {
    const props = feature.properties;
    
    // Try multiple ways to determine severity
    // 1. Direct severity property
    if (props.severity) {
      return props.severity;
    }
    
    // 2. Numeric severity code (new 'sev' column)
    if (props.sev !== undefined) {
      return this.severityMapping[props.sev] || 'DamageOnly';
    }
    
    // 3. Based on casualty counts - determine highest severity using new column names
    const fatal = props.fat || props[3] || props.fatal || props.ZM || 0;
    const serious = props.ser || props[2] || props.serious || props.ZC || 0;
    const slight = props.sli || props[1] || props.slight || props.RL || 0;
    
    var sev = 'DamageOnly'

    if (slight > 0) sev = 'Slight';
    if (serious > 0) sev = 'Serious';
    if (fatal > 0) sev = 'Fatal';

    // 4. Default to damage only
    return sev;
  }
  
  getSeverityDisplayName(severity) {
    const t = this.translations[this.currentLanguage];
    const severityMap = {
      'Fatal': t.fatal,
      'Serious': t.serious,
      'Slight': t.slight,
      'DamageOnly': t.damageOnly
    };
    return severityMap[severity] || severity;
  }
  
  getCasualtySeverityDisplayName(severity) {
    const t = this.translations[this.currentLanguage];
    const severityMap = {
      'Fatal': t.fatal,
      'Serious': t.serious_c,
      'Slight': t.slight_c,
      'DamageOnly': t.other
    };
    return severityMap[severity] || severity;
  }

  readUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Read selected years
    const yearsParam = urlParams.get('years');
    if (yearsParam) {
      this.selectedYears.clear();
      yearsParam.split(',').forEach(year => {
        const yearNum = parseInt(year.trim());
        if (!isNaN(yearNum)) {
          this.selectedYears.add(yearNum);
        }
      });
    }
    
    // Read selected voivodeships
    const voivodeshipsParam = urlParams.get('voivodeships');
    if (voivodeshipsParam) {
      this.selectedVoivodeships.clear();
      voivodeshipsParam.split(',').forEach(voivodeship => {
        const voivodeshipName = voivodeship.trim();
        if (voivodeshipName) {
          this.selectedVoivodeships.add(voivodeshipName);
        }
      });
    }
    
    // Read severity visibility
    const severityParam = urlParams.get('severity');
    if (severityParam) {
      const severityArray = severityParam.split(',');
      Object.keys(this.severityVisibility).forEach(severity => {
        this.severityVisibility[severity] = severityArray.includes(severity);
      });
    }
    
    // Read map style
    const mapStyleParam = urlParams.get('mapStyle');
    if (mapStyleParam && this.mapStyles[mapStyleParam]) {
      this.currentMapStyle = mapStyleParam;
    }
    
    // Read language
    const languageParam = urlParams.get('lang');
    if (languageParam && this.translations[languageParam]) {
      this.currentLanguage = languageParam;
      const languageSelect = document.getElementById('language-select');
      if (languageSelect) {
        languageSelect.value = languageParam;
      }
    }
    
    // Read point size
    const radiusParam = urlParams.get('radius');
    if (radiusParam) {
      const radiusSlider = document.getElementById('radius-slider');
      if (radiusSlider) {
        radiusSlider.value = radiusParam;
      }
    }
    
    // Read opacity
    const opacityParam = urlParams.get('opacity');
    if (opacityParam) {
      const opacitySlider = document.getElementById('opacity-slider');
      if (opacitySlider) {
        opacitySlider.value = opacityParam;
      }
    }
    
    // Read control panel visibility
    const panelParam = urlParams.get('panel');
    if (panelParam === 'hidden') {
      this.controlPanelVisible = false;
      setTimeout(() => this.toggleControlPanel(), 100); // Delay to ensure DOM is ready
    }
    
    // Read pie filter state
    const pieFilterParam = urlParams.get('pieFilter');
    if (pieFilterParam === 'true') {
      this.pieFilterEnabled = true;
      const pieFilterCheckbox = document.getElementById('pie-filter-checkbox');
      if (pieFilterCheckbox) {
        pieFilterCheckbox.checked = true;
      }
    }
    
    // Read vehicle filter states
    const vehicleTypes = ['pedestrian', 'motorcycle', 'bicycle', 'uto', 'uwr'];
    vehicleTypes.forEach(vehicleType => {
      const param = urlParams.get(`${vehicleType}Filter`);
      if (param === 'true') {
              this.vehicleFilters[vehicleType] = true;
        const checkbox = document.getElementById(`${vehicleType}-filter-checkbox`);
        if (checkbox) {
          checkbox.checked = true;
        }
      }
    });
    
    this.updateButtonStates();
  }
  
  updateUrlParameters() {
    console.log('updateUrlParameters called, isInitializing:', this.isInitializing);
    
    // Don't update URL during initialization
    if (this.isInitializing) {
      console.log('Skipping URL update - still initializing');
      return;
    }
    
    // Debounce URL updates to avoid too frequent updates
    if (this.updateUrlTimeout) {
      clearTimeout(this.updateUrlTimeout);
    }
    
    this.updateUrlTimeout = setTimeout(() => {
      console.log('Executing URL update...');
      try {
        const urlParams = new URLSearchParams();
        
        // Get current view state - use stored view state first
        let viewState = this.currentViewState;
        console.log('Using stored view state:', viewState);
        
        if (!viewState && this.deckgl) {
          console.log('No stored view state, trying to get from deckgl...');
          // Try multiple access methods as fallback
          viewState = this.deckgl.viewState || 
                     this.deckgl.deck?.viewState || 
                     this.deckgl.viewManager?.viewState ||
                     this.deckgl.viewports?.[0];
          console.log('Retrieved view state from deckgl:', viewState);
        }
        
        if (viewState && viewState.latitude !== undefined && viewState.longitude !== undefined) {
          console.log('Adding view state to URL - lat:', viewState.latitude, 'lon:', viewState.longitude, 'zoom:', viewState.zoom);
          urlParams.set('lat', viewState.latitude.toFixed(6));
          urlParams.set('lon', viewState.longitude.toFixed(6));
          urlParams.set('zoom', viewState.zoom.toFixed(2));
        } else {
          console.warn('Could not access view state for URL update:', viewState);
        }
        
        // Add selected years
        if (this.selectedYears.size > 0) {
          urlParams.set('years', Array.from(this.selectedYears).sort().join(','));
        }
        
        // Add selected voivodeships
        if (this.selectedVoivodeships.size > 0) {
          urlParams.set('voivodeships', Array.from(this.selectedVoivodeships).sort().join(','));
        }
        
        // Add severity visibility (only include visible ones to keep URL shorter)
        const visibleSeverities = Object.keys(this.severityVisibility)
          .filter(severity => this.severityVisibility[severity]);
        if (visibleSeverities.length > 0 && visibleSeverities.length < 4) {
          urlParams.set('severity', visibleSeverities.join(','));
        }
        
        // Add map style (only if different from default)
        if (this.currentMapStyle !== 'cartodb-light') {
          urlParams.set('mapStyle', this.currentMapStyle);
        }
        
        // Add language (only if different from default)
        if (this.currentLanguage !== 'pl') {
          urlParams.set('lang', this.currentLanguage);
        }
        
        // Add point size (only if different from default)
        const radiusSlider = document.getElementById('radius-slider');
        if (radiusSlider && radiusSlider.value !== '5') {
          urlParams.set('radius', radiusSlider.value);
        }
        
        // Add opacity (only if different from default)
        const opacitySlider = document.getElementById('opacity-slider');
        if (opacitySlider && opacitySlider.value !== '0.6') {
          urlParams.set('opacity', opacitySlider.value);
        }
        
        // Add control panel visibility (only if hidden)
        if (!this.controlPanelVisible) {
          urlParams.set('panel', 'hidden');
        }
        
        // Add pie filter state (only if enabled)
        if (this.pieFilterEnabled) {
          urlParams.set('pieFilter', 'true');
        }
        
        // Add vehicle filter states (only if enabled)
        const vehicleTypes = ['pedestrian', 'motorcycle', 'bicycle', 'uto', 'uwr'];
        vehicleTypes.forEach(vehicleType => {
          if (this.vehicleFilters[vehicleType]) {
            urlParams.set(`${vehicleType}Filter`, 'true');
          }
        });
        
        // Update URL without page reload
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState({}, '', newUrl);
        
        console.log('Successfully updated URL:', newUrl);
        
      } catch (error) {
        console.error('Failed to update URL parameters:', error);
      }
    }, 300); // 300ms debounce
  }
  
  downloadSelectedData() {
    if (!this.currentData || !this.currentData.features || this.currentData.features.length === 0) {
      alert(this.translations[this.currentLanguage].noDataLoaded);
      return;
    }
    
    // Filter features based on severity visibility and vehicle filters
    const visibleFeatures = this.currentData.features.filter(feature => {
      const severity = this.getSeverityFromFeature(feature);
      const severityVisible = this.severityVisibility[severity];
      
      // Check if any vehicle filters are enabled
      const anyVehicleFilterEnabled = Object.values(this.vehicleFilters).some(enabled => enabled);
      
      if (anyVehicleFilterEnabled) {
        const props = feature.properties;
        
        // Check each vehicle type filter
        let vehicleMatches = false;
        
        if (this.vehicleFilters.pedestrian && props.pie !== undefined && props.pie >= 0) {
          vehicleMatches = true;
        }
        if (this.vehicleFilters.motorcycle && props.mot !== undefined && props.mot >= 0) {
          vehicleMatches = true;
        }
        if (this.vehicleFilters.bicycle && props.row !== undefined && props.row >= 0) {
          vehicleMatches = true;
        }
        if (this.vehicleFilters.uto && props.uto !== undefined && props.uto >= 0) {
          vehicleMatches = true;
        }
        if (this.vehicleFilters.uwr && props.uwr !== undefined && props.uwr >= 0) {
          vehicleMatches = true;
        }
        
        return severityVisible && vehicleMatches;
      }
      
      return severityVisible;
    });
    
    // Group features by year and voivodeship
    const groupedFeatures = {};
    const selectedYears = Array.from(this.selectedYears).sort();
    const selectedVoivodeships = Array.from(this.selectedVoivodeships).sort();
    
    // Initialize groups
    selectedYears.forEach(year => {
      selectedVoivodeships.forEach(voivodeship => {
        const key = `${year}_${voivodeship}`;
        groupedFeatures[key] = {
          year: year,
          voivodeship: voivodeship,
          features: []
        };
      });
    });
    
    // Group visible features
    visibleFeatures.forEach(feature => {
      const props = feature.properties;
      const year = props.yr || props.year;
      const voivodeshipCode = props.WOJ;
      
      // Find voivodeship name from code
      const voivodeshipName = this.voivodeshipCodeToName[voivodeshipCode] || voivodeshipCode;
      
      const key = `${year}_${voivodeshipName}`;
      if (groupedFeatures[key]) {
        groupedFeatures[key].features.push(feature);
      }
    });
    
    // Create and download separate files for each group
    let downloadCount = 0;
    const downloadDelay = 500; // 500ms delay between downloads
    
    Object.entries(groupedFeatures).forEach(([key, group], index) => {
      if (group.features.length === 0) {
        return; // Skip empty groups
      }
      
      // Create GeoJSON for this group
      const geojsonData = {
        type: 'FeatureCollection',
        features: group.features,
        metadata: {
          exportDate: new Date().toISOString(),
          year: group.year,
          voivodeship: group.voivodeship,
          visibleSeverities: Object.keys(this.severityVisibility).filter(s => this.severityVisibility[s]),
          totalFeatures: group.features.length,
          source: 'SEWIK - System Ewidencji Wypadków i Kolizji'
        }
      };
      
      // Create filename
      const filename = `accidents_${group.year}_${group.voivodeship}.geojson`;
      
      // Schedule download with delay to avoid browser blocking multiple downloads
      setTimeout(() => {
        const dataStr = JSON.stringify(geojsonData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL object
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        
        console.log(`Downloaded ${group.features.length} accident records to ${filename}`);
      }, index * downloadDelay);
      
      downloadCount++;
    });
    
    if (downloadCount > 0) {
      const t = this.translations[this.currentLanguage];
      const message = this.currentLanguage === 'pl' 
        ? `Rozpoczęto pobieranie ${downloadCount} plików GeoJSON...`
        : `Started downloading ${downloadCount} GeoJSON files...`;
      
      // Show notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10001;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      // Remove notification after a few seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000 + (downloadCount * downloadDelay));
    }
  }
}

// Initialize the visualization when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new AccidentVisualization();
});