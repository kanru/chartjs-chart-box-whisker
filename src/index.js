'use strict';

var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;

require('./scale.timeseries.js')(Chart);
require('./scale.BoxWhisker.js')(Chart);
require('./element.BoxWhisker.js')(Chart);
require('./controller.BoxWhisker.js')(Chart);
