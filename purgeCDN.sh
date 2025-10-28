#!/bin/sh

curl -X POST --include --header "AccessKey: $BUNNY_CDN_ACCESS_KEY" --header "Content-Length: 0" https://bunnycdn.com/api/pullzone/404524/purgeCache
