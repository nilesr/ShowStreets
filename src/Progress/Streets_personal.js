var Progress = Progress || {};
var angleTo = function(pa, pb) {
	if (pa == undefined) return -1000;
	if (pb == undefined) return -1000;
	var result = Math.atan((pb[1] - pa[1])/(pb[0] - pa[0]));
	if (result < 0) {
		result = result + (2 * Math.PI);
	}
	return result;
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
		var polygon = {
			"type": "FeatureCollection",
			"features": [
				{
					"type": "Feature",
					"properties": {},
					"geometry": {
						"type": "Polygon",
						"coordinates": [
							[
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
							]
						]
					}
				}
			]
		}
		L.geoJson(polygon, {
			style: function(feature) {
				return {fillColor: "#000000", "fillOpacity": 0.5};
			}
		}).addTo(Progress.map);
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
			for (var i = 0; i < data["features"].length; i++) {
				for (var s = 0; s < data["features"][i]["geometry"]["coordinates"].length; s++) {
					points.push(data["features"][i]["geometry"]["coordinates"][s]);
				}
			}
			var basepoint = points[0];
			for (var i = 0; i < points.length; i++) {
				if (points[i][0] < basepoint[0]) {
					basepoint = points[i];
				}
			}
			var currentpoint = basepoint;
			var donepoints = [basepoint];
			var nextpoint = currentpoint;
			while (true) {
				for (var i = 0; i < points.length; i++) {
					if (angleTo(currentpoint, points[i]) < angleTo(currentpoint, nextpoint)) {
						nextpoint = points[i];
					}
				}
				donepoints.push(currentpoint);
				currentpoint = nextpoint;
				if (currentpoint == basepoint) {
					break;
				}
				break;
			}
			console.log(donepoints);
		})
		.fail(function (result) {
			console.log("Failed on: ", result);
		});

		//Progress.map.on('zoomend', function() {
		//});
	}
	// Public methods
	self.init = _init;

	return self;
}($, L))

