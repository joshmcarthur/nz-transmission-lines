NZ Transmission Lines
===

A [D3](http://d3js.org) visualisation experiment using open data from [Transpower](https://www.transpower.co.nz) and [Natural Earth Data](http://www.naturalearthdata.com/). The map displays high-voltage lines overlaid over New Zealand with placenames labelled for convenience.

The current version of this visualisation is more or less the product of working through the excellent [Let's make a map](http://bost.ocks.org/mike/map/) tutorial by Mike Bostock.

Data Sources
---

Only the processed data that is used to present the visualisation is included. Steps to reproduce the final data is included below, however is a manual process at present. You will require [GDAL](http://www.gdal.org/) to use the `ogr2ogr` spatial transformation utility used heavily here.

#### Countries & Placenames

* Install dependencies: `npm install`
* Download the 1:10m cultural vectors from Natural Earth Data. You'll need "Admin 0 - Countries" and "Populated Places" (simple version is fine).
* Extract the zips - inside each folder will be a bunch of files - the main one is the `*.shp` file, but this depends on the other files for all the other info. Don't make the mistake I did and just copy the shp file, things will not work in very confusing ways.
* Jump into the 'data' directory
* Just extract NZ from Countries shapefile, and transform to GeoJSON: `ogr2ogr -f GeoJSON -where "ADM0_A3 IN ('NZ')" new_zealand.json PATH_TO_COUNTRIES_SHAPEFILE.shp`
* Extract NZ placenames, but only highly-populated places: `ogr2ogr -f GeoJSON -where "ISO_A2 = 'NZ' AND SCALERANK < 8" places.json PATH_TO_PLACES_SHAPEFILE.shp`
* Combine both GeoJSON files in a compactor representation using [TopoJSON](https://github.com/mbostock/topojson): `./../node_modules/topojson/bin/topojson -o nz.json --id-property SU_A3 --properties name=NAME -- new_zealand.json places.json`
* You can now remove the countries and places shapefiles, and the GeoJSON files (new_zealand.json and places.json) - `nz.json` now contains data from both of these files.

#### Transmission Lines

Transpower has a [an ArcGIS REST Server](https://spatial.transpower.co.nz/arcgis/rest/services) available, but at the time of writing, the query interface was throwing a `-2147024809` error - from some basic Googling, this seems to be a configuration error on their part. Instead, I've extracted the object IDs from the ArcGIS map in a web browser, and then written a node script to download the object data using the REST API.

For convenience, I've left the array of object IDs in the data directory, however if you wish to update it, simply load [the ArcGIS REST Server for Transmission lines](https://spatial.transpower.co.nz/arcgis/rest/services/Public/TransmissionLines/MapServer), open the map view by clicking "ArcGIS.com Map", expand "TransmissionLines" -> "Transline", and hit the Filter icon. Select "type" from the dropdown and enter "TRANSLINE". This will ensure only overhead transmission lines are shown. Once the filter is active, you can click the 'Table' icon to show the data table, and then open a developer console and paste the following to extract the IDs as JSON:

```
  var objectIdNodes = document.querySelectorAll('.field-OBJECTID');
  JSON.stringify(map.call(objectIdNodes, function(node) { return node.innerText; }));
```

You can then paste this into the object IDs JSON file and remove the surrounding quotes.

With the object IDs file, you can run the node script provided to download the transmission line ArcGIS JSON (which is different from GeoJSON): `node data/fetchTranspowerObjects.js`. This will save to a file named `data/transpowerTransmissionLinesArc.json`.

Once you have the Arc JSON, you can run the following command inside the data directory to transform it to GeoJSON and WGS84 (normal lat/lng):

`ogr2ogr -f GeoJSON transmissionLinesGeo.json transpowerTransmissionLinesArc.json -t_srs EPSG:4326`

And then you can run topojson to transform it into the final TopoJSON format:

`./../node_modules/topojson/bin/topojson -o transmissionLines.json --id-property "OBJECTID" -- transmissionLinesGeo.json`

Once this is done, you can clean up all the transmission line data files aside from the (possibly updated) object ID file and the `transmissionLines.json` file.


Data Licensing
---

Natual Earth Data is released into the Public Domain without claim. Nevertheless, it is a great source of data and I'm grateful to the volunteers there for making the information freely and openly available.

Transpower transmission data is licensed by [CC BY 3.0 NZ](https://creativecommons.org/licenses/by/3.0/nz/). Correct attribution is displayed on the map.