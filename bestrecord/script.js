// var seasondata = [];

d3.json('seasons.json', function(json) {
    console.log(json);
    //console.log(json.seasons[1].standings[5]);
    console.log(d3.keys(json));
    console.log(d3.values(json[0]));
    var seasondiv = d3.select("#chart").selectAll("div.season")
						.data(json)
						.enter()
						.append("div")
						.attr("class","season")
						.html(function (d) { return d.season + '<br>' + d.winners_place; });
	seasondiv.selectAll("div")
		.data(function(d) {return d.standings})
		.enter()
		.append("div").attr("class","team")
		.html(function (d) { return d.team});

});
