<template>
  <div data-vuetify>
    <v-app>
      <v-main :class="{
          'desktop': true
        }">
        <div class="panel-background"></div>
        <div class="panel-content" ref="panelContent">
          <v-fade-transition>
            <div class="d-flex flex-column panel-content-inner">
              <div 
                class="scroll-content panel-content-main py-4 pl-8 pr-12"
              >
                <div v-for="(filter, i) in filters" :key="i">
                  <h5 class="text-h6 mb-12">{{filter.title}}</h5>
                  <veeno
                    v-if="mapLoaded && loadedData"
                    :tooltips="[{
                      to: n => filter.percentage
                        ? `${Math.round(n * 100)}%`
                        : (
                          filter.price
                          ? `${currencyFormat.format(n)}`
                          : n
                        )
                    }, {
                      to: n => filter.percentage
                        ? `${Math.round(n * 100)}%`
                        : (
                          filter.price
                          ? `${currencyFormat.format(n)}`
                          : n
                        )
                    }]"
                    :step="filter.step"
                    connect
                    @update="j => update(i, j)"
                    :handles="[lowerBounds[filter.field], upperBounds[filter.field]]"
                    :range="{
                      'min': filter.bounds ? filter.bounds[0] : lowerBounds[filter.field],
                      'max': filter.bounds ? filter.bounds[1] : upperBounds[filter.field]
                    }"
                    class="mb-8"
                  />
                </div>
              </div>
            </div>
          </v-fade-transition>
        </div>
        <div id="suburbtrends-map" :class="{ 'map': true, 'selectedSuburb': !!selectedFeature }" ref="suburbTrendsMap"></div>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import '@fontsource/catamaran/latin-100.css'
import '@fontsource/catamaran/latin-300.css'
import '@fontsource/catamaran/latin-400.css'
import '@fontsource/catamaran/latin-500.css'
import '@fontsource/catamaran/latin-700.css'
import '@fontsource/catamaran/latin-900.css'

import veeno from 'veeno'
// import 'nouislider/distribute/nouislider.min.css'

import Papa from 'papaparse'
import debounce from 'lodash.debounce'

import suburbs from '../../../data/suburb-centroids.json'

const panelWidth = 475

function addPadding(...args) {
  return args
    .map(arg => {
      return Object.assign({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }, arg)
    })
    .reduce((acc, cur) => {
      return {
        left: acc.left + cur.left,
        right: acc.right + cur.right,
        top: acc.top + cur.top,
        bottom: acc.bottom + cur.bottom
      }
    })
}

mapboxgl.accessToken = 'pk.eyJ1Ijoic3VidXJidHJlbmRzIiwiYSI6ImNrb3huaWgzdjBmNmgydmxkMTFnaThvbHcifQ.Oy1kLL5CCXQcA2vxi7SaLg'

