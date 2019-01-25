/*
Set up the willpower bar to be equal to number of total notifications.
Set up two additional bars for tracking:
    1) persuasive notifications opened (distracting)
    2) persuasive notifications dismissed (saps willpower)
Every tick (notification action), identify the bar which is to be added to.
*/
function principlesChart(){
    d3.select("#principles-chart").select('svg').select("*").remove();
    var barData = [
      { name: 'p1', num: 50},
      { name: 'p2', num: 50},
      { name: 'p3', num: 50},
      { name: 'p4', num: 50},
      { name: 'p5', num: 50},
      { name: 'p6', num: 50},
    ]
    // set the dimensions and margins of the graph
    const margin =  { top: 0, right: 0, bottom: 0, left: 20}
        width = (document.getElementById('principles-chart').offsetWidth) - margin.left - margin.right,
        height = (document.getElementById('principles-chart').offsetHeight) - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
	.domain([0, 100])
	.range([0, width])

    const yScale = d3.scaleBand()
        .domain(barData.map(d => d.name))
        .range([0, height])	

    const svg = d3.select('#principles-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0)
    
    const axisContainer = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)


    axisContainer.append('g')
      .call(d3.axisLeft(yScale)) // we don't have to move this at all now 
    
    const render = (p1,p2,p3,p4,p5,p6,numNotifications) => {
        if(numNotifications>0){
            var barData = [
              { name: 'p1', num: Math.floor((p1/numNotifications)*100)},
              { name: 'p2', num: Math.floor((p2/numNotifications)*100)},
              { name: 'p3', num: Math.floor((p3/numNotifications)*100)},
              { name: 'p4', num: Math.floor((p4/numNotifications)*100)},
              { name: 'p5', num: Math.floor((p5/numNotifications)*100)},
              { name: 'p6', num: Math.floor((p6/numNotifications)*100)},
            ]
        }
        const bars = d3.select('#principles-chart')
        .selectAll('div')
        .data(barData, d => d.name)
        
        try{

            const newBars = bars
            .enter() // returns enter select for data that need DOM elements
            .append('div')
            .attr('class', 'bar')
            .style('width', 0)
            .style('margin-left', '20px')

            // combine the selections so you can act on them together
            newBars.merge(bars)
            .transition()
            .style('width', d => `${xScale(d['num'])}px`)
            .style('height', d => `${yScale.bandwidth() - 2}px`)
        
        } catch(e){}
    }
    return render    		
}