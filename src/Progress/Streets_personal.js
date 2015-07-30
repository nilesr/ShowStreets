var Progress = Progress || {};
var angleTo = function(pa, pb) {
	return Math.atan((pb[1] - pa[1])/(pb[0] - pa[0])); // Returns in radians
}
var distance = function(pa, pb) {
	// Euclidean distance
	return Math.abs(Math.sqrt(Math.pow(pb[1]-pa[1], 2)+Math.pow(pb[0]-pa[0], 2)));
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
		var sidewalkmap = "test";
		var streetmap = "test";

		$.getJSON("json.pyhtml?type=personal", function(data) {
			streetmap = L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					return {color: feature.properties.stroke, opacity: 0.75, weight: 3};
				},
				onEachFeature: onEachFeature
			});
			streetmap.addTo(Progress.map);
			$("#load_fog").click(function() {
				$("#load_fog_button").html("Loading...").addClass("pure-button-disabled"); // This isn't working :(
				var points = [];
				var squares = [];
				// Even with a complexity_constant of 3 and a distance_between_points of .0008, it still takes ~30 seconds to load.
				// With a complexity_constant of 128 and the same distance_between_points it takes 1:15 to load. 
				var complexity_constant = 4; // Was 10
				var vertical_stretch_factor = 0.8;
				//var radius = 0.0015;
				var radius = 0.0008;
				//var distance_between_points = (1/vertical_stretch_factor)*radius/2 + .00001
				var distance_between_points = radius;
				for (var i = 0; i < data["features"].length; i++) {
					for (var s = 0; s < data["features"][i]["geometry"]["coordinates"].length; s++) {
						if (data["features"][i]["geometry"]["coordinates"][s]) { // This is necessary because some of the points are null. Dunno why
							// These are just to make code easier to write, they will not be changed
							var pa = data["features"][i]["geometry"]["coordinates"][s];
							var pb = data["features"][i]["geometry"]["coordinates"][s+1]; // Because this might be null, we need the following while loop.
							points.push(pa);
							var a = 1;
							while (pb === null) {
								a++;
								pb = data["features"][i]["geometry"]["coordinates"][s+a];
							}
							if (pb && distance(pa, pb) > distance_between_points) {
								for (var k = 0; k < ( distance(pa, pb) / distance_between_points ) - 1; k += distance_between_points) {
									points.push([pa[0] + (distance_between_points * Math.cos(angleTo(pa, pb))), pa[1] + (distance_between_points * Math.sin(angleTo(pa, pb)))]);
								}
							}
						}
					}
				}
				for (var i = 0; i < points.length; i++) {
					var coords = [[]];
					for (var j = 0; j < complexity_constant; j++) {
						coords[0].push([points[i][0] + radius * Math.sin(2 * Math.PI * j/complexity_constant + (Math.PI / 4)), points[i][1] + vertical_stretch_factor * radius * Math.cos(2 * Math.PI * j/complexity_constant + (Math.PI / 4))]); // The extra pi/4 is so that if you have a complexity_constant of 4, the squares are aligned east/west instead of 45° off.
					}
					coords[0].push(coords[0][0]);
					squares.push({
						"type": "Feature",
						"properties": {
							"fill": "#fff"
						},
						"geometry": {
						"type": "Polygon",
						"coordinates": coords
						}
					});
				}
				squares2 = {
					"type": "FeatureCollection",
					"features": squares
				}
				squares3 = turf.merge(squares2);
				squares3.geometry.coordinates.push([
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
				L.geoJson(squares3, {
					style: function(feature) {
						return {fillColor: "#000000", fillOpacity: 0.5, clickable: false, lineJoin: "round", className: "squares3", color: "#000000"};
					}
				}).addTo(Progress.map);
				$("#load_fog").remove();
			});
			$("#loading").html("");
		})
		.fail(function (result) {
			$("#loading").html("Fatal error.");
			console.log("Failed on: ", result);
		});
	}
	// Public methods
	self.init = _init;

	return self;
}($, L))

