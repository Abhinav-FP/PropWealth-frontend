import colorbrewer from 'colorbrewer'

const sa1ElevationFillColor = [
    'interpolate',
    ['linear'],
    ['max', ['feature-state', 'min'], 0],
    0, colorbrewer.RdYlGn[5][0],
    5, colorbrewer.RdYlGn[5][1],
    10, colorbrewer.RdYlGn[5][2],
    20, colorbrewer.RdYlGn[5][3],
    40, colorbrewer.RdYlGn[5][4]
  ]
const sa1ElevationFillOpacity = [
  'case',
  ['==', ['number', ['feature-state', 'min'], -9999], -9999],
  //['to-boolean', ['feature-state', 'min']],
  0,
  0.75
]

const sa1SeifaFillColor = [
  'match',
  ['feature-state', 'seifa'],
  1, colorbrewer.RdYlGn[10][0],
  2, colorbrewer.RdYlGn[10][1],
  3, colorbrewer.RdYlGn[10][2],
  4, colorbrewer.RdYlGn[10][3],
  5, colorbrewer.RdYlGn[10][4],
  6, colorbrewer.RdYlGn[10][5],
  7, colorbrewer.RdYlGn[10][6],
  8, colorbrewer.RdYlGn[10][7],
  9, colorbrewer.RdYlGn[10][8],
  10, colorbrewer.RdYlGn[10][9],
  '#000'
]
const sa1SeifaFillOpacity = [
  'case',
  ['==', ['number', ['feature-state', 'seifa'], 0], 0],
  0,
  0.75
]

export default {
  map: {
    salFillColor: ['coalesce', ['feature-state', 'fill'], '#000'],
    salFillOpacity: [ 'case', ['to-boolean', ['feature-state', 'fill']], 0.8, 0],
    salSelectedOutlineColor: '#000d62',
    salHoverOutlineColor: '#444',
    salLabelTextColor: '#000',
    salLabelTextHaloColor: '#fff',
    sa1OutlineColor: '#437acc',
    sa1ElevationFillColor,
    sa1ElevationFillOpacity,
    sa1SeifaFillColor,
    sa1SeifaFillOpacity
  },
  satellite: {
    salFillColor: '#000',
    salFillOpacity: [ 'case', ['boolean', ['feature-state', 'selected'], false], 0, 0.5],
    salSelectedOutlineColor: '#000d62',
    salHoverOutlineColor: '#fff',
    salLabelTextColor: '#fff',
    salLabelTextHaloColor: '#000',
    sa1OutlineColor: '#437acc',
    sa1ElevationFillColor,
    sa1ElevationFillOpacity,
    sa1SeifaFillColor,
    sa1SeifaFillOpacity
  }
}
