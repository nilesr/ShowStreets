var Progress = Progress || {};
var polyToBullshit = function(square) {
	var final = "POLYGON((";
	for (var i = 0; i < square.length; i++) {
		var f = square[i]
		final = final.concat(f[0], " ", f[1], ", ")
	}
	return final.slice(0, -2).concat("))");
}
var angleTo = function(pa, pb) {
	return Math.atan((pb[1] - pa[1])/(pb[0] - pa[0])); // Returns in radians
}
var distance = function(pa, pb) {
	// Euclidean distance
	return Math.abs(Math.sqrt(Math.pow(pb[1]-pa[1], 2)+Math.pow(pb[0]-pa[0], 2)));
}
function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}
Progress.streets = (function Streets($, L) {
	var self = {};
	function _init() {
		// Styling: http://leafletjs.com/examples/geojson.html
		// http://leafletjs.com/reference.html#path-dasharray
		// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
		function onEachFeature(feature, layer) {
			layer.bindPopup("<div id=\"feature-".concat(feature.properties.id, "\" class=\"FeaturePopup\">Loading...</div>"));
			$(layer).click(function() {
				load(feature.properties.id, feature.geometry.type, null);
			});
		}
		// Because javascript is so bad, these have to be predefined, you can't just add "var " to the declarations below or it will define them in a local scope and they won't be accessible from the zoomend hook.
		var streetmap = "test";
		$.getJSON("json.pyhtml?type=personal", function(data) {
			streetmap = L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					//return {color: feature.properties.stroke, opacity: 0.75, weight: 3};
					return {color: "#000000", opacity: 0.75, weight: 3};
				},
				onEachFeature: onEachFeature
			});
			streetmap.addTo(Progress.map);
			var points = [];
			var squares = [];
			var complexity_constant = 40; // Was 10
			var vertical_stretch_factor = 0.8;
			//var radius = 0.0015;
			var radius = 0.0006;
			//var distance_between_points = (1/vertical_stretch_factor)*radius/2 + .00001
			var pairs = [];
			var distance_between_points = radius;
			for (var i = 0; i < data["features"].length; i++) {
				for (var s = 0; s < data["features"][i]["geometry"]["coordinates"].length; s++) {
					if (data["features"][i]["geometry"]["coordinates"][s]) { // This is necessary because some of the points are null. Dunno why
						// These are just to make code easier to write, they will not be changed
						var pa = data["features"][i]["geometry"]["coordinates"][s];
						var pb = data["features"][i]["geometry"]["coordinates"][s+1]; // Because this might be null, we need the following while loop.
						var a = 1;
						while (pb === null) { // Can't just do while !pb because if pb is undefined the while loop will become infinite
							a++;
							pb = data["features"][i]["geometry"]["coordinates"][s+a];
						}
						points.push(pa);
						if (pb && distance(pa, pb) > radius) {
							pairs.push([pa, pb]);
						}
					}
				}
			}
			for (var i = 0; i < points.length; i++) {
				var coords = [];
				for (var j = 0; j < complexity_constant; j++) {
					coords.push([points[i][0] + radius * Math.sin(2 * Math.PI * j/complexity_constant + (Math.PI / 4)), points[i][1] + vertical_stretch_factor * radius * Math.cos(2 * Math.PI * j/complexity_constant + (Math.PI / 4))]);
					// The extra pi/4 is so that if you have a complexity_constant of 4, the squares are aligned east/west instead of 45° off.
				}
				coords.push(coords[0]);
				squares.push(coords);
			}
			for (var i = 0; i < pairs.length; i++) {
				var pa = pairs[i][0];
				var pb = pairs[i][1];
				var coords = [];
				var recip = -1 / angleTo(pa, pb);
				coords.push([pa[0] + radius * Math.sin(recip), pa[1] + radius * Math.cos(recip)]);
				coords.push([pa[0] - radius * Math.sin(recip), pa[1] - radius * Math.cos(recip)]);
				coords.push([pb[0] - radius * Math.sin(recip), pb[1] - radius * Math.cos(recip)]);
				coords.push([pb[0] + radius * Math.sin(recip), pb[1] + radius * Math.cos(recip)]);
				coords.push(coords[0]);
				squares.push(coords);
			}
			var reader = new jsts.io.WKTReader();
			var parser = new jsts.io.GeoJSONParser();
			var base = reader.read(polyToBullshit(squares[0]));
			//squares = uniq_fast(squares);
			for (var i = 1; i < squares.length; i++) {
				base = base.union(reader.read(polyToBullshit(squares[i])));
			}
			var squares2 = parser.write(base);
			console.log(squares2)
			if (squares2.type == "Polygon") {
				squares2.coordinates.push([
					[
						180,
						-180
					],
					[
						180,
						180
					],
					[
						-180,
						180
					],
					[
						-180,
						-180
					],
					[
						180,
						-180
					]
				]);
				var squares3 = {
					"type": "FeatureCollection",
					"features": [squares2]
				};
			} else {
				var squares3 = {
					"type": "FeatureCollection",
					"features": [{
						"type": "Polygon",
						"coordinates": []
					}]
				};
				for (var i = 0; i < squares2.coordinates.length; i++) {
					squares3.features[0].coordinates.push(squares2.coordinates[i][0]);
				}
				squares3.features[0].coordinates.push([
					[
						180,
						-180
					],
					[
						180,
						180
					],
					[
						-180,
						180
					],
					[
						-180,
						-180
					],
					[
						180,
						-180
					]
				]);
			}
			console.log(JSON.stringify(squares3, null));
			L.geoJson(squares3, {
				style: function(feature) {
					return {fillColor: "#000000", fillOpacity: 0.5, clickable: false, lineJoin: "round", className: "squares3", color: "#000000"};
				}
			}).addTo(Progress.map);
			$("#loading").html("");
		})
		.fail(function (result) {
			$("#loading").html("Fatal error. ".concat(JSON.stringify(result, null)));
			console.log("Failed on: ", result);
		});
	}
	// Public methods
	self.init = _init;
	return self;
}($, L))

