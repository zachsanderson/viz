// Constants:
var MARGIN = { top: 30, right: 10, bottom: 30, left: 10 };
var HEIGHT = 950 - MARGIN.top - MARGIN.bottom,
  WIDTH = 1020 - MARGIN.left - MARGIN.right,
  SEASON_WIDTH = 40,
  TEAM_HEIGHT = 18,
  OFFSET = 2,
  POPUP = { width: 260, height: 140, show: 500, hide: 250 };

//
// Create the basic SVG element and properties
d3.select("#chart").append('svg')
  .style('background', '#FFFFFF')
  .attr('width', WIDTH + MARGIN.left + MARGIN.right)
  .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
  .append('g')
  .attr('transform', 'translate('+ MARGIN.left + ', ' + MARGIN.top +')');

// 
// Read our data and create the graph:
d3.json('seasons.json', function(json) {
  var maxPlace = d3.max(json, function(d) { return +d.winners_place;} );

  // Append flag to data for tied team records
  json.forEach(function(col){
    // Only need to start at 1 and compare since there is no team tied above the highest record
    for (var j = 1; j <= col.standings.length - 1; j++) {
      if (col.standings[j].percentage == col.standings[j - 1].percentage) {
        col.standings[j].tiedAbove = true;
        col.standings[j-1].tiedBelow = true;
      }
    }})

  var seasonCol = d3.select("#chart svg g").selectAll("g")
    .data(json)
    .enter()
    .append("g")
    .attr("class","season")
    .attr('transform', function(d,i) {
      return "translate("+((SEASON_WIDTH+OFFSET)*i)+","+
        ((TEAM_HEIGHT+OFFSET)*(maxPlace - d.winners_place))+")";
    });

  // Create a group for each team:
  var standings = seasonCol.selectAll('g')
    .data(function(d) { 
      //console.log(d); 
      return d.standings; 
    })
    .enter()
    .append('g')
    .attr('class', 'standings')
    // Add a mouse over handler to animate an expansion of our rectangle
    .on('mouseover', function(d, i) { standingsExpand(d3.select(this), d, i); })
    // Add mouseout for when mouse is not on any team rect
    .on('mouseout', function(d, i) { standingsShrink(d3.select('foreignObject'), d, i); })
    // Move into the position of the rect, based on the offset of the team
    // in our data array (i) +1 (to allow space for the year in the column):
    .attr("transform", function(d,i) {
      if (d.tiedAbove) {
        return "translate(0,"+ (((TEAM_HEIGHT + OFFSET) * (i + 1)) - (OFFSET / 2))+")";  
      } else {
        return "translate(0,"+ ((TEAM_HEIGHT + OFFSET) * (i + 1))+")";
      }
    });

  // Put a rect inside:
  // The position of these will be relative to the translate on our 'g.standings'
  standings.append("rect")
    .attr("class", function(d) {return d.result_short + " place" + d.division_place})
    .attr("width", SEASON_WIDTH)
    .attr("height", function(d,i) {
      if (d.tiedAbove && d.tiedBelow) {
        return (TEAM_HEIGHT + OFFSET);
      } else if (d.tiedAbove || d.tiedBelow) {
        return (TEAM_HEIGHT + (OFFSET / 2));
      } else {
        return (TEAM_HEIGHT);
      }
    });
  // And add text ontop of that rect:
  standings.append("text")
    .attr("x", SEASON_WIDTH / 2)
    .attr("y", TEAM_HEIGHT / 2)
    .attr("text-anchor", "middle")
    .attr("class", function(d) {return d.result_short + " place" + d.division_place})
    .text(function(d) {return d.abbrev;});

  // Add the year to the column (assuming offset position 0)
  seasonCol.append('text')
    .attr("class", "year")
    .attr("text-anchor", "middle")
    // Offset position 0, so no translate is needed, just the x/y:
    .attr('x', SEASON_WIDTH / 2).attr('y', TEAM_HEIGHT / 2)
    .text(function(d) { return d.season; });
});

/**
 * Standings popup window that is appended
 * onto the top of the graph, for the additional information.
 */
function standingsExpand(el, data, i)
{
  // First close any open popups
  if (!d3.selectAll('foreignObject').empty())
  {
    standingsShrink(d3.select('foreignObject'));
  }
  

  // Calculate the top middle of the current Standings el, in the
  // primary SVG coordinate system. (Cannot use getBBox() for this)
  var arrowclass = "leftarrow";
  var coords = getElementCoords(el, {x: el.attr('x'), y: el.attr('y') });
  // Flag whether arrow should be on the left or right of the popup,
  if (coords.x < (WIDTH - (POPUP.width)))
    {
      coords.x += SEASON_WIDTH;
      arrowclass = "leftarrow";
    } else {
      coords.x -= POPUP.width;
      arrowclass = "rightarrow";
    }

  // Adjust height so arrow of popup is down the side of the popup somewhat
  coords.y -= 25 - (TEAM_HEIGHT / 2);

  var textX = coords.x;

  // Add foreignObject for popup to allow for HTML elements and formatting
  var popup = d3.select('svg').append('foreignObject')
    .attr('class', arrowclass)
    .attr('x', coords.x)
    .attr('y', coords.y)
    .attr('width', POPUP.width)
    .attr('height', POPUP.height)
    .append('xhtml:div')
    .attr('class', 'standings-tooltip ' + arrowclass)
    .on('click', function(d) { standingsShrink(d3.select(this)); });

  popup.append('xhtml:img')
      .attr('src', 'images/' + data.abbrev + '.png');

  popup.append('xhtml:h2')
      .html(data.team);

  popup.append('xhtml:h3')
      .html(data.division_place + " in the " + data.division);

  popup.append('xhtml:h3')
      .html(data.wins + " - " + data.losses);

  if (data.result == "Did not advance")
  {
    popup.append('xhtml:p').html("Did not advance to playoffs");
  } else {
    popup.append('xhtml:p').html(data.result);
  }
}

/**
 * Close a selected Standings popup
 */
function standingsShrink(el)
{
  // Remove the element
  el.remove();
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
