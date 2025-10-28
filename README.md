# suburbtrends-map

Front-end web application for SuburbTrends map.

## Live URLs
### SuburbTrends

* dev - https://storage.googleapis.com/suburbtrends-map-dev/index.html
* prod - https://suburbtrends-map.alantgeo.com.au/index.html

### Explorer

* dev - https://storage.googleapis.com/suburbtrends-map-dev/explorer.html
* prod - https://suburbtrends-map.alantgeo.com.au/explorer.html

### Cashflow

* dev - https://storage.googleapis.com/suburbtrends-map-dev/cashflow.html
* prod - https://suburbtrends-map.alantgeo.com.au/cashflow.html

## Preparing Mapbox Data

### SAL (2021)

1. Download ASGS 2021 Suburbs and Localities Shapefile from https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files into `build/SAL_2021_AUST_GDA2020_SHP.zip`.
2. `unzip build/SAL_2021_AUST_GDA2020_SHP.zip -d build`
3. `ogr2ogr -f GeoJSONSeq -t_srs 'EPSG:4326' -lco ID_FIELD=SAL_CODE21 -lco ID_TYPE=Integer -dialect sqlite -sql 'SELECT SAL_CODE21, geometry FROM SAL_2021_AUST_GDA2020' build/SAL_2021_AUST.geojson build/SAL_2021_AUST_GDA2020.shp`
4. `tippecanoe -o build/SAL_2021_AUST.mbtiles --name "SAL 2021" --description "SAL 2021" --detect-shared-borders --minimum-zoom 3 --maximum-zoom 12 --named-layer=SAL:build/SAL_2021_AUST.geojson`

5. Label centroids with `ogr2ogr -f GeoJSONSeq -t_srs 'EPSG:4326' -lco ID_Field=SAL_CODE21 -lco ID_TYPE=Integer -dialect sqlite -sql 'SELECT SAL_CODE21, SAL_NAME21 AS name, ST_Centroid(geometry) AS geometry FROM SAL_2021_AUST_GDA2020' build/SAL_2021_AUST.label.geojson build/SAL_2021_AUST_GDA2020.shp`
6. Hack to clean name fields `sed 's/ (.*)"/"/' < build/SAL_2021_AUST.label.geojson > build/SAL_2021_AUST.label.names.geojson`
7. `ndjson-map 'd.tippecanoe = { minzoom: 7 }, d' < build/SAL_2021_AUST.label.names.geojson > build/SAL_2021_AUST.label.names.minzoom.geojson`
8. `tippecanoe --force -o build/SAL_2021_AUST.mbtiles --name "SAL 2021" --description "SAL 2021" --detect-shared-borders --minimum-zoom 3 --maximum-zoom 12 --named-layer=SAL:build/SAL_2021_AUST.geojson --named-layer=SAL_label:build/SAL_2021_AUST.label.names.minzoom.geojson -rg5`

### SSC (2016)

1. Download ASGS 2016 State Suburbs Shapefile from https://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/1270.0.55.003July%202016?OpenDocument into `build/1270055003_ssc_2016_aust_shape.zip`.
2. `unzip build/1270055003_ssc_2016_aust_shape.zip -d build`
3. `ogr2ogr -f GeoJSONSeq -lco ID_FIELD=SSC_CODE16 -lco ID_TYPE=Integer -dialect sqlite -sql 'SELECT SSC_CODE16, geometry FROM SSC_2016_AUST' build/SSC_2016_AUST.geojson build/SSC_2016_AUST.shp`
4. `tippecanoe -o build/SSC_2016_AUST.mbtiles --name "SSC 2016" --description "SSC 2016" --detect-shared-borders --minimum-zoom 3 --maximum-zoom 12 --named-layer=SSC:build/SSC_2016_AUST.geojson`

5. Label centroids with `ogr2ogr -f GeoJSONSeq -lco ID_Field=SSC_CODE16 -lco ID_TYPE=Integer -dialect sqlite -sql 'SELECT SSC_CODE16, SSC_NAME16 AS name, ST_Centroid(geometry) AS geometry FROM SSC_2016_AUST' build/SSC_2016_AUST.label.geojson build/SSC_2016_AUST.shp`
6. Hack to clean name fields `sed 's/ (.*)"/"/' < build/SSC_2016_AUST.label.geojson > build/SSC_2016_AUST.label.names.geojson`
7. `ndjson-map 'd.tippecanoe = { minzoom: 7 }, d' < build/SSC_2016_AUST.label.names.geojson > build/SSC_2016_AUST.label.names.minzoom.geojson`
8. `tippecanoe --force -o build/SSC_2016_AUST.mbtiles --name "SSC 2016" --description "SSC 2016" --detect-shared-borders --minimum-zoom 3 --maximum-zoom 12 --named-layer=SSC:build/SSC_2016_AUST.geojson --named-layer=SSC_label:build/SSC_2016_AUST.label.names.minzoom.geojson -rg5`

