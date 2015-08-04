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

		function onEachFeature(feature, layer, ziptype) {
			layer.bindPopup("<div id=\"feature-".concat(feature.properties.id, "\" class=\"FeaturePopup\">Loading...</div>"));
			$(layer).click(function() {
				load(feature.properties.id, feature.geometry.type, ziptype);
			});
		}
		function onEachFeatureNeighborhood(feature, layer) {
			onEachFeature(feature, layer, "neighborhood");
		}
		function onEachFeatureZip(feature, layer) {
			//feature.properties.id = feature.properties.NAME;
			onEachFeature(feature, layer, "zip");
		}
		function onEachFeatureWrapper(feature, layer) {
			onEachFeature(feature, layer, null);
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
				return {fillColor: "#ffffff", "fillOpacity": 0.5};
			}
		}).addTo(Progress.map);
		// Because javascript is so bad, these have to be predefined, you can't just add "var " to the declarations below or it will define them in a local scope and they won't be accessible from the zoomend hook.
		var sidewalkmap = "test";
		var streetmap = "test";
		var zipcodemap = "test";
		var neighborhoodmap = "test";
		var zip = false;

		$.getJSON("json.pyhtml?file=new4.geojson", function(data) {
			neighborhoodmap = L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					return {fillColor: feature.properties.stroke, "fillOpacity": 0.5, weight: 0};
				},
				onEachFeature: onEachFeatureNeighborhood
			});
			streetmap.addTo(Progress.map);
			$("#loading_neighborhood").html("");
		})
		.fail(function (result) {
			console.log("Failed on: ", result);
		});
		$.getJSON("json.pyhtml?file=new3.geojson", function(data) {
			zipcodemap = L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					return {fillColor: feature.properties.stroke, "fillOpacity": 0.5, weight: 0};
				},
				onEachFeature: onEachFeatureZip
			});
			zipcodemap.addTo(Progress.map);
			$("#loading_zip").html("");
		})
		.fail(function (result) {
			console.log("Failed on: ", result);
		});
		$.getJSON("json.pyhtml?file=SmallMap_02_Streets.geojson", function(data) {
			streetmap = L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					var tempStyle = $.extend(true, {}, mystyle);
					tempStyle.color = feature.properties.stroke
					tempStyle.opacity = 0.75;
					tempStyle.weight = 3;
					return tempStyle;
				},
				onEachFeature: onEachFeatureWrapper
			});
			streetmap.addTo(Progress.map);
		}).fail(function (result) {
			console.log("Failed on: ", result);
		});

		// Show sidewalks
		$.getJSON("json.pyhtml?file=SmallMap_02_Sidewalks.geojson", function(data) {
			sidewalkmap = L.geoJson(data, {
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
				onEachFeature: onEachFeatureWrapper
			});
			sidewalkmap.addTo(Progress.map);
		})
		.fail(function (result) {
			console.log(result);
		});
		var updateLayers = function() {
			zip = document.getElementById("zip_zip").checked;
			localStorage.setItem("zip", zip)
			if (Progress.map.getZoom() < 14) { // Used to be 16. 
				if (Progress.map.hasLayer(sidewalkmap)) {
					Progress.map.removeLayer(sidewalkmap);
				}
				if (Progress.map.hasLayer(streetmap)) {
					Progress.map.removeLayer(streetmap);
				}
				if (zip) {
					if (!Progress.map.hasLayer(zipcodemap)) {
						Progress.map.addLayer(zipcodemap);
					}
					if (Progress.map.hasLayer(neighborhoodmap)) {
						Progress.map.removeLayer(neighborhoodmap);
					}
				} else {
					if (!Progress.map.hasLayer(neighborhoodmap)) {
						Progress.map.addLayer(neighborhoodmap);
					}
					if (Progress.map.hasLayer(zipcodemap)) {
						Progress.map.removeLayer(zipcodemap);
					}
				}
			} else {
				if (!Progress.map.hasLayer(sidewalkmap)) {
					Progress.map.addLayer(sidewalkmap);
				}
				if (!Progress.map.hasLayer(streetmap)) {
					Progress.map.addLayer(streetmap);
				}
				if (Progress.map.hasLayer(zipcodemap)) {
					Progress.map.removeLayer(zipcodemap);
				}
				if (Progress.map.hasLayer(neighborhoodmap)) {
					Progress.map.removeLayer(neighborhoodmap);
				}
			}
		}
		$("#zipRadio").click(function(){
			updateLayers();
		});
		Progress.map.on('zoomend', function() {
			updateLayers();
		});
	}
	// Public methods
	self.init = _init;

	return self;
}($, L))
