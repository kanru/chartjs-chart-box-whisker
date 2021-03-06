﻿'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	var defaultConfig = {
		position: 'left',
		ticks: {
			callback: Chart.Ticks.formatters.linear
		}
	};

	var BoxWhiskerLinearScale = Chart.scaleService.getScaleConstructor('linear').extend({

		determineDataLimits: function() {
			var me = this;
			var chart = me.chart;
			var data = chart.data;
			var datasets = data.datasets;
			var isHorizontal = me.isHorizontal();

			function IDMatches(meta) {
				return isHorizontal ? meta.xAxisID === me.id : meta.yAxisID === me.id;
			}

			// First Calculate the range
			me.min = null;
			me.max = null;

			// Regular charts use x, y values
			// For the Box Whisker chart we have rawValue.max and rawValue.min for each point
			helpers.each(datasets, function(dataset, datasetIndex) {
				var meta = chart.getDatasetMeta(datasetIndex);
				if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {			
					helpers.each(dataset.data, function(rawValue, index) {
						if (rawValue.dummy) {
							return;
						}
						var max = rawValue.max;
						var min = rawValue.min;
						
						if (me.min === null) {
							me.min = min;
						} else if (min < me.min) {
							me.min = min;
						}
						
						if (me.max === null) {
							me.max = max;
						} else if (max > me.max) {
							me.max = max;
						}
					});
				}
			});

			// Add whitespace around bars. Axis shouldn't go exactly from min to max
			me.min = me.min - me.min * 0.05;
			me.max = me.max + me.max * 0.05;

			// Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
			this.handleTickRangeOptions();
		}
	});
	Chart.scaleService.registerScaleType('BoxWhiskerLinear', BoxWhiskerLinearScale, defaultConfig);

};
