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
				load(feature.properties.id);
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
									-75,
									36
								],
								[
									-75,
									40
								],
								[
									-78,
									40
								],
								[
									-78,
									36
								],
								[
									-75,
									36
								]
							]
						]
					}
				}
			]
		}	
		L.geoJson(polygon, {
			style: function(feature) {
				return {fillColor: "#ffffff", "fillOpacity": 0.5};
			}
		}).addTo(Progress.map);

		// Show streets
		$.getJSON("json.pyhtml?file=SmallMap_02_Streets.geojson", function(data) {
			L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					var tempStyle = $.extend(true, {}, mystyle);
					tempStyle.color = feature.properties.stroke
					tempStyle.opacity = 0.75;
					tempStyle.weight = 3;
					return tempStyle;
				},
				onEachFeature: onEachFeature
			})
			.addTo(Progress.map);
		})
		.fail(function (result) {
			console.log("Failed on: ", result);
		});

		// Show sidewalks
		$.getJSON("json.pyhtml?file=SmallMap_02_Sidewalks.geojson", function(data) {
			L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					// console.log(feature.properties.type);
					var tempStyle = $.extend(true, {}, mystyle);
					var randomInt = Math.floor(Math.random() * 5);

					//console.log(feature);
					switch (feature.properties.type) {
						case "footway":
							tempStyle.color = "#888";
							tempStyle.dashArray = "3, 2"
							break;
						case "crosswalk":
							tempStyle.color = "#444";
							//tempStyle.opacity = 0.25;
							break;
					}

					return tempStyle;
				},
				onEachFeature: onEachFeature
			})
			.addTo(Progress.map);
		})
		.fail(function (result) {
			console.log(result);
		});
	}
	// Public methods
	self.init = _init;

	return self;
}($, L))
