var Progress = Progress || {};
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
			for (var i = 0; i < data["features"].length; i++) {
				for (var s = 0; s < data["features"][i]["geometry"]["coordinates"].length; s++) {
					if (data["features"][i]["geometry"]["coordinates"][s]) { // This is necessary because some of the points are null. Dunno why
						points.push(data["features"][i]["geometry"]["coordinates"][s]);
					}
				}
			}
			//var squarewidth = 0.0015;
			var squarewidth = 0.0011;
			for (var i = 0; i < points.length; i++) {
				squares.push({
					"type": "Feature",
					"properties": {
						"fill": "#fff"
					},
					"geometry": {
					"type": "Polygon",
					"coordinates": [
							[[points[i][0] - squarewidth, points[i][1] - squarewidth],
							[points[i][0] + squarewidth, points[i][1] - squarewidth],
							[points[i][0] + squarewidth, points[i][1] + squarewidth],
							[points[i][0] - squarewidth, points[i][1] + squarewidth],
							[points[i][0] - squarewidth, points[i][1] - squarewidth]]
						]
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

