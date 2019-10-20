/*
What expect to see:
- majority of notifications cached are those that had 'dismissed' as action
- some of notifications cached can be 'open'
- notice that 'cached' notifications, previously 'dismissed' are now opened.
- (Possibly change color of node to make this more noticable)
*/


if(screen.width >= 750){
    var empushyStartingEpoch = null;
    var empushyCurrentEpoch = null;
    var empushyNotificationSimulation = null;
    var empushyMargin = {left: 20, top: 20, right: 20, bottom: 20}
    
    // for top chart
    var empushyColorFeature = null;
    var empushyFeatures = ['appName', 'category', 'subject', 'opened', 'persuasiveness']
    var empushyFeatureselected;
    
    var empushyGData = null;
    var empushyTooltip = null;
    var empushyWastedMinutes = 0;
    
    // RL model for predicting actions
    var model = null
    
    var shownList = []
    var dismissedList = []
    var cachedList = []
    
    // Interval with which to check the cache e.g. every 5 mins
    var checkCacheInterval = 1
    
    /*
    *
    */
    function epochToDayTime(epoch){
        var date = new Date(0);
        date.setMilliseconds(epoch);
        datetext = date.toUTCString();
        time = datetext.split(' ')[4].substring(0,5);
        day = datetext.split(' ')[0];
        day = day.substring(0, day.length-1)
        return [day, time]
    }

    /*
    * Updates the current epoch.
    * Based on checkCacheInterval, also issues check-cache action.
    * Pops n from cachedList, 
    */
    var previousInterval = 0
    function updateEpoch(nodes){
        empushyCurrentEpoch = empushyCurrentEpoch + ((20000))
        dayTime = epochToDayTime(empushyCurrentEpoch)
        document.getElementById('empushy-time-tracker').innerHTML = dayTime[0] + ' ' + dayTime[1];
        // check divisible by the interval
        isInterval = (parseInt(dayTime[1].split(':')[1]) % checkCacheInterval == 0)
        diffFromPrevious = !(previousInterval == parseInt(dayTime[1].split(':')[1]))
        if(nodes !=null && isInterval && diffFromPrevious){
            previousInterval = parseInt(dayTime[1].split(':')[1])
            
            // get last notification posted - set as context
            last_n = getLastNotificationPosted(empushyCurrentEpoch, nodes)
            // for every node in the cached list, extract n_emb
            this_n = cachedList.shift();
            if(this_n != null && last_n!=null){
                this_n.c_embeddings = last_n.c_embeddings
                agentAct(this_n)
            }
            
            /*cachedList.forEach(function(n){
                n.c_embeddings = last_n.c_embeddings
            })
            for(i=0; i<cachedList.length; i++)
                agentAct(cachedList.shift())*/
            // concat with c_emb and list values.. predict action
            // update node location
            
            
        }
    }
    
    function getLastNotificationPosted(curEpoch, nodes){
        foundN = nodes[0]
        nodes.forEach(function(n){
                 if(n.posted < curEpoch && n.posted >= foundN.posted)
                        foundN = n
        })
        return foundN
    }

    function bubbleChart(nodeColors) {
      // Constants for sizing
      var width = document.getElementById('empushy-demo-container').offsetWidth;
      var height = document.getElementById('empushy-demo-container').offsetHeight;


      var empushyTooltip = floatingEmpushyTooltip('gates_empushyTooltip', 240);

      // Locations to move bubbles towards, depending
      // on which view mode is selected.
      var center = { x: width / 4, y: height / 2 };

      var yearCenters = {
        'Unsent': { x: width / 8, y: height / 2 },
        'EmPushy': {x: width / 2.5, y: height / 3.05},
        'Distracting': { x: width / 2.5, y: height - (height / 2) },
        'Dismissed': { x: width - (width/3), y: height - (height / 3) },
        'Opened': { x: width - (width/3), y: height/3 }
      };

      // X locations of the year titles.
      var yearsTitleX = {
        'Unsent': width/8,
        'EmPushy': width/2.42,
        'Dismissed': width - (width/3),
        'Opened': width - (width/3)
      };
      // Y locations of locations
      var yearsTitleY = {
        'Unsent': height - (height / 3.5),
        'EmPushy': height/4,
        'Dismissed': height - (height/6),
        'Opened': height/5
      };
        
        // X locations of the year titles.
      var imagesX = {
        'Smartphone': (width/2.55)-25,
          'Cloud': (width/2.55)-25,
      };
      // Y locations of locations
      var imagesY = {
        'Smartphone': height - (height / 1.85),
        'Cloud': height/3.9,
      };
        
      var imagesRef = {
          'Smartphone': './img/smartphone.png',
          'Cloud': './img/cloud.png',
      }
        
        

      // @v4 strength to apply to the position forces
      var forceStrength = 0.03;

      // These will be set in create_nodes and create_vis
      var svg = null;
      var bubbles = null;
      var nodes = [];

      // Charge function that is called for each node.
      // As part of the ManyBody force.
      // This is what creates the repulsion between nodes.
      //
      // Charge is proportional to the diameter of the
      // circle (which is stored in the radius attribute
      // of the circle's associated data.
      //
      // This is done to allow for accurate collision
      // detection with nodes of different sizes.
      //
      // Charge is negative because we want nodes to repel.
      // @v4 Before the charge was a stand-alone attribute
      //  of the force layout. Now we can use it as a separate force!
      function charge(d) {
        return -Math.pow(d.radius, 2.0) * forceStrength;
      }


      // Here we create a force layout and
      // @v4 We create a force simulation now and
      //  add forces to it.
      var simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', ticked);

      // @v4 Force starts up automatically,
      //  which we don't want as there aren't any nodes yet.
      simulation.stop();


      // Nice looking colors - no reason to buck the trend
      // @v4 scales now have a flattened naming scheme
      var fillColor = nodeColors;


      /*
       * This data manipulation function takes the raw data from
       * the CSV file and converts it into an array of node objects.
       * Each node will store data and visualization values to visualize
       * a bubble.
       *
       * rawData is expected to be an array of data objects, read in from
       * one of d3's loading functions like d3.csv.
       *
       * This function returns the new node array, with a node in that
       * array for each element in the rawData input.
       */
      function createNodes(rawData) {
        // Use the max total_amount in the data as the max in the scale's domain
        // note we have to ensure the total_amount is a number.
        var maxAmount = d3.max(100); // can calc this on the fly - see code.

        // Sizes bubbles based on area.
        // @v4: new flattened scale names.
        var radiusScale = d3.scalePow()
          .exponent(0.5)
          .range([2, 85])
          .domain([0, maxAmount]);

        // Use map() to convert raw data into node data.
        // Checkout http://learnjsdata.com/ for more on
        // working with data.
        var myNodes = rawData.map(function (d) {
          return {
            id: d.posted,
            radius: 5,
            value: 20,
            appName: d.appPackage,
            p1: d.p1,
            p2: d.p2,
            p3: d.p3,
            p4: d.p4,
            p5: d.p5,
            p6: d.p6,
            persuasiveness: d.persuasiveness,
            category: d.category,
            subject: d.subject,
            location: d.location,
            posted: d.posted,
            removed: d.removed,
            opened: (d.action=="True"),
            n_embeddings: d.n_embeddings,
            c_embeddings: d.c_embeddings,
            x: Math.random() * 900,
            y: Math.random() * 800
          };
        });

        // sort them to prevent occlusion of smaller nodes.
        //myNodes.sort(function (a, b) { return b.value - a.value; });
          
        return myNodes;
      }

      /*
       * Main entry point to the bubble chart. This function is returned
       * by the parent closure. It prepares the rawData for visualization
       * and adds an svg element to the provided selector and starts the
       * visualization creation process.
       *
       * selector is expected to be a DOM element or CSS selector that
       * points to the parent element of the bubble chart. Inside this
       * element, the code will add the SVG continer for the visualization.
       *
       * rawData is expected to be an array of data objects as provided by
       * a d3 loading function like d3.csv.
       */
      var chart = function chart(selector, rawData) {
        // convert raw data into nodes data
        nodes = createNodes(rawData);

        // Create a SVG element inside the provided selector
        // with desired size.
        svg = d3.select(selector)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%');

        // Bind nodes data to what will become DOM elements to represent them.
        bubbles = svg.selectAll('.bubble')
          .data(nodes, function (d) { return d.id; });

        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // @v4 Selections are immutable, so lets capture the
        //  enter selection to apply our transtition to below.
        var bubblesE = bubbles.enter().append('circle')
          .classed('bubble', true)
          .attr('id', function(d){ return "n_"+Math.floor(d.id).toString(); })
          .attr('r', 0)
          .attr('fill', function (d) { return fillColor(d[empushyColorFeature]); })
          //.attr('stroke', function (d) { return d3.rgb(fillColor(d[empushyColorFeature])).darker(); })
          .attr('stroke', "black")
          .attr('stroke-width', 1)
          .on('mouseover', showDetail)
          .on('mouseout', hideDetail)
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

        // @v4 Merge the original empty selection and the enter selection
        bubbles = bubbles.merge(bubblesE); 

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        bubbles.transition()
          .duration(2000)
          .attr('r', function (d) { return d.radius; });

        // Set the simulation's nodes to our newly created nodes array.
        // @v4 Once we set the nodes, the simulation will start running automatically!
        simulation.nodes(nodes);
        

        populateLegend();
        populateDropdown();

        function showDetail(d) {
        // change outline to indicate hover state.
            d3.select(this).attr('stroke', 'black');

            var content = '<span class="name">App: </span><span class="value">' +
                          d.appName +
                          '</span><br/>' +
                          '<span class="name">Subject: </span><span class="value">' +
                          d.subject +
                          '</span><br/>' +
                          '<span class="name">Category: </span><span class="value">' +
                          d.category +
                          '</span>';

            empushyTooltip.showempushyTooltip(content, d3.event);
        }

        /*
        * Hides empushyTooltip
        */
        function hideDetail(d) {
            // reset outline
            d3.select(this)
              .attr('stroke', d3.rgb(fillColor(d.group)).darker());

            empushyTooltip.hideempushyTooltip();
        }

          /*
         * Helper function to convert a number into a string
         * and add commas to it to improve presentation.
         */
        function addCommas(nStr) {
          nStr += '';
          var x = nStr.split('.');
          var x1 = x[0];
          var x2 = x.length > 1 ? '.' + x[1] : '';
          var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
          }

          return x1 + x2;
        }

        // Set initial layout to single group.
        groupBubbles();
      };

        function populateLegend(){

            var dropdown = document.getElementById('empushyDropdownLegend'); 
            for(var i = 0; i < nodeColors.domain().length; i++) {
                var thisLI = document.createElement('li');
                thisLI.appendChild(document.createTextNode(nodeColors.domain()[i]));
                thisLI.style.backgroundColor = fillColor(nodeColors.domain()[i]);
                thisLI.className += " list-group-item";
                dropdown.appendChild(thisLI); 
            } 
        }

        function populateDropdown(){

            var dropdown = document.getElementById('empushyChooseFeature'); 
            for(var i = 0; i < empushyFeatures.length; i++){
                var o = document.createElement('option');
                o.value = empushyFeatures[i]
                o.innerHTML = empushyFeatures[i] // <a>INNER_TEXT</a>
                dropdown.appendChild(o); // Append the link to the div
            }
            $('#empushyChooseFeature').val(empushyColorFeature);
            $('#empushyChooseFeature').on('change', function(e){
                empushyWastedMinutes = 0  
                pOpened = 0
                pDismissed = 0
                p1 = 0
                p2 = 0
                p3 = 0
                p4 = 0
                p5 = 0
                p6 = 0
                
                document.getElementById('empushyReplay').style.display = 'none'
                document.getElementById('empushyStart').style.display = 'block'
                document.getElementById('empushyStop').style.display = 'none'

                document.getElementById('empushy-man-up').style.display = 'none'
                document.getElementById('empushy-man-left').style.display = 'block'
                document.getElementById('empushy-man-down').style.display = 'none'
                
                clearInterval(empushyNotificationSimulation);
                empushyColorFeature = this.value;
                d3.select("#empushyVis").select("svg").remove();
                var elm = document.getElementById("empushyDropdownLegend")
                while (elm.hasChildNodes()) {
                  elm.removeChild(elm.lastChild);
                }
                elm = document.getElementById("empushyChooseFeature")
                while (elm.hasChildNodes()) {
                  elm.removeChild(elm.lastChild);
                }
                setUpChart(empushyGData)
            });
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

      /*
       * Callback function that is called after every tick of the
       * force simulation.
       * Here we do the acutal repositioning of the SVG circles
       * based on the current x and y values of their bound node data.
       * These x and y values are modified by the force simulation.
       */
      function ticked() {
        bubbles
          .attr('cx', function (d) { return d.x; })
          .attr('cy', function (d) { return d.y; });
        empushyWastedMinutes = 0;
        pDismissed = 0;
        pOpened = 0;
        p1 = 0;
        p2 = 0;
        p3 = 0;
        p4 = 0;
        p5 = 0;
        p6 = 0;

        nodes.forEach(function(n) {
                // Calc the persuasiveness
                var persuasiveness = n.p1+n.p2+n.p3+n.p4+n.p5+n.p6
                
                if(n.location == "Dismissed"){
                    empushyWastedMinutes+=1.3
                }
                
        });
        document.getElementById('empushyWastedMinutes').innerHTML = Math.round(empushyWastedMinutes)+' '        
      }

      /*
       * Provides a x value for each node to be used with the split by year
       * x force.
       */
      function nodeYearPos(d) {
        return yearCenters[d.location].x;
      }

      function nodeYearPosY(d){
          return yearCenters[d.location].y;
      }


      /*
       * Sets visualization in "single group mode".
       * The year labels are hidden and the force layout
       * tick function is set to move all nodes to the
       * center of the visualization.
       */
      function groupBubbles() {
        hideYearTitles();

        // @v4 Reset the 'x' force to draw the bubbles to the center.
        simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));

        simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));

        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
      }


      /*
       * Sets visualization in "split by year mode".
       * The year labels are shown and the force layout
       * tick function is set to move nodes to the
       * yearCenter of their data's year.
       */
      function splitBubbles() {
        showYearTitles();

        // @v4 Reset the 'x' force to draw the bubbles to their year centers
        simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));

        simulation.force('y', d3.forceY().strength(forceStrength).y(nodeYearPosY));


        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
      }



      /*
       * Hides Year title displays.
       */
      function hideYearTitles() {
        svg.selectAll('.year').remove();
        svg.selectAll('.smartphone').remove();
      }  

      /*
       * Shows Year title displays.
       */
      function showYearTitles() {
        // Another way to do this would be to create
        // the year texts once and then just hide them.
        var yearsData = d3.keys(yearsTitleX);
        var years = svg.selectAll('.year')
          .data(yearsData);

        years.enter().append('text')
          .attr('class', 'year')
          .attr('style', 'font-family: hoffman;font-weight: bold; font-size: xx-large; background: white;')
          .attr('x', function (d) { return yearsTitleX[d]; })
          .attr('y', function(d) {return yearsTitleY[d];})
          .attr('text-anchor', 'middle')
          .text(function (d) { return d; });
          
        // add image
        /*var yearsData = d3.keys(imagesX);
        var images = svg.selectAll('.smartphone').data(yearsData)
          
        images.enter().append('svg')
            .attr('width', '100px')
            .attr('height', '100px')   
            .attr("x", function(d) {return imagesX[d];})
            .attr("y", function(d) {return imagesY[d];})         
            .append("svg:image")
              .attr('class', 'smartphone')
                .attr('width', '100%')
                .attr('height', '100%')
              .attr("xlink:href", function(d) {return imagesRef[d];})*/
      }

        function startEmpushyNotificationSimulation() {


            // update the labels
            splitBubbles();
            empushyNotificationSimulation = setInterval(function(){
                updateEpoch(nodes);
                var removed = 0;
                // check if node is relevant to epoch, update position if necessary
                for(node of nodes){
                    if(empushyCurrentEpoch >= node.posted && empushyCurrentEpoch < node.removed && node.location == 'Unsent'){
                        // Here send to agent to predict action of show, dismiss or cache
                        agentAct(node)
                    }
                    else if(empushyCurrentEpoch > node.removed && node.location == "Distracting"){
                        // && if empushyCurrentEpoch location is distracting!
                        if(node.opened == true)
                            node.location = "Opened"
                        else{
                            node.location = "Dismissed"
                        }
                        removed++;
                    }
                }
                if(empushyColorFeature=='persuasiveness'){
                    willPowerFunc(pOpened, pDismissed)
                    principlesFunc(p1,p2,p3,p4,p5,p6, (pOpened+pDismissed))
                }
                if(removed == nodes.length){
                    document.getElementById('empushyReplay').style.display = 'block'
                    document.getElementById('empushyStart').style.display = 'none'
                    document.getElementById('empushyStop').style.display = 'none'
                    document.getElementById('empushy-man-up').style.display = 'none'
                    document.getElementById('empushy-man-left').style.display = 'none'
                    document.getElementById('empushy-man-down').style.display = 'block'
                    clearInterval(empushyNotificationSimulation);
                }
                splitBubbles();
                
            }, 1)
        }

      /*
       * Externally accessible function (this is attached to the
       * returned chart function). Allows the visualization to toggle
       * between "single group" and "split by year" modes.
       *
       * displayName is expected to be a string and either 'year' or 'all'.
       */
      chart.toggleDisplay = function (displayName) {
        if (displayName === 'empushyStart') {
            document.getElementById('empushyReplay').style.display = 'none'
            document.getElementById('empushyStart').style.display = 'none'
            document.getElementById('empushyStop').style.display = 'block'
            document.getElementById('empushy-man-up').style.display = 'block'
            document.getElementById('empushy-man-left').style.display = 'none'
            document.getElementById('empushy-man-down').style.display = 'none'
            //splitBubbles();
            startEmpushyNotificationSimulation();
        } else if(displayName == 'empushyStop') {
          document.getElementById('empushyStop').style.display = 'none'
          document.getElementById('empushyStart').style.display = 'block'
            document.getElementById('empushy-man-up').style.display = 'none'
            document.getElementById('empushy-man-left').style.display = 'block'
            document.getElementById('empushy-man-down').style.display = 'none'
          clearInterval(empushyNotificationSimulation)
          groupBubbles();
        }
        else if(displayName == 'replay'){
            // reset node positions
            nodes.forEach(function(n) { 
                n.location = 'Unsent';
            });
            // reset starting epoch
            empushyCurrentEpoch = empushyStartingEpoch
            // hide replay button
            document.getElementById('empushyReplay').style.display = 'none'
            document.getElementById('empushyStop').style.display = 'block'
            document.getElementById('empushy-man-up').style.display = 'block'
            document.getElementById('empushy-man-left').style.display = 'none'
            document.getElementById('empushy-man-down').style.display = 'none'
            // reset wasted minutes
            empushyWastedMinutes = 0   
            // reset willpower
            pOpened = 0
            pDismissed = 0
            p1=0
            p2=0
            p3=0
            p4=0
            p5=0
            p6=0
            willPowerFunc = willPowerChart(empushyGData)
            principlesFunc = principlesChart()
            
            // start
            startEmpushyNotificationSimulation();
        }
      };




      // return the chart function from closure.
      return chart;
    }

    d3.csv('./synthetic_for_web_empushy.csv')
        .then(function(data) {
        data.sort(function(a, b) { 
            return a.time - b.time;
        })    
        
        loadEmPushyModel()

        // data = data.filter(d => d.System != "");
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
        // Begin by adding each notification to the unsent location
        data.forEach(function(n) { 
            var dayTime = epochToDayTime(n.posted)
            n.location = 'Unsent';
            n.day = dayTime[0];
            n.timeOfDay = dayTime[1];
            n.persuasiveness = calcPersuasiveness(n);
        });

        empushyGData = data
        empushyColorFeature = 'appName'    
        
        setUpChart(empushyGData)
    });
        
    function calcPersuasiveness(n){
        var persuasiveness = n.p1 + n.p2 + n.p3 + n.p4 + n.p5 + n.p6
        if(persuasiveness > 2)
            return 'High'
        else if(persuasiveness > 1)
            return 'Medium'
        else
            return 'Low'
    }

    function setUpChart(data){
        empushyStartingEpoch = data[0].posted - (1000*60*60) // start hour early!
        empushyCurrentEpoch = empushyStartingEpoch
        updateEpoch();
        /*
         * Below is the initialization code as well as some helper functions
         * to create a new bubble chart instance, load the data, and display it.
         */
        nodeColors = d3.scaleOrdinal()
                .domain([...new Set(data.map(d => d[empushyColorFeature]))]).range(d3.schemeSet3);

        var empushyBubbleChart = bubbleChart(nodeColors);
        empushyBubbleChart('#empushyVis', data)

        /*
         * Sets up the layout buttons to allow for toggling between view modes.
         */
        function setupButtons() {
          d3.select('#empushyToolbar')
            .selectAll('.btn')
            .on('click', function () {
              // Remove active class from all buttons
              d3.selectAll('.btn').classed('active', false);
              // Find the button just clicked
              var button = d3.select(this);

              // Set it as the active button
              button.classed('active', true);

              // Get the id of the button
              var buttonId = button.attr('id');

              // Toggle the bubble chart based on
              // the currently clicked button.
              empushyBubbleChart.toggleDisplay(buttonId);
            });
        }
        // setup the buttons.
        setupButtons();
    }
    
    async function loadEmPushyModel(){
        model = await tf.loadModel('./js/dqn_js/model.json');
    }
    
    /* Takes combination of the notification embedding and 
       context embedding and list status as input and 
       returns the index of the action 
       Required: 
       - Maintaining of lists e.g. cachedList, shownList, dismissedList
       - Splitting notification into 'notification' and 'context' 
       - Converting to embeddings
       - Combining both embeddings with list status       
    */
    function predictAction(n_embedding){
        const shape = [1, n_embedding.length]
        const as_tensor = tf.tensor(n_embedding, shape)
        const result = model.predict(as_tensor).dataSync();
        return result.indexOf(Math.max(...result));
    }
    
    function createObservation(node){
        var combEmb = JSON.parse(node.n_embeddings).concat(JSON.parse(node.c_embeddings))
        combEmb = combEmb.concat(dismissedList.length)
        combEmb = combEmb.concat(shownList.length)
        combEmb = combEmb.concat(cachedList.length)
        return combEmb
    }
    
    function agentAct(node){
        // if 0 - 'distracting', if 1 - 'dismissed', if 2 - 'empushy',
        var agent_action = 4
        var actionCount = 0
        while(agent_action == 4 && actionCount < 5){
            agent_action = predictAction(createObservation(node))
            actionCount++
        }            

        if(agent_action == 0){
            node.location = "Distracting"
            shownList.push(node)
        }
        else if(agent_action == 1){
            node.location = "Dismissed"
            dismissedList.push(node)
        }
        else if(agent_action == 2){
            node.location = "EmPushy"
            cachedList.push(node)
            d3.select("#n_"+Math.floor(node.id).toString())
                .style('stroke-width', 3);
        }
        else{
            node.location = "Distracting"
            shownList.push(node)
        }
    }
    
    /*
     * Creates empushyTooltip with provided id that
     * floats on top of visualization.
     * Most styling is expected to come from CSS
     * so check out bubble_chart.css for more details.
     */
    function floatingEmpushyTooltip(empushyTooltipId, width) {
      // Local variable to hold empushyTooltip div for
      // manipulation in other functions.
      var tt = d3.select('body')
        .append('div')
        .attr('class', 'bubbleTooltip')
        .attr('id', empushyTooltipId)
        .style('pointer-events', 'none');

      // Set a width if it is provided.
      if (width) {
        tt.style('width', width);
      }

      // Initially it is hidden.
      hideempushyTooltip();

      /*
       * Display empushyTooltip with provided content.
       *
       * content is expected to be HTML string.
       *
       * event is d3.event for positioning.
       */
      function showempushyTooltip(content, event) {
        tt.style('opacity', 1.0)
          .html(content);

        updatePosition(event);
      }

      /*
       * Hide the empushyTooltip div.
       */
      function hideempushyTooltip() {
        tt.style('opacity', 0.0);
      }

      /*
       * Figure out where to place the empushyTooltip
       * based on d3 mouse event.
       */
      function updatePosition(event) {
        var xOffset = 20;
        var yOffset = 10;

        var ttw = tt.style('width');
        var tth = tt.style('height');

        var wscrY = window.scrollY;
        var wscrX = window.scrollX;

        var curX = (document.all) ? event.clientX + wscrX : event.pageX;
        var curY = (document.all) ? event.clientY + wscrY : event.pageY;
        var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > window.innerWidth) ?
                     curX - ttw - xOffset * 2 : curX + xOffset;

        if (ttleft < wscrX + xOffset) {
          ttleft = wscrX + xOffset;
        }

        var tttop = ((curY - wscrY + yOffset * 2 + tth) > window.innerHeight) ?
                    curY - tth - yOffset * 2 : curY + yOffset;

        if (tttop < wscrY + yOffset) {
          tttop = curY + yOffset;
        }

        tt
          .style('top', tttop + 'px')
          .style('left', ttleft + 'px');
      }

      return {
        showempushyTooltip: showempushyTooltip,
        hideempushyTooltip: hideempushyTooltip,
        updatePosition: updatePosition
      };
    }
}
