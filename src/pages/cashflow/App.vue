<template>
  <div data-vuetify>
    <v-app>
      <v-main :class="{
          'mobile': $vuetify.breakpoint.xs,
          'desktop': !$vuetify.breakpoint.xs
        }">
        <div class="header my-3 d-flex justify-space-between">
          <div class="flex-grow-1">
            <h5 class="text-h5 font-weight-bold">Cashflow Clusters</h5>
            <div class="text-body-1">Week ending August 1st 2021</div>
          </div>
          <div>
            <v-img :src="require('../../assets/SuburbTrends_SecondaryLogo.png')" alt="SuburbTrends" contain height="48" :width="920 / 225 * 48" eager></v-img>
          </div>
        </div>
        <div class="content">
          <div id="map" class="map"></div>
        </div>
        <div class="footer my-2">
          Weekly listings BETA <a href="https://suburbtrends.com/">Suburbtrends</a> • We select properties with a listing price and use the rental median by bedroom count and property type to calculate estimate yields
        </div>
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
 
import Papa from 'papaparse'
import omit from 'object.omit'
import {featureCollection as fc} from '@turf/helpers'

const currencyFormat = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0
})

mapboxgl.accessToken = 'pk.eyJ1Ijoic3VidXJidHJlbmRzIiwiYSI6ImNrb3huaWgzdjBmNmgydmxkMTFnaThvbHcifQ.Oy1kLL5CCXQcA2vxi7SaLg'

export default {
  name: 'SuburbTrendsCashflowClusters',

  components: {
  },

  data: () => ({
    baseURL: `${window.location.origin}${window.location.pathname.replace('index.html', '')}`,
    mapLoaded: false,
    dataLoaded: false,

    selectedFeature: null,

    style: 'map',

    // initial bounds Australia wide
    initialBounds: [[112.533, -43.586], [154.545, -10.755]],

    // current map bounds
    bounds: null,

    features: [],

    // id of selected SSC
    selectedId: null,
  }),

  created () {

    this.bounds = this.initialBounds

    Papa.parse(`${window.location.origin}${window.location.pathname.replace('cashflow.html', '')}Clusters.csv`, {
      download: true,
      header: true,
      delimiter: ',',
      dynamicTyping: true,
      worker: false,
      transformHeader: header => {
        return header.trim()
      },
      complete: response => {
        this.features = response.data.map(row => {
          return {
            type: 'Feature',
            properties: omit(row, ['state_code', 'lng', 'lat']),
            geometry: {
              type: 'Point',
              coordinates: [row.lng, row.lat]
            }
          }
        })
        this.dataLoaded = true
      }
    })
  },

  mounted () {
    window.map = this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/suburbtrends/ckqak03qn2ax417quc5mtnupa',
      center: [132.1330642, -25.6096439],
      zoom: 3,
      hash: false,
      bounds: this.bounds,
      fitBoundsOptions: this.fitBoundsOptions(),
      minZoom: 3,
      maxZoom: 14,
      maxPitch: 0,
      logoPosition: 'bottom-left',
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      touchZoomRotate: true // later rotation is disabled, leaving touch zoom only
    })

    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    // disable touch rotate leaving touch zoom in tact
    this.map.touchZoomRotate.disableRotation()


    this.map.on('load', () => {
      this.map.addSource('markers', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        generateId: true
      })

      this.map.addLayer({
        id: 'markers',
        source: 'markers',
        type: 'circle',
        paint: {
          'circle-color': 'blue',
          'circle-opacity': 0.5,
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            0
          ],
          'circle-stroke-color': 'white'
        },
        layout: {
        }
      })

      this.map.on('click', 'markers', e => {
        const feature = e.features[0]
        const contents = Object.entries(feature.properties).map(([key, value]) => {
          let formattedValue = value
          if (key === 'Rent Median') {
            formattedValue = currencyFormat.format(value)
          }
          return `<strong>${key}</strong>: ${formattedValue}`
        }).join('<br>')
        new mapboxgl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(contents)
          .addTo(this.map)
      })

      this.map.on('mousemove', 'markers', e => {
        if (e.features.length > 0) {
          if (this.hoverId !== null && this.hoverId !== undefined) {
            this.map.setFeatureState({
              source: 'markers',
              id: this.hoverId
            }, {
              hover: false
            })
          }

          const hoverId = e.features[0].id
          this.hoverId = hoverId

          this.map.setFeatureState({
            source: 'markers',
            id: this.hoverId
          }, {
            hover: true
          })
          this.map.getCanvas().style.cursor = 'pointer'
        }
      })
      this.map.on('mouseleave', 'markers', () => {
        if (this.hoverId !== null && this.hoverId !== undefined) {
          this.map.setFeatureState({
            source: 'markers',
            id: this.hoverId
          }, {
            hover: false
          })
          this.map.getCanvas().style.cursor = ''
        }
      })

      this.mapLoaded = true
    })

  },

  methods: {
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
      const mapWidth = mapRect.width

      const paddingY = Math.floor(mapHeight * 0.1)
      const paddingX = Math.floor(mapWidth * 0.1)

      const deviceDependentPadding = {
        top: paddingY,
        bottom: paddingY,
        left: paddingX,
        right: paddingX
      }

      const padding = deviceDependentPadding

      const constrainedPadding = {
        top: Math.max(padding.top, 0),
        bottom: Math.max(padding.bottom, 0),
        right: Math.max(padding.right, 0),
        left: Math.max(padding.left, 0),
      }

      return constrainedPadding
    }
  },

  watch: {
    '$vuetify.breakpoint.xs': function () {
      window.setTimeout(() => {
        this.map.resize()
      }, 200)
    },

    dataLoaded: function (dataLoaded) {
      if (dataLoaded && this.mapLoaded) {
        this.map.getSource('markers').setData(fc(this.features))
      }
    },
    mapLoaded: function (mapLoaded) {
      if (mapLoaded && this.dataLoaded) {
        this.map.getSource('markers').setData(fc(this.features))
      }
      if (mapLoaded) {
        if (this.fitBoundsOnceLoaded) {
          this.map.fitBounds(this.bounds, Object.assign({}, this.fitBoundsOptions(), { duration: 0 }))
        }
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
.v-main__wrap {
  height: 100vh;
  display: flex;

  flex-direction: column;
}
.header {
}
.footer {
}
.content {
  flex: 1;
}
[data-vuetify] .map {
  height: 100%;

  /* allow popups to be visible outside the map */
  overflow: visible;
}
</style>
