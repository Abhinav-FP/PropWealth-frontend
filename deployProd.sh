#!/bin/sh

gsutil -m -h 'Cache-Control: public, max-age=0' cp -z 'html,js,css,otf,woff,woff2,svg,map,json,geojson' -r dist/* gs://suburbtrends-map/
