'use strict';

module.exports = function(Chart) {

	Chart.defaults.BoxWhisker = {
		label: '',

		hover: {
			mode: 'label'
		},

		scales: {
			xAxes: [{
				type: 'timeseries',
				// grid line settings
				gridLines: {
					offsetGridLines: true
				},
				time: {
					format: 'll'
				}
			}],
			yAxes: [{
				type: 'BoxWhiskerLinear'
			}]
		},

		tooltips: {
			callbacks: {
				label: function(tooltipItem, data) {
					var max = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].max;
					var q3 = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].q3;
					var med = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].med;
					var q1 = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].q1;
					var min = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].min;

					return ['Max: ' + max.toFixed(2),
						'Q3:  ' + q3.toFixed(2),
						'Med: ' + med.toFixed(2),
						'Q1:  ' + q1.toFixed(2),
						'Min: ' + min.toFixed(2)];
				}
			}
		}
	};

	Chart.controllers.BoxWhisker = Chart.DatasetController.extend({

		dataElementType: Chart.elements.BoxWhisker,

		initialize: function() {
			var me = this;
			var meta;

			Chart.DatasetController.prototype.initialize.apply(me, arguments);

			meta = me.getMeta();
			meta.stack = me.getDataset().stack;
			meta.bar = true;
		},

		update: function(reset) {
			var me = this;
			var elements = me.getMeta().data;
			var i, ilen;

			me._ruler = me.getRuler();

			for (i = 0, ilen = elements.length; i < ilen; ++i) {
				me.updateElement(elements[i], i, reset);
			}
		},

		updateElement: function(box, index, reset) {
			var me = this;
			var chart = me.chart;
			var meta = me.getMeta();
			var dataset = me.getDataset();
			var custom = box.custom || {};

			box._xScale = me.getScaleForId(meta.xAxisID);
			box._yScale = me.getScaleForId(meta.yAxisID);
			box._datasetIndex = me.index;
			box._index = index;

			box._model = {
				datasetLabel: dataset.label || '',
				//label: '', // to get label value please use dataset.data[index].label

				// Appearance
				backgroundColor: dataset.backgroundColor,
				outlineColor: dataset.outlineColor,
				outlineWidth: dataset.outlineWidth
			};

			me.updateElementGeometry(box, index, reset);

			box.pivot();
		},

		/**
		 * @private
		 */
		updateElementGeometry: function(rectangle, index, reset) {
			var me = this;
			var model = rectangle._model;
			var vscale = me.getValueScale();
			var base = vscale.getBasePixel();
			var horizontal = vscale.isHorizontal();
			var ruler = me._ruler || me.getRuler();
			var ipixels = me.calculateBarIndexPixels(me.index, index, ruler);
			var box = me.calculateBoxValuesPixels(me.index, index);

			model.horizontal = horizontal;
			model.base = reset ? base : (box.q3 + box.q1) / 2;
			model.x = ipixels.center;
			model.y = reset ? base : (box.q3 + box.q1) / 2;
			model.height = undefined;
			model.width = ipixels.size;
			model.box = box;

		},

		/**
		 * @private
		 */
		getValueScaleId: function() {
			return this.getMeta().yAxisID;
		},

		/**
		 * @private
		 */
		getIndexScaleId: function() {
			return this.getMeta().xAxisID;
		},

		/**
		 * @private
		 */
		getValueScale: function() {
			return this.getScaleForId(this.getValueScaleId());
		},

		/**
		 * @private
		 */
		getIndexScale: function() {
			return this.getScaleForId(this.getIndexScaleId());
		},

		/**
		 * Returns the effective number of stacks based on groups and bar visibility.
		 * @private
		 */
		getStackCount: function(last) {
			var me = this;
			var chart = me.chart;
			var scale = me.getIndexScale();
			var stacked = scale.options.stacked;
			var ilen = last === undefined ? chart.data.datasets.length : last + 1;
			var stacks = [];
			var i, meta;

			for (i = 0; i < ilen; ++i) {
				meta = chart.getDatasetMeta(i);
				if (meta.bar && chart.isDatasetVisible(i) &&
					(stacked === false ||
						(stacked === true && stacks.indexOf(meta.stack) === -1) ||
						(stacked === undefined && (meta.stack === undefined || stacks.indexOf(meta.stack) === -1)))) {
					stacks.push(meta.stack);
				}
			}

			return stacks.length;
		},

		/**
		 * Returns the stack index for the given dataset based on groups and bar visibility.
		 * @private
		 */
		getStackIndex: function(datasetIndex) {
			return this.getStackCount(datasetIndex) - 1;
		},

		/**
		 * @private
		 */
		getRuler: function() {
			var me = this;
			var scale = me.getIndexScale();
			var options = scale.options;
			var stackCount = me.getStackCount();
			var fullSize = scale.isHorizontal() ? scale.width : scale.height;
			var tickSize = fullSize / scale.ticks.length;
			var categorySize = fullSize / me._data.length;
			var fullBarSize = categorySize / stackCount;
			var barSize = fullBarSize * 0.8;

			barSize = Math.min(
				Chart.helpers.getValueOrDefault(options.barThickness, barSize),
				Chart.helpers.getValueOrDefault(options.maxBarThickness, Infinity));

			return {
				stackCount: stackCount,
				tickSize: tickSize,
				categorySize: categorySize,
				categorySpacing: fullBarSize - barSize,
				fullBarSize: fullBarSize,
				barSize: barSize,
				barSpacing: fullBarSize - barSize,
				scale: scale
			};
		},

		calculateBoxValuesPixels: function(datasetIndex, index) {

			var me = this;
			var chart = me.chart;
			var meta = me.getMeta();
			var scale = me.getValueScale();
			var datasets = chart.data.datasets;

			return {
				max: scale.getPixelForValue(Number(datasets[datasetIndex].data[index].max)),
				q3: scale.getPixelForValue(Number(datasets[datasetIndex].data[index].q3)),
				med: scale.getPixelForValue(Number(datasets[datasetIndex].data[index].med)),
				q1: scale.getPixelForValue(Number(datasets[datasetIndex].data[index].q1)),
				min: scale.getPixelForValue(Number(datasets[datasetIndex].data[index].min))
			};
		},

		/**
		 * @private
		 */
		calculateBarIndexPixels: function(datasetIndex, index, ruler) {
			var me = this;
			var scale = ruler.scale;
			var isCombo = me.chart.isCombo;
			var stackIndex = me.getStackIndex(datasetIndex);
			var base = scale.getPixelForValue(null, index, datasetIndex, isCombo);
			var size = ruler.barSize;

			base -= isCombo ? ruler.tickSize / 2 : 0;
			base += ruler.fullBarSize * stackIndex;
			base += ruler.categorySpacing / 2;
			base += ruler.barSpacing / 2;

			return {
				size: size,
				base: base,
				head: base + size,
				center: base + size / 2
			};
		},

		draw: function() {
			var ctx = this.chart.chart.ctx;
			var elements = this.getMeta().data;
			var dataset = this.getDataset();
			var ilen = elements.length;
			var i = 0;
			var d;

			Chart.canvasHelpers.clipArea(ctx, this.chart.chartArea);

			for (; i < ilen; ++i) {
				d = dataset.data[i].q3;
				if (d !== null && d !== undefined && !isNaN(d)) {
					elements[i].draw();
				}
			}

			Chart.canvasHelpers.unclipArea(ctx);
		},

		removeHoverStyle: function(element, elementOpts) {
			
		},

		setHoverStyle: function(element) {
			
		}
	});
};
