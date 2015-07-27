var Progress = Progress || {};
var angleTo = function(pa, pb) {
	return Math.atan((pb[1] - pa[1])/(pb[0] - pa[0]));
}
var distance = function(pa, pb) {
	return Math.abs(Math.sqrt(Math.pow(pb[1]-pa[1], 2)+Math.pow(pb[0]-pa[0], 2)));
}
Progress.streets = (function Streets($, L) {
	var self = {};

	function _init() {
		// Styling: http://leafletjs.com/examples/geojson.html
		// http://leafletjs.com/reference.html#path-dasharray
		// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
		var mystyle = {
			color: "#ccc",
			weight: 2,
			opacity: 0.75
		};

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
			$("#loading").html("");
			streetmap = L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					var tempStyle = $.extend(true, {}, mystyle);
					tempStyle.color = feature.properties.stroke
					tempStyle.opacity = 0.75;
					tempStyle.weight = 3;
					return tempStyle;
				},
				onEachFeature: onEachFeature
			});
			streetmap.addTo(Progress.map);
			var points = [];
			var squares = [];
			var distance_between_points = .00075;
			for (var i = 0; i < data["features"].length; i++) {
				for (var s = 0; s < data["features"][i]["geometry"]["coordinates"].length; s++) {
					if (data["features"][i]["geometry"]["coordinates"][s]) { // This is necessary because some of the points are null. Dunno why
						// These are just to make code easier to write, they will not be changed
						var pa = data["features"][i]["geometry"]["coordinates"][s]
						var pb = data["features"][i]["geometry"]["coordinates"][s+1]
						points.push(pa);
						if (pb && distance(pa, pb) > distance_between_points) {
							for (var k = 0; k < ( distance(pa, pb) / distance_between_points ) - 1; k += distance_between_points) {
								points.push([pa[0] + (distance_between_points * Math.cos(angleTo(pa, pb))), pa[1] + (distance_between_points * Math.sin(angleTo(pa, pb)))]);
							}
						}
					}
				}
			}
			//var radius = 0.0015;
			var radius = 0.0008;
			for (var i = 0; i < points.length; i++) {
				/*var coords = [
					[[points[i][0] - radius, points[i][1] - radius],
					[points[i][0] + radius, points[i][1] - radius],
					[points[i][0] + radius, points[i][1] + radius],
					[points[i][0] - radius, points[i][1] + radius],
					[points[i][0] - radius, points[i][1] - radius]]
				];*/
				var coords = [[]];
				var complexity_constant = 20;
				var vertical_stretch_factor = 0.8;
				for (var j = 0; j < complexity_constant; j++) {
					coords[0].push([points[i][0] + radius * Math.sin(2 * Math.PI * j/complexity_constant), points[i][1] + vertical_stretch_factor * radius * Math.cos(2 * Math.PI * j/complexity_constant)]);
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
			squares3 = turf.merge(squares2, function(err, out) {alert(out);});
			console.log(JSON.stringify(squares2, null));
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
					return {fillColor: "#000000", fillOpacity: 0.5, weight: 0};
				}
			}).addTo(Progress.map);
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

