const options = {
  stroke: true,
  weight: 2,
  lineJoin: 'round',
  opacity: 1,
};

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const Playground = {
  init(_containerID, _layers, _options = {}) {
    this._container = document.querySelector(_containerID);
    this._map = this.mountMap(this._container);
    this._layers = _layers; // Guardar todas las capas disponibles
    this._activeLayers = []; // Mantener las capas activas
    this._plugins = {}; // Asociar nombres con plugins

    this.createLayerControls();
    this.loadInitialLayer(); // Mostrar solo una capa inicialmente

    // Cargar las capas desde el archivo geojson
    this.loadGeoJsonData();
  },

  mountMap(_container) {
    const map = L.map(_container, {
      center: [40, 60],
      zoom: 3,
      zoomControl: false,
      zoomDelta: 0.25,
      zoomSnap: 0.25,
    });

    new L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
        detectRetina: true,
      }
    ).addTo(map);

    return map;
  },

  mountPlugin(_map, _layerName, _data, _options) {
    const color = getRandomColor(); // Obtener un color aleatorio
    const layerOptions = { 
      ..._options, 
      color, // Añadir color a las opciones de la capa
      fillColor: color, // Aplicar el mismo color al relleno
      fillOpacity: 0.5 // Ajustar la opacidad del relleno si es necesario
    };
    
    // Verificar el tipo de capa y crearla
    let plugin;
    if (_data.type === 'Polygon' || _data.type === 'MultiPolygon') {
      plugin = L.geoJSON(_data, {
        style: {
          weight: layerOptions.weight,
          color: layerOptions.color, // Aplicar el color aleatorio al borde
          opacity: layerOptions.opacity,
          lineJoin: layerOptions.lineJoin,
          fillColor: layerOptions.fillColor, // Aplicar el color al relleno
          fillOpacity: layerOptions.fillOpacity // Configurar la opacidad del relleno
        },
      }).addTo(_map);
    } else {
      plugin = new L.TrueSize(_data, layerOptions).addTo(_map);
    }

    this._plugins[_layerName] = plugin; // Guardar referencia del plugin
    this._activeLayers.push(_layerName); // Añadir a las capas activas
    return plugin;
  },


  loadInitialLayer() {
    const initialLayerName = Object.keys(this._layers)[0];
    const initialLayerData = this._layers[initialLayerName];
  
    this.mountPlugin(this._map, initialLayerName, initialLayerData, options);
  
    const activeLayersList = document.querySelector('#active-layers');
    // const layerNameFromProperties = initialLayerData.properties?.name || initialLayerName;
    const layerNameFromProperties = initialLayerData.properties?.name;
  
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${layerNameFromProperties}</span>
      <button data-layer="${initialLayerName}" class="hide-layer">Hide</button>
      <button data-layer="${initialLayerName}" class="remove-layer">Delete</button>
    `;
    activeLayersList.appendChild(listItem);
  },

  createLayerControls() {
    const searchInput = document.querySelector('#search-input');
    const layerSelect = document.querySelector('#layer-select');
    const activeLayersList = document.querySelector('#active-layers');


    searchInput.addEventListener('input', (event) => {
      const searchTerm = event.target.value.toLowerCase(); // Convertir a minúsculas para coincidencias insensibles a mayúsculas
      const options = layerSelect.querySelectorAll('option');
    
      options.forEach((option) => {
        const layerName = option.textContent.toLowerCase();
        // Mostrar solo las opciones que coincidan con el término de búsqueda
        if (layerName.includes(searchTerm)) {
          option.style.display = '';
        } else {
          option.style.display = 'none';
        }
      });
    });
  
    for (const [layerName, layerData] of Object.entries(this._layers)) {
      const option = document.createElement('option');
      option.value = layerName;
      option.textContent = layerData.properties.name;
      layerSelect.appendChild(option);
    }

    layerSelect.addEventListener('change', (event) => {
      const layerName = event.target.value;
      const layerData = this._layers[layerName];
  
      if (!this._activeLayers.includes(layerName)) {
        this.mountPlugin(this._map, layerName, layerData, options);
  
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <span>${layerData.properties.name}</span>
          <button data-layer="${layerName}" class="hide-layer">Hide</button>
          <button data-layer="${layerName}" class="remove-layer">Delete</button>
        `;
        activeLayersList.appendChild(listItem);
      }
    });

    activeLayersList.addEventListener('click', (event) => {
      const layerName = event.target.getAttribute('data-layer');
  
      if (event.target.classList.contains('hide-layer')) {
        this.toggleLayerVisibility(layerName);
      } else if (event.target.classList.contains('remove-layer')) {
        this.removeLayer(layerName, event.target.parentElement);
      }
    });



  },

  toggleLayerVisibility(layerName) {
    const plugin = this._plugins[layerName];
    if (this._map.hasLayer(plugin)) {
      this._map.removeLayer(plugin);
    } else {
      plugin.addTo(this._map);
    }
  },

  removeLayer(layerName, listItem) {
    const plugin = this._plugins[layerName];
    this._map.removeLayer(plugin);
    delete this._plugins[layerName];
    this._activeLayers = this._activeLayers.filter((name) => name !== layerName);
    listItem.remove();
  },
};

const layers = {
  // jsondata: geojsonData,
  RomeTrajano: RomeTrajano,
  RomeKingdom1: RomeKingdom1,
  RomeKingdom2: RomeKingdom2,
  romeAppClaudius: romeAppClaudius,
  carthageKingdom1: carthageKingdom1,
  carthageKingdom2: carthageKingdom2,
  carthageKingRep: carthageKingRep,
  carthageRepublicFinal: carthageRepublicFinal,
  Venice700: Venice700,
  Venice1500: Venice1500,
  Amalfi: Amalfi,
  Athens: Athens,
  Sparta: Sparta,
  EgyptOldKingdom: EgyptOldKingdom,
  egyptFirstIntermediate1: egyptFirstIntermediate1,
  egyptFirstIntermediate2: egyptFirstIntermediate2,
  egyptMiddleKingdom: egyptMiddleKingdom,
  egyptNewKingdom: egyptNewKingdom,

  // jsondata: europeSquare,
  polygon: polygon,
};

Playground.init('#map', layers, options);




