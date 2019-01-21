/*
Set up the willpower bar to be equal to number of total notifications.
Set up two additional bars for tracking:
    1) persuasive notifications opened (distracting)
    2) persuasive notifications dismissed (saps willpower)
Every tick (notification action), identify the bar which is to be added to.
*/
function willPowerFunc(pOpened, pDismissed){
    var varWillPower = Math.floor(((gData.length - (pDismissed*3))/gData.length)*100)
    var barData = [
      { name: 'Willpower', num: varWillPower},
      { name: 'Dismissed', num: pDismissed  },
      { name: 'Opened', num: pOpened },
    ]
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = document.getElementById('willpower-chart').offsetWidth - margin.left - margin.right,
        height = document.getElementById('willpower-chart').offsetHeight - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
	.domain([0, 100])
	.range([0, width])

    const yScale = d3.scaleBand()
        .domain(barData.map(d => d.name))
        .range([0, height])	

    const svg = d3.select('#willpower-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0)
    
    const render = () => {

        const bars = d3.select('#willpower-chart')
        .selectAll('div')
        .data(barData, d => d.name)

        const newBars = bars
        .enter() // returns enter select for data that need DOM elements
        .append('div')
        .attr('class', 'bar')
        .style('width', 0)

        // combine the selections so you can act on them together
        newBars.merge(bars)
        .transition()
        .style('width', d => `${xScale(d['num'])}px`)
        .style('height', d => `${yScale.bandwidth() - 2}px`)
        
         
    }
    render()

      // append the rectangles for the bar chart
      /*svg.selectAll(".bar")
          .data(barData)
        .enter().append("rect")
          .attr("class", "bar")
          //.attr("x", function(d) { return x(d.num); })
          .attr("width", d => `${xScale(d['num'])}px` )
          .attr("y", function(d) { return yScale(d.name); })
          .attr("height", yScale.bandwidth());

      // add the x Axis
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale));

      // add the y Axis
      svg.append("g")
          .call(d3.axisLeft(yScale));*/
    		
}