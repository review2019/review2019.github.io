

$(document).ready(function() {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var cards = [];
    var currentCardIndex = -1;
    var compareChart = null
    
    var totalSwiped = []
    var swipedWindow = []
    
    var previousTData = []
    var currentTData = []
    
    var animating = false;
    var cardsCounter = 0;
    var numOfCards = 6;
    var decisionVal = 80;
    var pullDeltaX = 0;
    var deg = 0;
    var $card, $cardReject, $cardLike;

  function pullChange() {
    animating = true;
    deg = pullDeltaX / 10;
    $card.css("transform", "translateX("+ pullDeltaX +"px) rotate("+ deg +"deg)");

    var opacity = pullDeltaX / 100;
    var rejectOpacity = (opacity >= 0) ? 0 : Math.abs(opacity);
    var likeOpacity = (opacity <= 0) ? 0 : opacity;
    $cardReject.css("opacity", rejectOpacity);
    $cardLike.css("opacity", likeOpacity);
  };

  function release() {

    if (pullDeltaX >= decisionVal) {
      $card.addClass("to-right");
        
      /* Card swiped right */
        cardSwiped('right')
        
    } else if (pullDeltaX <= -decisionVal) {
      $card.addClass("to-left");
        
      /* Card swiped left */
        cardSwiped('left')
        
    }

    if (Math.abs(pullDeltaX) >= decisionVal) {
      $card.addClass("inactive");

      setTimeout(function() {
        $card.addClass("below").removeClass("inactive to-left to-right");
        cardsCounter++;
        if (cardsCounter === numOfCards) {
          cardsCounter = 0;
          $(".demo__card").removeClass("below");
        }
      }, 300);
    }

    if (Math.abs(pullDeltaX) < decisionVal) {
      $card.addClass("reset");
    }

    setTimeout(function() {
      $card.attr("style", "").removeClass("reset")
        .find(".demo__card__choice").attr("style", "");

      pullDeltaX = 0;
      animating = false;
    }, 300);
  };

  $(document).on("mousedown touchstart", ".demo__card:not(.inactive)", function(e) {
    if (animating) return;

    $card = $(this);
    $cardReject = $(".demo__card__choice.m--reject", $card);
    $cardLike = $(".demo__card__choice.m--like", $card);
    var startX =  e.pageX || e.originalEvent.touches[0].pageX;

    $(document).on("mousemove touchmove", function(e) {
      var x = e.pageX || e.originalEvent.touches[0].pageX;
      pullDeltaX = (x - startX);
      if (!pullDeltaX) return;
      pullChange();
    });

    $(document).on("mouseup touchend", function() {
      $(document).off("mousemove touchmove mouseup touchend");
      if (!pullDeltaX) return; // prevents from rapid click events
      release();
    });
  });
    
    $.getJSON( "./card_json.json", function( data ) {
        cards = data.slice(0);
        var trendingTemplate = [
            '<div class="demo__card">',
                '<div class="demo__card__top">',
                  '<div class="demo__card__img"></div>',
                  /*'<p class="demo__card__name"><%= appPackage %></p>',*/
                '</div>',
                '<div class="demo__card__btm">',
                  '<p class="demo__card__we">',
                      'You received a message from <strong><%= appPackage %></strong> during <strong><%= dayOfWeek %> <%= timeOfDay %></strong>.',
                      '<br>',
                      '<br>',
                        'Notification Information:',
                        '<br>',
                      'Category: <strong><%= category %></strong>',
                        '<br>',
                      'Topic: <strong><%= subject %></strong>',
                        '<br>',
                        'Priority level: <strong><%= priority %></strong>',
                        '<br>',
                      ' Visibility Level <strong><%= visibility %></strong>;',
                        '<br>',
                        'Updated: <strong><%= numberUpdates %></strong> number of time(s);',
                      '<br>',
                      '<br>',
                        'Device Context when notification received:',
                        '<br>',
                        'Noise level: <strong><%= averageNoisePosted %></strong>',                        '<br>',
                        'Battery level: <strong><%= batteryLevelPosted %></strong>',                        
                        '<br>',
                        'Plugged in and charging: <strong><%= chargingPosted %></strong>',                        
                        '<br>',
                        'Ringer mode: <strong><%= ringerMode %></strong>',                        
                        '<br>',
                        'Music playing: <strong><%= musicActive %></strong>',                        
                        '<br>',
                        'Headphones plugged in: <strong><%= headphonesIn %></strong>',                        
                        '<br>',
                        'Screen visible: <strong><%= proximity %></strong> ',                        
                        '<br>',
                        'Activity level: <strong><%= activityContextPosted %></strong>.',
                      '<br>',
                      '<br>',
                        'Your Context when notification received:',
                      '<br>',
                        'Place type: <strong><%= place %></strong>.',
                  '</p>',
                '</div>',
                '<div class="demo__card__choice m--reject"></div>',
                '<div class="demo__card__choice m--like"></div>',
                '<div class="demo__card__drag"></div>',
              '</div>',
        ].join("\n");
        
        var items = [];
        var cardContainer = jQuery('.demo__card-cont')
        var compileTemplate = _.template(trendingTemplate);
            
        $.each(data.reverse(), function(i, n){
            cardContainer.append(compileTemplate({ 
                                                'place': n.placeCategoryPosted.split(' ')[Math.floor(Math.random()*n.placeCategoryPosted.split(' ').length)].replace('TYPE_', ''),
                                                'proximity': (n.proximityPosted=='med'||n.proximityPosted=='near')?'no':'yes',
                                                'priority': n.priority,
                                                'numberUpdates': n.numberUpdates=='none'?'no':n.numberUpdates,
                                                'visibility': n.visibility,
                                                'averageNoisePosted': n.averageNoisePosted,
                                                'batteryLevelPosted': n.batteryLevelPosted,
                                                'chargingPosted': n.chargingPosted==true?'yes':'no',
                                                'ringerMode': n.ringerModePosted,
                                                'musicActive': n.musicActive==true?'yes':'no',
                                                'headphonesIn': n.headphonesIn==true?'yes':'no',
                                                'activityContextPosted': n.activityContextPosted,
                                                'appPackage': n.appPackage,
                                                'timeOfDay': n.timeOfDay,
                                                'dayOfWeek': daysOfWeek[n.dayOfWeek],
                                                'subject': n.subject,
                                                'category': n.category}));
        });
    });
    
    function sendNotifications(isFirst) {
        console.log('Sending notifications..')
        // var demoUrl = "https://thawing-mesa-63775.herokuapp.com/swipe";
        // var demoUrl = "http://localhost:5000/swipe";
        var demoUrl = "http://52.236.157.22/swipe";
        
        var formData = JSON.stringify({
            "is_first": isFirst,
            "notifications": swipedWindow
        })
        console.log('stringified data.')
        $.ajax ({
            url: demoUrl,
            type: "POST",
            data: formData,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            success: function(data) {
                console.log(data)
                previousTData = currentTData.slice(0);
                currentTData = data
                //setUpChart2('ul');
                setUpChart2('ur');
            }
        });

    }

    /* Card swiped - update counter, send notification @ epoch */
    function cardSwiped(direction){
        currentCardIndex++
        
        updateCounterView()
        
        var currentCard = cards[currentCardIndex]
        if(direction=='right'){
            currentCard.action = true
        }
        else{
            currentCard.action = false
        }
        swipedWindow.push(currentCard)
        totalSwiped.push(currentCard)
        
        /* Send to api, api converts to embedding, on return create bubble */
        /* Update graphs using window data set */
        
        if(currentCardIndex%2==0 && currentCardIndex>0){
            sendNotifications(false)
            swipedWindow = []
        }
    }
    
    function updateCounterView(){
        $("#counter").text((currentCardIndex+1))
    }
    
    function setUpChart(position){
        // Array of labels with app name
        // Array of two objects - open, dismiss
        // each object has label.. data related to app names
        var feature = 'category'
        var allApps = []
        openValues = []
        dismissValues = []
        
        $.each((position=='ul'?previousTData:currentTData), function(i, n){
            allApps.push(n[feature])
        });
        var appLabels = new Set(allApps)
        appLabels = Array.from(appLabels)
        
        $.each(appLabels, function(i, l){
            total = (position=='ul'?previousTData:currentTData).filter(n => n[feature]==l).length
            accepted = (position=='ul'?previousTData:currentTData).filter(n => n.action==true && n[feature]==l).length
            openValues.push(Math.round((accepted/total)*100))
            dismissed = (position=='ul'?previousTData:currentTData).filter(n => n.action==false && n[feature]==l).length
            dismissValues.push(Math.round((dismissed/total)*100))
        });
        
        var openDataset = {
          label: "Opened",
          backgroundColor: "green",
          borderColor: "black",
          borderWidth: 1,
          data: openValues
        }
        var dismissDataset = {
          label: "Dismissed",
          backgroundColor: "red",
          borderColor: "black",
          borderWidth: 1,
          data: dismissValues
        }
        
        var ctx = document.getElementById(position=='ul'?'ulChart':'urChart');
        var barChartData = {
          labels: appLabels,
          datasets: [
            openDataset,
            dismissDataset
          ]
        };

        var chartOptions = {
          responsive: true,
          legend: {
            position: "top"
          },
          title: {
            display: true,
            text: currentCardIndex>=10?(position=='ul'?('Result of swipe '+(currentCardIndex-19)+' to '+(currentCardIndex-9)):('Result of swipe '+(currentCardIndex-9)+' to '+(currentCardIndex+1))):(position=='ul'?'No results yet':'Generic default data')
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }],
            xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45
                }
            }]
          }
        }
        var myChart = new Chart(ctx, {
        type: "bar",
        data: barChartData,
        options: chartOptions
        });
    }
    
    function setUpChart2(position){
        if(compareChart!=null)
            compareChart.destroy();
        // Array of labels with app name
        // Array of two objects - open, dismiss
        // each object has label.. data related to app names
        var feature = 'category'
        var allApps = []
        openValuesPrev = []
        dismissValuesPrev = []
        openValuesCurr = []
        dismissValuesCurr = []
        
        $.each(previousTData, function(i, n){
            allApps.push(n[feature])
        });
        $.each(currentTData, function(i, n){
            allApps.push(n[feature])
        });
        var appLabels = new Set(allApps)
        appLabels = Array.from(appLabels)
        
        $.each(appLabels, function(i, l){
            total = (previousTData).filter(n => n[feature]==l).length
            accepted = (previousTData).filter(n => n.action==true && n[feature]==l).length
            openValuesPrev.push(Math.round((accepted/total)*100))
            
            total = (currentTData).filter(n => n[feature]==l).length
            accepted = (currentTData).filter(n => n.action==true && n[feature]==l).length
            openValuesCurr.push(Math.round((accepted/total)*100))
        });
        
        var prevDataset = {
          label: "Previous",
          backgroundColor: "#7197cf",
          borderColor: "black",
          borderWidth: 1,
          data: openValuesPrev
        }
        var currDataset = {
          label: "Current",
          backgroundColor: "#59358c",
          borderColor: "black",
          borderWidth: 1,
          data: openValuesCurr
        }
        
        var ctx = document.getElementById(position=='ul'?'ulChart':'urChart');
        var barChartData = {
          labels: appLabels,
          datasets: [
            prevDataset,
            currDataset
          ]
        };

        var chartOptions = {
          responsive: true,
          legend: {
            position: "top"
          },
          title: {
            display: true,
            text: 'Effect of Swipes on Training Dataset'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }],
            xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45
                }
            }]
          }
        }
        compareChart = new Chart(ctx, {
        type: "bar",
        data: barChartData,
        options: chartOptions
        });
    }
    
    //setUpChart('ul');
    setUpChart2('ur');
    sendNotifications(true);
    
    
});


