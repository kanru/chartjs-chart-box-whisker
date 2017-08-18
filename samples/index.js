function randomNumber(min, max) {
	return Math.random() * (max - min) + min;
}

function randomBar(date, lastMax) {
	var max = randomNumber(lastMax * 0.95, lastMax * 1.05);
	var q3 = randomNumber(max * 0.90, max * 0.95);
	var med = randomNumber(q3 * 0.90, q3 * 0.95);
	var q1 = randomNumber(med * 0.90, med * 0.95);
	var min = randomNumber(q1 * 0.90, q1 * 0.95);
	return {
		t: date.valueOf(),
		max: max,
		q3: q3,
		med: med,
		q1: q1,
		min: min
	};
}

var dateFormat = 'MMMM DD YYYY';
var date = moment('April 01 2017', dateFormat);
var data = [randomBar(date, 30)];
while (data.length < 60) {
	date = date.add(1, 'd');
	if (date.isoWeekday() <= 5) {
		data.push(randomBar(date, data[data.length - 1].max));
	}
}
date = moment('April 01 2017', dateFormat);
var data2 = [randomBar(date, 30)];
while (data2.length < 60) {
	date = date.add(1, 'd');
	if (date.isoWeekday() <= 5) {
		data2.push(randomBar(date, data2[data2.length - 1].max));
	}
}

var ctx = document.getElementById("chart1").getContext("2d");
ctx.canvas.width = 1000;
ctx.canvas.height = 200;
new Chart(ctx, {
	type: 'BoxWhisker',
	data: {
		datasets: [{
			label: "Firefox",
			data: data,
			backgroundColor: 'rgb(256, 123, 0)'
		}, {
			label: "Chrome",
			data: data2,
			backgroundColor: 'rgb(0, 123, 256)'
		}]
	},
	options: {
		title: {
			display: true,
			position: 'bottom',
			text: 'Facebook Click Open Chat'
		},
		legend: {
			position: 'left'
		}
	}
});
var ctx = document.getElementById("chart2").getContext("2d");
ctx.canvas.width = 1000;
ctx.canvas.height = 200;
new Chart(ctx, {
	type: 'BoxWhisker',
	data: {
		datasets: [{
			label: "Firefox",
			data: data,
			backgroundColor: 'rgb(256, 123, 0)'
		}, {
			label: "Chrome",
			data: data2,
			backgroundColor: 'rgb(0, 123, 256)'
		}]
	},
	options: {
		title: {
			display: true,
			position: 'bottom',
			text: 'Facebook Click Open Chat Emoji'
		},
		legend: {
			position: 'left'
		}
	}
});
