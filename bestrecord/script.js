// var seasondata = [];

d3.json('seasons.json', function(json) {
    //console.log(json);
    //console.log(json.seasons[1].standings[5]);
    //console.log(d3.keys(json));
    //console.log(d3.values(json[0]));
    
    var margin = { top: 30, right: 30, bottom: 40, left: 50 }

    var height = 1000 - margin.top - margin.bottom,
        width = 800 - margin.left - margin.right,
        seasonWidth = 50,
        teamHeight = 25,
        offset = 5;

    var seasondiv = d3.select("#chart").append('svg')
    					.style('background', '#E7E0CB')
    					.attr('width', width + margin.left + margin.right)
    					.attr('height', height + margin.top + margin.right)
    					.append('g')
    					.attr('transform', 'translate('+ margin.left + ', ' + margin.top +')')
    					.selectAll("g")
						.data(json)
						.enter()
						.append("g")
						.attr('transform', function(d,i) {return "translate("+((seasonWidth+offset)*i)+","+((teamHeight+offset)*d.winners_place)+")";})
						.attr("class","season")
						.attr("width",seasonWidth)
						.attr("height",height);
						//.html(function (d) { return d.season + ' ' + d.winners_place; });
	
	seasondiv.selectAll("rect")
		.data(function(d) {return d.standings})
		.enter()
		.append("rect").attr("class","team")
		.attr("width",seasonWidth)
		.attr("height",teamHeight)
		.attr("transform", function(d,i) {return "translate(0,"+ ((teamHeight + offset) * i)+")";})
		.html(function (d) { return d.team});

});