### SA1 (2021)
1. Download [ASGS 2021 SA1](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files) from 
https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files/SA1_2021_AUST_SHP_GDA2020.zip
2. `unzip build/SA1_2021_AUST_SHP_GDA2020.zip -d build`
3. `ogr2ogr -f GeoJSONSeq -lco ID_FIELD=SA1_CODE21 -lco ID_TYPE=Integer -dialect sqlite -sql 'SELECT SA1_CODE21, geometry FROM SA1_2021_AUST_GDA2020' build/SA1_2021_AUST_GDA2020.geojson build/SA1_2021_AUST_GDA2020.shp`
4. `tippecanoe -o build/SA1_2021_AUST.mbtiles --name "SA1 2021" --description "ASGS SA1 2021" --detect-shared-borders --minimum-zoom 7 --maximum-zoom 12 --named-layer=SA1:build/SA1_2021_AUST_GDA2020.geojson`

### SA1 (2016)
`ogr2ogr -f GeoJSONSeq -lco ID_FIELD=SA1_7DIG16 -lco ID_TYPE=Integer -dialect sqlite -sql 'SELECT SA1_7DIG16, geometry FROM SA1_2016_AUST' SA1_2016_AUST.geojson SA1_2016_AUST.shp`
`tippecanoe -o build/SA1_2016_AUST.mbtiles --name "SA1 2016" --description "ASGS SA1 2016" --detect-shared-borders --minimum-zoom 7 --maximum-zoom 12 --named-layer=SA1:build/SA1_2016_AUST.geojson`

### SA3 Centroids
`ogr2ogr -f CSV -lco GEOMETRY=AS_XY -dialect sqlite -sql 'SELECT SA3_CODE16,SA3_NAME16,SA4_CODE16,SA4_NAME16,GCC_CODE16,GCC_NAME16,STE_CODE16,STE_NAME16,AREASQKM16,ST_Centroid(geometry) FROM SA3_2016_AUST' SA3_2016_AUST.csv SA3_2016_AUST.shp`

### SA4 Centroids
`ogr2ogr -f CSV -lco GEOMETRY=AS_XY -dialect sqlite -sql 'SELECT SA4_CODE16,SA4_NAME16,GCC_CODE16,GCC_NAME16,STE_CODE16,STE_NAME16,AREASQKM16,ST_Centroid(geometry) FROM SA4_2016_AUST' SA4_2016_AUST.csv SA4_2016_AUST.shp`

## Preparing Search Index

### From SAL (2021)
```sh
ogr2ogr -f GeoJSON -lco ID_FIELD=SAL_CODE21 -lco ID_TYPE=Integer -lco WRITE_BBOX=YES -lco COORDINATE_PRECISION=3 -dialect sqlite -sql 'SELECT SAL_CODE21, SAL_NAME21 AS name, STE_CODE21 AS state, geometry FROM SAL_2021_AUST_GDA2020 WHERE geometry IS NOT NULL' build/sal-searchIndex.geometries.geojson build/SAL_2021_AUST_GDA2020.shp

jq -c '{ type: "FeatureCollection", features: [ .features[] | del(.geometry) ] }' < build/sal-searchIndex.geometries.geojson > build/sal-searchIndex.geojson

ogr2ogr -f GeoJSON -lco RFC7946=YES -lco WRITE_NAME=NO -lco ID_FIELD=SAL_CODE21 -lco ID_TYPE=Integer -lco COORDINATE_PRECISION=3 -dialect sqlite -sql 'SELECT SAL_CODE21, Centroid(geometry) AS geometry FROM SAL_2021_AUST_GDA2020 WHERE geometry IS NOT NULL' build/sal-centroids.geojson build/SAL_2021_AUST_GDA2020.shp

cp build/sal-searchIndex.geojson data/suburbs.json
cp build/sal-centroids.geojson data/suburb-centroids.json
```

### From SSC (2016)
```sh
ogr2ogr -f GeoJSON -lco ID_FIELD=SSC_CODE16 -lco ID_TYPE=Integer -lco WRITE_BBOX=YES -lco COORDINATE_PRECISION=3 -dialect sqlite -sql 'SELECT SSC_CODE16, SSC_NAME16 AS name, STE_CODE16 AS state, Centroid(geometry) AS geometry FROM SSC_2016_AUST WHERE geometry IS NOT NULL' build/ssc-searchIndex.geometries.geojson build/SSC_2016_AUST.shp

jq -c '{ type: "FeatureCollection", features: [ .features[] | del(.geometry) ] }' < build/ssc-searchIndex.geometries.geojson > build/ssc-searchIndex.geojson

jq -c '{ type: "FeatureCollection", features: [ .features[] | del(.bbox) | .properties = {} ] }' < build/ssc-searchIndex.geometries.geojson > build/ssc-centroids.geojson
```

## SA1 Elevation

cat SA1_Elevation.csv | csv2json | jq -c 'map( { (.sa1_code21|tostring): del(.sa1_code21) } ) | add' > SA1_Elevation.json

Based on the allocation files for MB and SAL at [allocation files](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/allocation-files) we can generate a mapping for SAL -> [MB] and MB -> SA1 and therefore SAL -> [SA1].

## Restricting iframe embedding

To restrict who can iframe the site, within Bunny, under Edge Rules, setup a new Edge Rule

* Set Response Header -> Content-Security-Policy `frame-ancestors 'self' https://suburbtrends.com https://*.suburbtrends.com https://*.suburbtrends.com.au https://suburbtrends.com.au https://suburbhelp.com.au https://app.propertyconnect.com.au https://henderson.com.au http://localhost`

If any condition matches:

* Url match `https://suburbtrends-map.b-cdn.net/*`
* Url match `https://suburbtrends-map.alantgeo.com.au/*`
