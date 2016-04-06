var margin = { top: 30, right: 30, bottom: 40, left: 50 }

var height = 1000 - margin.top - margin.bottom,
width = 1100 - margin.left - margin.right,
seasonWidth = 45,
teamHeight = 20,
offset = 2;


//console.log(maxPlace);

var seasondiv = d3.select("#chart").append('svg')
				.style('background', '#E7E0CB')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.right)
				.append('g')
				.attr('transform', 'translate('+ margin.left + ', ' + margin.top +')');
				//.selectAll("g")
				// .data(json)
                //.append("text")
                //.text(function(d) {return d.season});
				//.html(function (d) { return d.season + ' ' + d.winners_place; });


//console.log(standings);

//standings.selectAll("rect").selectAll("text")

d3.json('seasons.json', function(json) {
	var maxPlace = d3.max(json, function(d) { return +d.winners_place;} );
	console.log(maxPlace);

	var seasondiv2 = d3.select("#chart svg g").selectAll("g")
		.data(json)
		.enter()
		.append("g")
		.attr("class","season")
		.attr("width",seasonWidth)
		.attr("height",height)
		.attr('transform', function(d,i) {
			return "translate("+((seasonWidth+offset)*i)+","+
				((teamHeight+offset)*(maxPlace - d.winners_place))+")";
		});

	var standings = seasondiv2.selectAll("rect")
		.data(function(d) {return d.standings})
		.enter()
		.append("rect")
		.attr("class", function(d) {return d.result_short + " " + d.division_place})
		.attr("width",seasonWidth)
		.attr("height",teamHeight)
		.attr("transform", function(d,i) {return "translate(0,"+ ((teamHeight + offset) * i)+")";})
		.html(function (d) { return d.team});

	var text = standings.selectAll("text")
		.data(function(d) {return d})
		.enter()
		.append("text")
		.attr("x", seasonWidth/2)
		.attr("y", function(d,i) {return ((teamHeight + offset) * i) + (teamHeight/2);})
		.attr("text-anchor", "middle")
		.attr("class", function(d) {return d.result_short + " " + d.division_place})
		//.attr("id", function(d) {return json.season + d.abbrev})
		.text(function(d) {return d.abbrev;});
	var year = seasondiv2.selectAll("text.year")
		.data(function(d) {return d.season})
		.enter()
		.append("text")
		.attr('class', 'year')
		.text(function(d) {return d;});

});
