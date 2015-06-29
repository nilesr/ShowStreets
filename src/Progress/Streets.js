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
			// does this feature have a property named popupContent?
			if (feature.properties && feature.properties.type) {
				// http://gis.stackexchange.com/questions/31951/how-to-show-a-popup-on-mouse-over-not-on-click
				try {
					num = $.get("/audit_stats/total_audits/".concat(feature.id), function(data) { 
						if (data.trim() == "1") {
						  var plural = "person has";
						} else {
						  var plural = "people have";
						}
						console.log(feature.geometry)
						layer.bindPopup(data.concat(" ", plural, " audited this. ","<a href=\"/audit/",feature.properties.type,"/",feature.id,"\">Audit</a>")); 
					});
				}
				catch(e) {
					layer.bindPopup(e.message);
				}
				// layer.on('mouseover', function (e) {
				//	 this.openPopup();
				// });
				// layer.on('mouseout', function (e) {
				//	 this.closePopup();
				// });
			}
		}

		// Show streets
		$.getJSON("resources/SmallMap_02_Streets.geojson", function(data) {
			L.geoJson(data, {
			pointToLayer: L.mapbox.marker.style,
			style: function(feature) {
				//console.log(feature.properties.type);
				var tempStyle = $.extend(true, {}, mystyle);
				var randomInt = Math.floor(Math.random() * 5);

				tempStyle.color = Color.Pallet.sequential(randomInt);
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
		$.getJSON("resources/SmallMap_02_Sidewalks.geojson", function(data) {
			L.geoJson(data, {
				pointToLayer: L.mapbox.marker.style,
				style: function(feature) {
					// console.log(feature.properties.type);
					var tempStyle = $.extend(true, {}, mystyle);
					var randomInt = Math.floor(Math.random() * 5);

					//console.log(feature);
					switch (feature.properties.type) {
						case "footway" :
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