export default {
  name: 'SuburbTrendsExplorer',

  components: {
    veeno
  },

  data: () => ({
    baseURL: `${window.location.origin}${window.location.pathname.replace('index.html', '')}`,
    mapLoaded: false,

    selectedFeature: null,

    // initial bounds Australia wide
    initialBounds: [[112.533, -43.586], [154.545, -10.755]],

    // current map bounds
    bounds: null,

    loadedData: false,

    data: {},

    // id of selected SSC
    selectedId: null,

    filters: [
      {
        title: 'Growth Score',
        field: 'Growth Score',
        step: 1,
        range: null,
        bounds: [0, 10]
      },
      {
        title: 'Asking Price',
        field: 'Asking Price',
        step: 25000,
        range: null,
        price: true,
        bounds: [0, 3000000]
      },
      {
        title: 'Vacancy Rate',
        field: 'Vacancy Rate',
        step: 0.01,
        range: null,
        percentage: true,
        bounds: [0, 0.1]
      },
      {
        title: 'Yield',
        field: 'Yield',
        step: 0.01,
        range: null,
        percentage: true,
        bounds: [0, 0.1]
      },
      {
        title: 'Av HH Weekly Income',
        field: 'Av HH Weekly Income',
        step: 100,
        range: null,
        price: true
      },
      {
        title: 'Renters %',
        field: 'Renters %',
        step: 0.01,
        range: null,
        percentage: true,
        bounds: [0, 1]
      },
      {
        title: 'Advantage Score',
        field: 'Advantage Score',
        step: 1,
        range: null,
        bounds: [0, 10]
      }
    ],

    lowerBounds: {},
    upperBounds: {},

    currencyFormat: new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }),

    popup: new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 5
    })


  }),

  created () {
    this.bounds = this.initialBounds

    Papa.parse(`${window.location.origin}${window.location.pathname.replace('explorer.html', '')}Explore.csv`, {
      download: true,
      header: true,
      delimiter: ',',
      dynamicTyping: true,
      worker: false,
      transformHeader: header => {
        return header.trim()
      },
      complete: response => {
        const lowerBounds = {}
        const upperBounds = {}
        this.filters.map(filter => {
          lowerBounds[filter.field] = undefined
          upperBounds[filter.field] = undefined
        })

        for (const row of response.data) {
          if ('Code\n(SSC)' in row) {
            row['Code (SSC)'] = row['Code\n(SSC)']
            delete row['Code\n(SSC)']
          }

          if ('Asking Price' in row) {
            row['Asking Price'] = Number(row['Asking Price'].toString().trim().replaceAll(',',  '')) || null
          }

          if ('Code (SSC)' in row) {
            this.data[row['Code (SSC)']] = row
          } else {
            console.log(`Row missing SSC code`, row)
          }
          this.filters.map(filter => {
            if (filter.field in row) {
              const fieldValue = Number(row[filter.field]) || 0
              if (lowerBounds[filter.field] === undefined || fieldValue < lowerBounds[filter.field]) {
                lowerBounds[filter.field] = fieldValue
              }
              if (upperBounds[filter.field] === undefined || fieldValue > upperBounds[filter.field]) {
                upperBounds[filter.field] = fieldValue
              }
            }
          })
        }
        this.lowerBounds = lowerBounds
        this.upperBounds = upperBounds

        suburbs.features = suburbs.features
          .map(suburb => {
            if (suburb && suburb.id && suburb.id in this.data) {
              Object.assign(suburb.properties, this.data[suburb.id])
              return suburb
            } else {
              return null
            }
          })
          .filter(i => i !== null)

        this.loadedData = true
      }
    })
  },

  mounted () {
    window.map = this.map = new mapboxgl.Map({
      container: 'suburbtrends-map',
      style: 'mapbox://styles/suburbtrends/ckqak03qn2ax417quc5mtnupa',
      center: [132.1330642, -25.6096439],
      zoom: 3,
      hash: false,
      bounds: this.bounds,
      fitBoundsOptions: this.fitBoundsOptions(),
      minZoom: 3,
      maxZoom: 14,
      maxPitch: 0,
      logoPosition: 'bottom-right',
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      touchZoomRotate: true // later rotation is disabled, leaving touch zoom only
    })

    // duplicate logo to the bottom left
    this.map.addControl(this.map._logoControl, 'bottom-left')

    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    // disable touch rotate leaving touch zoom in tact
    this.map.touchZoomRotate.disableRotation()

    this.map.on('load', () => {
      this.map.addSource('suburbs', {
        type: 'geojson',
        data: suburbs,
        cluster: false,
        clusterRadius: 25
      })
      this.map.addLayer({
        id: 'suburbs',
        source: 'suburbs',
        type: 'circle',
        paint: {
          'circle-color': 'blue',
          'circle-opacity': 0.5,
          'circle-stroke-color': 'white',
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            2,
            0
          ]
        },
        layout: {
        }
      })

      this.map.on('click', 'suburbs', e => {
        const selectedId = e.features[0].id
        if (selectedId in this.data) {
          this.selectedId = selectedId
        }

      })

      this.map.on('mousemove', 'suburbs', e => {
        if (e.features.length > 0) {
          if (this.hoverId !== null && this.hoverId !== undefined) {
            this.map.setFeatureState({
              source: 'suburbs',
              id: this.hoverId
            }, {
              hover: false
            })
            this.map.setFeatureState({
              source: 'suburbs',
              id: this.hoverId
            }, {
              hover: false
            })
          }

          const hoverId = e.features[0].id
          if (hoverId in this.data) {
            if (hoverId !== this.hoverId) {
              this.hoverId = hoverId

              this.map.setFeatureState({
                source: 'suburbs',
                id: this.hoverId
              }, {
                hover: true
              })
              this.map.setFeatureState({
                source: 'suburbs',
                id: this.hoverId
              }, {
                hover: true
              })
              this.map.getCanvas().style.cursor = 'pointer'
              this.popup
                .setLngLat(e.features[0].geometry.coordinates.slice())
                .setHTML(`<a href="${e.features[0].properties.Link}">${e.features[0].properties.Suburb}</a>`)
                .addTo(this.map);
            }
          } else {
            this.map.getCanvas().style.cursor = ''
          }
        }
      })
      this.map.on('mouseleave', 'suburbs', () => {
        if (this.hoverId !== null && this.hoverId !== undefined) {
          this.map.setFeatureState({
            source: 'suburbs',
            id: this.hoverId
          }, {
            hover: false
          })
          this.map.setFeatureState({
            source: 'suburbs',
            id: this.hoverId
          }, {
            hover: false
          })
          this.map.getCanvas().style.cursor = ''
          this.popup.remove()
          this.hoverId = null
        }
      })

      this.mapLoaded = true
    })

  },

  methods: {
    update: function (filter, slider) {
      this.filters[filter].range = slider.unencoded
      this.filter()
    },
    fitBoundsOptions: function () {
      return {
        duration: 1000,
        padding: this.padding()
      }
    },
    padding: function () {
      const mapRect = this.$refs.suburbTrendsMap ? this.$refs.suburbTrendsMap.getBoundingClientRect() : { height: 0, width: 0 }

      // map size less UI elements
      const mapHeight = mapRect.height
      const mapWidth = mapRect.width - panelWidth

      const paddingY = Math.floor(mapHeight * 0.1)
      const paddingX = Math.floor(mapWidth * 0.1)

      const deviceDependentPadding = {
        top: paddingY,
        bottom: paddingY,
        left: paddingX,
        right: paddingX
      }

      const padding = addPadding(
        this.$vuetify.breakpoint.xs ? {} : { left: panelWidth },
        deviceDependentPadding
      )

       const constrainedPadding = {
        top: Math.max(padding.top, 0),
        bottom: Math.max(padding.bottom, 0),
        right: Math.max(padding.right, 0),
        left: Math.max(padding.left, 0),
      }

      return constrainedPadding
    },

    filter: debounce(function () {
      const filters = this.filters.map(filter => {
        const field = filter.field
        const min = filter.range[0]
        const max = filter.range[1]

        const all = [
          'all',
          ['>=', ['to-number', ['get', field]], min],
        ]
        if (!filter.bounds || max !== filter.bounds[1]) {
          all.push(['<=', ['to-number', ['get', field]], max])
        } // else if max is the upper bounds, then don't limit since we artifically cap the displayed bounds
        return all
      })

      const filter = [ 'all', ...filters ]
      this.map.setFilter('suburbs', filter)
    }, 250)
  },

  watch: {
    '$vuetify.breakpoint.xs': function (xs) {
      window.setTimeout(() => {
        this.map.resize()
      }, 200)

      // if screen expanded and map was selected before, then select the suburb data tab
      if (!xs && this.tab === 0) {
        this.tab = 1
      }
    },

    loadedData: function (loadedData) {
      if (loadedData) {
        const hash = window.location.hash.substring(1)
        const [hashSSC, hashTab] = hash.split('-')

        if (hashSSC && hashSSC in this.data) {
          this.selectedId = hashSSC
        }
        if (hashTab && this.tabs.includes(hashTab)) {
          this.tab = this.tabs.indexOf(hashTab) + 1
        }
      }
    },
    mapLoaded: function (mapLoaded) {
      if (mapLoaded) {
        if (this.setStyleOnceLoaded) {
          this.setStyle(this.style, this.style === 'map' ? 'satellite' : 'map')
        }
        if (this.setSelectedFeatureStateOnceLoaded && this.selectedId) {
          this.map.setFeatureState({
            source: 'composite',
            sourceLayer: 'SSC',
            id: this.selectedId
          }, {
            selected: true
          })
        }
        if (this.fitBoundsOnceLoaded) {
          this.map.fitBounds(this.bounds, Object.assign({}, this.fitBoundsOptions(), { duration: 0 }))
        }
      }
    },
    style: function (style, prevStyle) {
      if (this.mapLoaded) {
        this.setStyle(style, prevStyle)
      } else {
        this.setStyleOnceLoaded = true
      }
    },
    selectedId: function (id, prev) {
      if (this.mapLoaded) {
        if (prev) {
          this.map.removeFeatureState({
            source: 'composite',
            sourceLayer: 'SSC',
            id: prev
          }, 'selected')
        }

        if (id) {
          this.map.setFeatureState({
            source: 'composite',
            sourceLayer: 'SSC',
            id: id
          }, {
            selected: true
          })
        }
      } else {
        this.setSelectedFeatureStateOnceLoaded = true
      }

      const selectedFeature = id in this.data ? this.data[id] : null
      this.selectedFeature = selectedFeature
    },
    bounds: {
      handler: function (bounds) {
        if (this.map && this.mapLoaded) {
          this.map.fitBounds(bounds, this.fitBoundsOptions())
        } else {
          this.fitBoundsOnceLoaded = true
        }
      },
      deep: true
    }
  }

};
</script>
<style>
html {
  overflow-y: auto !important;
}
[data-vuetify] .map {
  height: 100%;
  width: 100%;

  /* allow popups to be visible outside the map */
  overflow: visible;
}

