// Constants:
var margin = { top: 30, right: 30, bottom: 40, left: 50 };
var height = 850 - margin.top - margin.bottom,
  width = 1100 - margin.left - margin.right,
  seasonWidth = 45,
  teamHeight = 16,
  offset = 2;


//
// Create the basic SVG element and properties
d3.select("#chart").append('svg')
  .style('background', '#E7E0CB')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.right)
  .append('g')
  .attr('transform', 'translate('+ margin.left + ', ' + margin.top +')');

// 
// Read our data and create the graph:
d3.json('seasons.json', function(json) {
  var maxPlace = d3.max(json, function(d) { return +d.winners_place;} );
  console.log(maxPlace);

  var seasonCol = d3.select("#chart svg g").selectAll("g")
    .data(json)
    .enter()
    .append("g")
    .attr("class","season")
    .attr('transform', function(d,i) {
      return "translate("+((seasonWidth+offset)*i)+","+
        ((teamHeight+offset)*(maxPlace - d.winners_place + 1))+")";
    });


  // Create a group for each team:
  var standings = seasonCol.selectAll('g')
    .data(function(d) { console.log(d); return d.standings; })
    .enter()
    .append('g')
    .attr('class', 'standings')
    // Move into the position of the rect, based on the offset of the team
    // in our data array (i) +1 (to allow space for the year in the column):
    .attr("transform", function(d,i) {
      return "translate(0,"+ ((teamHeight + offset) * (i + 1))+")";
    });

  // Put a rect inside:
  // The position of these will be relative to the translate on our 'g.standings'
  standings.append("rect")
    .attr("class", function(d) {return d.result_short + " " + d.division_place})
    .attr("width", seasonWidth)
    .attr("height", teamHeight);
  // And add text ontop of that rect:
  standings.append("text")
    .attr("x", seasonWidth / 2)
    .attr("y", teamHeight / 2)
    .attr("text-anchor", "middle")
    .attr("class", function(d) {return d.result_short + " " + d.division_place})
    .text(function(d) {return d.abbrev;});
  // Add a tooltip:
  standings.append('title')
    .html(function (d) { return d.team });

  // Add the year to the column (assuming offset position 0)
  seasonCol.append('text')
    .attr("class", "year")
    .attr("text-anchor", "middle")
    // Offset position 0, so no translate is needed, just the x/y:
    .attr('x', seasonWidth / 2).attr('y', teamHeight / 2)
    .text(function(d) { return d.season; });

});
