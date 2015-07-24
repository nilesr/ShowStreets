var Progress = Progress || {};
var cmp = function(x, y) {
	if (x > y) {
		return 1
	}
	if (x == y) {
		return 0
	}
	return -1
}
var turn = function(p, q, r) {
	return cmp((q[0] - p[0])*(r[1] - p[1]) - (r[0] - p[0])*(q[1] - p[1]), 0)
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
		/*var polygon = {
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
		}*/
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
			function first() {
				d = new $.Deferred();
				for (var i = 0; i < data["features"].length; i++) {
					for (var s = 0; s < data["features"][i]["geometry"]["coordinates"].length; s++) {
						points.push(data["features"][i]["geometry"]["coordinates"][s]);
					}
				}
				return d.promise()
			}
			var basepoint = "temporary value";
			function second() {
				d = new $.Deferred();
				basepoint = points[0];
				for (var i = 0; i < points.length; i++) {
					if (points[i][0] < basepoint[0]) {
						basepoint = points[i];
					}
				}
				return d.promise()
			}
			var donepoints = [];
			function third() {
				d = new $.Deferred();
				var endpoint = basepoint;
				var pointOnHull = endpoint;
				for (var i = 0; true; i++) {
					donepoints[i] = pointOnHull
					for (var j = 0; j < points.length; j++) {
						if ( endpoint == pointOnHull || turn(donepoints[i], endpoint, points[j]) == 1) {
							endpoint = points[j];
						}
					}
					i += 1;
					pointOnHull = endpoint;
					if (endpoint == donepoints[0]) {
						break;
					}
				}
				return d.promise()
			}
			function fourth() {
				d = new $.Deferred();
				donepoints.push(donepoints[0])
				var donepoints2 = [];
				for (var i = 0; i < donepoints.length; i++) {
					if (donepoints[i]) {
						donepoints2.push(donepoints[i]);
					}
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
									donepoints2
								]
							}
						}
					]
				}
				//console.log(JSON.stringify(polygon, null));
				L.geoJson(polygon, {
					style: function(feature) {
						return {fillColor: "#000000", "fillOpacity": 0.5};
					}
				}).addTo(Progress.map);
				return d.promise()
			}
			function all() {
				var d = jQuery.Deferred(), p = d.promise();
				p.then(first).then(second).then(third).then(fourth);
				d.resolve();
			}
			all();
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

