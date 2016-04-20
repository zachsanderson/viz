// Constants:
var MARGIN = { top: 30, right: 60, bottom: 30, left: 60 };
var HEIGHT = 1100 - MARGIN.top - MARGIN.bottom,
  WIDTH = 1100 - MARGIN.left - MARGIN.right,
  SEASON_WIDTH = 45,
  TEAM_HEIGHT = 20,
  OFFSET = 2,
  POPUP = { width: 160, height: 54, show: 500, hide: 250 };

//
// Create the basic SVG element and properties
d3.select("#chart").append('svg')
  .style('background', '#FFFFFF')
  .attr('width', WIDTH + MARGIN.left + MARGIN.right)
  .attr('height', HEIGHT + MARGIN.top + MARGIN.right)
  .append('g')
  .attr('transform', 'translate('+ MARGIN.left + ', ' + MARGIN.top +')');

// 
// Read our data and create the graph:
d3.json('seasons.json', function(json) {
  var maxPlace = d3.max(json, function(d) { return +d.winners_place;} );

  var seasonCol = d3.select("#chart svg g").selectAll("g")
    .data(json)
    .enter()
    .append("g")
    .attr("class","season")
    .attr('transform', function(d,i) {
      return "translate("+((SEASON_WIDTH+OFFSET)*i)+","+
        ((TEAM_HEIGHT+OFFSET)*(maxPlace - d.winners_place + 1))+")";
    });


  // Create a group for each team:
  var standings = seasonCol.selectAll('g')
    .data(function(d) { return d.standings; })
    .enter()
    .append('g')
    .attr('class', 'standings')
    // Add a mouse over handler to animate an expansion of our rectangle
    .on('click', function(d, i) { standingsExpand(d3.select(this), d, i); })
    // Move into the position of the rect, based on the offset of the team
    // in our data array (i) +1 (to allow space for the year in the column):
    .attr("transform", function(d,i) {
      return "translate(0,"+ ((TEAM_HEIGHT + OFFSET) * (i + 1))+")";
    });

  // Put a rect inside:
  // The position of these will be relative to the translate on our 'g.standings'
  standings.append("rect")
    .attr("class", function(d) {return d.result_short + " " + d.division_place})
    .attr("width", SEASON_WIDTH)
    .attr("height", TEAM_HEIGHT);
  // And add text ontop of that rect:
  standings.append("text")
    .attr("x", SEASON_WIDTH / 2)
    .attr("y", TEAM_HEIGHT / 2)
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
    .attr('x', SEASON_WIDTH / 2).attr('y', TEAM_HEIGHT / 2)
    .text(function(d) { return d.season; });
});

/**
 * Standings popup window that is appended, and then animated
 * onto the top of the graph, for the additional information.
 */
function standingsExpand(el, data, i)
{
  // First close any open popups
  if (!d3.selectAll('.standings-popup').empty())
  {
    standingsShrink(d3.select('.standings-popup'));
  }
  

  // Calculate the top middle of the current Standings el, in the
  // primary SVG coordinate system. (Cannot use getBBox() for this)
  var coords = getElementCoords(el, {x: el.attr('x'), y: el.attr('y') });
  coords.x += (SEASON_WIDTH / 2);
  var textX = coords.x;

  var popup = d3.select('svg').append('g')
    .attr('class', 'standings-popup')
    .on('click', function(d) { standingsShrink(d3.select(this)); });

  // Rectangle
  popup.append('rect')
    .attr('x', coords.x).attr('y', coords.y)
    .attr('class', el.select('rect').attr('class')) // For the same fill colors
    .attr('width', 0).attr('height', 0);

  // Now the actual transition from a single point to a popup window
  var transition = popup.transition().duration(POPUP.show);
    
  transition.selectAll('rect')
    .attr('width', POPUP.width)
    .attr('height', POPUP.height)
    .attr('x', coords.x - (POPUP.width / 2));

  // And add the text, after the end of the transition:
  transition.each('end', function() {
    var name = popup.append('text')
      .attr('x', coords.x).attr('y', coords.y + 10)
      .attr('text-anchor', 'middle')
      .text(data.team);
    // Handle the LA Angels of Anaheim:
    if (data.team.length > 22) name.style('font-size', '10px');

    popup.append('text')
      .attr('x', coords.x).attr('y', coords.y + 26)
      .attr('text-anchor', 'middle')
      .text(data.division + "  (" + data.division_place + ")");

    popup.append('text')
      .attr('x', coords.x).attr('y', coords.y + 42)
      .attr('text-anchor', 'middle')
      .text(data.wins + " / " + data.losses);
  });
}

/**
 * Close a selected Standings popup
 */
function standingsShrink(el)
{
  // Remove the text immediately
  el.selectAll('text').remove();

  // Transition the popup rect
  var transition = el.transition().duration(POPUP.hide)
    
  transition.select('rect')
    .attr('x', parseInt(el.select('rect').attr('x')) + (POPUP.width / 2))
    .attr('width', 0)
    .attr('height', 0)
    .remove();
  transition.remove();
}

/** 
 * Borrowed function 
 * http://stackoverflow.com/questions/18554224/getting-screen-positions-of-d3-nodes-after-transform
 **/
function getElementCoords(element, coords) 
{
  var ctm = element.node().getCTM(),
    xn = ctm.e + coords.x*ctm.a,
    yn = ctm.f + coords.y*ctm.d;
  return { x: xn, y: yn };
}
