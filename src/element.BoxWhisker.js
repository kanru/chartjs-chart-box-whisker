'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers,
	    globalOpts = Chart.defaults.global,
	    defaultColor = globalOpts.defaultColor;

	globalOpts.elements.BoxWhisker = {
		backgroundColor: "rgba(80, 160, 115, 1)",
		outlineColor: "rgba(90, 90, 90, 1)",
		outlineWidth: 1
	};

	function isVertical(bar) {
		return bar._view.width !== undefined;
	}

	/**
	 * Helper function to get the bounds of the box
	 * @private
	 * @param bar {Chart.Element.BoxWhisker} the bar
	 * @return {Bounds} bounds of the bar
	 */
	function getBarBounds(box) {
		var vm = box._view;
		var x1, x2, y1, y2;

		var halfWidth = vm.width / 2;
		x1 = vm.x - halfWidth;
		x2 = vm.x + halfWidth;
		y1 = vm.box.q3;
		y2 = vm.box.q1;


		return {
			left: x1,
			top: y1,
			right: x2,
			bottom: y2
		};
	}

	Chart.elements.BoxWhisker = Chart.Element.extend({
		draw: function() {
			var ctx = this._chart.ctx;
			var vm = this._view;
			var left, right, top, bottom, signX, signY, borderSkipped;
			var borderWidth = vm.borderWidth;


			var x = vm.x;
			var max = vm.box.max;
			var q3 = vm.box.q3;
			var med = vm.box.med;
			var q1 = vm.box.q1;
			var min = vm.box.min;

			ctx.strokeStyle = helpers.getValueOrDefault(vm.outlineColor, globalOpts.elements.BoxWhisker.outlineColor);
			ctx.lineWidth = helpers.getValueOrDefault(vm.outlineWidth, globalOpts.elements.BoxWhisker.outlineWidth);
			ctx.fillStyle = helpers.getValueOrDefault(vm.backgroundColor, globalOpts.elements.BoxWhisker.backgroundColor);

			ctx.beginPath();
			ctx.moveTo(x - vm.width / 2, max);
			ctx.lineTo(x + vm.width / 2, max);
			ctx.moveTo(x - vm.width / 2, min);
			ctx.lineTo(x + vm.width / 2, min);
			ctx.stroke();
			ctx.beginPath();
			ctx.setLineDash([5, 2]);
			ctx.moveTo(x, max);
			ctx.lineTo(x, min);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.fillRect(x - vm.width / 2, q1, vm.width, q3 - q1);
			ctx.strokeRect(x - vm.width / 2, q1, vm.width, q3 - q1);
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.moveTo(x - vm.width / 2, med);
			ctx.lineTo(x + vm.width / 2, med);
			ctx.stroke();
			ctx.closePath();
		},
		height: function() {
			var vm = this._view;
			return vm.base - vm.y;
		},
		inRange: function(mouseX, mouseY) {
			var inRange = false;

			if (this._view) {
				var bounds = getBarBounds(this);
				inRange = mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
			}
			return inRange;
		},
		inLabelRange: function(mouseX, mouseY) {
			var me = this;
			if (!me._view) {
				return false;
			}

			var inRange = false;
			var bounds = getBarBounds(me);

			if (isVertical(me)) {
				inRange = mouseX >= bounds.left && mouseX <= bounds.right;
			} else {
				inRange = mouseY >= bounds.top && mouseY <= bounds.bottom;
			}

			return inRange;
		},
		inXRange: function(mouseX) {
			var bounds = getBarBounds(this);
			return mouseX >= bounds.left && mouseX <= bounds.right;
		},
		inYRange: function(mouseY) {
			var bounds = getBarBounds(this);
			return mouseY >= bounds.top && mouseY <= bounds.bottom;
		},
		getCenterPoint: function() {
			var vm = this._view;
			var x, y;

			var halfWidth = vm.width / 2;
			x = vm.x - halfWidth;
			y = (vm.box.q3 + vm.box.q1) / 2;

			return { x: x, y: y };
		},
		getArea: function() {
			var vm = this._view;
			return vm.width * Math.abs(vm.y - vm.base);
		},
		tooltipPosition: function() {
			var vm = this._view;
			return {
				x: vm.x,
				y: (vm.box.q3 + vm.box.q1) / 2
			};
		}
	});

};

