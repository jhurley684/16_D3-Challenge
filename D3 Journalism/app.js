
// SET UP SIZE, DIMENSION, & LOCATION OF CHART AREA
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Params - default to obesity
var chosenXAxis = "obesity";


// function used for updating x -scale var upon click on axis label

function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * .9,  //min val based on chosen axis
      d3.max(healthData, d => d[chosenXAxis]) * 1.1          //max val based on chosen axis
    ])
    .range([0, width]);

  return xLinearScale;                                       // return appropriate xLinear scale

}


// transitions from old axis to new axis and does so over 2 second
// function used for updating yAxis var upon click on axis label

function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}


// function used for drawing/updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(2000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}


// function used for updating text abbreviations group with a transition to
// new text
function renderText(circlesLabel, newXScale, chosenXAxis) {

  circlesLabel.transition()
    .duration(2000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesLabel;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label1;
  var label2;

  if (chosenXAxis === "obesity") {
    label1 = "Obesity:"
    label2 = "Age";
  }
  else {
    label1 = "Smoke:"
    label2 = "Age";
  }

  // Make tooltip show up
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${label2} ${d.age}<br>${label1} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })


    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}



// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(healthData, err) {
  if (err) throw err;

  // parse data - convert all numbers from strings to integer
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.healthcareHigh = +data.healthcareHigh;
    data.healthcareLow = +data.healthcareLow;
    data.obesity = +data.obesity;
    data.obesityHigh = +data.obesityHigh;
    data.obesityLow = +data.obesityLow;
    data.smokes = +data.smokes;
    data.smokesHigh= +data.smokesHigh;
    data.smokesLow = +data.smokesLow;
    data.abbr = data.abbr;
  });



//   Create the xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);



// Create y scale function
  var yLinearScale = d3.scaleLinear()
   .domain([d3.min(healthData, d => d.age) * .9,  //min val based on chosen axis
      d3.max(healthData, d => d.age) * 1.1          //max val based on chosen axis
    ])
    .range([height, 0]);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);



  // append x axis at bottom of graph
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);


  // append initial circles
  var circlesGroup = chartGroup.selectAll("shirley")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.age))
    .attr("r", 16)
    .attr("fill", "blue")
    .attr("opacity", ".5");



  var circlesLabel =  chartGroup.selectAll("shirley")
    .data(healthData)
    .enter()
    .append("text")
    .style("fill", "white")                          // fill the text with the colour black
    .attr("x", d => xLinearScale(d[chosenXAxis]))    // set x position of left side of text
    .attr("y", d => yLinearScale(d.age))             // set y position of bottom of text
    .attr("dy", ".35em")                             // set offset y position
    .attr("text-anchor", "middle")                   // set anchor y justification
    .text(d => (d.abbr));  



  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var obesityLable = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (20k - 38k)");


  var smokesLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (per Week)");


  // append y axis and labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Age ");


    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("(Range: 28 - 48 years)");

  // updateToolTip function for above
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  var circlesLabel = updateToolTip(chosenXAxis, circlesLabel);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {

// Redraw all of this stuff when a different value is selected

      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // // updates text with state abbreviation with new x values, with transition
        circlesLabel = renderText(circlesLabel, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "obesity") {
          obesityLable
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLable
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);git 
});