.v-text-field__details {
  display: none !important;
}
.v-input {
  font-size: 15px !important;
}

[data-vuetify] .desktop .panel-content {
  position: absolute;
  height: 100%;
  width: 475px;
  z-index: 2;
}
[data-vuetify] .desktop .panel-background {
  position: absolute;
  height: 100%;
  width: 475px;
  z-index: 1;

  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
}
/* firefox workaround for no blur support */
@-moz-document url-prefix() {
  [data-vuetify] .panel-background {
    background-color: rgba(255, 255, 255, 0.8);
  }
}
.scroll-content {
  overflow-y: scroll !important;
  scrollbar-width: thin;
  scrollbar-color: darkgray lightgray; /* scroll thumb and track */
}
.panel-content-main {
  height: 100%;
}

.fade-bottom {
  -webkit-mask-image: linear-gradient(to top, transparent 0px, black 30px);
  mask-image: linear-gradient(to top, transparent 0px, black 30px);
}
.scroll-content::-webkit-scrollbar {
  width: 8px;
  background-color: lightgray;
}
.scroll-content::-webkit-scrollbar-thumb {
  background: darkgray;
}

ul {
  list-style-type: none;
  padding-inline-start: 14px;
}
.panel-header, .instructions-bar {
  background-color: rgb(34, 64, 154);
}
.panel-content-inner {
  height: 100%;
}
.suburb-title {
  position: relative;
}
.panel-app-logo {
  background: rgb(34, 64, 154);
}
.close-button {
  top: 5px !important;
}
.background-none {
  background: none !important;
}

/* toggle which logo is shown based on screen size */
@media (min-width: 800px) {
  .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl-logo {
    display: none;
  }
}
@media (max-width: 799px) {
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-logo {
    display: none;
  }
}
.mobile-footer {
  position: absolute !important;
  bottom: 0;
  width: 100%;
}
.mobile #suburbtrends-map {
  height: auto;
  position: absolute;
  top: 128px;
  bottom: 52px;
}
.mobile #suburbtrends-map.selectedSuburb {
  top: 176px;
}
.noUi-tooltip {
  font-size: 1rem;
}
</style>
