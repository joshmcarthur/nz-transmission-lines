var http = require('https');
var fs   = require('fs');

var objectIds = JSON.parse(fs.readFileSync('./data/transpowerObjectIds.json', 'utf-8'));
var host      = 'https://spatial.transpower.co.nz';
var stream    = fs.createWriteStream('./data/transpowerTransmissionLinesArc.json');

console.log(host + buildPath());

http.get(host + buildPath(), function(res) {
  res.pipe(stream);
})
.on('error', function(err) {
  throw err;
});

function buildPath() {
  basePath = '/arcgis/rest/services/Public/TransmissionLines/MapServer/0/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&objectIds=OBJECTIDS&outFields=*';
  basePath = basePath.replace('OBJECTIDS', objectIds.join(','));

  return basePath;
}
