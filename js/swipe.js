const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

$(document).ready(function() {
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
    } else if (pullDeltaX <= -decisionVal) {
      $card.addClass("to-left");
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
                      'The category of the notification was <strong><%= category %></strong>, the content topic was <strong><%= subject %></strong>, the notification priority level was <strong><%= priority %></strong>, its visibility level was <strong><%= visibility %></strong> and it alerted you <strong><%= numberUpdates %></strong> time(s).',
                      '<br>',
                      '<br>',
                        'At the time you received it there were <strong><%= averageNoisePosted %></strong> noise levels, the phone\'s battery level was <strong><%= batteryLevelPosted %></strong>, the phone <strong><%= chargingPosted %></strong> plugged in and charging, the ringer mode was set to <strong><%= ringerMode %></strong>, music <strong><%= musicActive %></strong> playing on the phone, you <strong><%= headphonesIn %></strong> have headphones in, the phone screen <strong><%= proximity %></strong> visible and your activity level was <strong><%= activityContextPosted %></strong>.',
                      '<br>',
                      '<br>',
                        'The place you were in when receiving the notification was linked with <strong><%= place %></strong>.',
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

        $.each(data, function(i, n){
            cardContainer.append(compileTemplate({ 
                                                'place': n.placeCategoryPosted.split(' ')[Math.floor(Math.random()*n.placeCategoryPosted.split(' ').length)].replace('TYPE_', ''),
                                                'proximity': (n.proximityPosted=='med'||n.proximityPosted=='near')?'wasn\'t':'may have been',
                                                'priority': n.priority,
                                                'numberUpdates': n.numberUpdates=='none'?'one':n.numberUpdates,
                                                'visibility': n.visibility,
                                                'averageNoisePosted': n.averageNoisePosted,
                                                'batteryLevelPosted': n.batteryLevelPosted,
                                                'chargingPosted': n.chargingPosted==true?'was':'wasn\'t',
                                                'ringerMode': n.ringerModePosted,
                                                'musicActive': n.musicActive==true?'was':'wasn\'t',
                                                'headphonesIn': n.headphonesIn==true?'did':'didn\'t',
                                                'activityContextPosted': n.activityContextPosted,
                                                'appPackage': n.appPackage,
                                                'timeOfDay': n.timeOfDay,
                                                'dayOfWeek': daysOfWeek[n.dayOfWeek],
                                                'subject': n.subject,
                                                'category': n.category}));
        });
    });

});

function sendNotifications() {
    console.log('Sending notifications..')
    var demoUrl = "http://localhost:5000/swipe";

    var formData = JSON.stringify({
        "is_first": "False",
        "notifications":
        [
            {"activityContextPosted":"still","activityContextRemoved":"still","appPackage":"com.google.android.gm","averageNoisePosted":"low","averageNoiseRemoved":"low","batteryLevelPosted":"low","batteryLevelRemoved":"low","category":"email","chargingPosted":true,"chargingRemoved":true,"contactSignificantContext":"false","contactSignificantOverall":"false","decisionTime":"immediate","headphonesInPosted":false,"headphonesInRemoved":false,"id":1521757243460.0,"lightIntensityPosted":"low","lightIntensityRemoved":"low","musicActivePosted":false,"musicActiveRemoved":false,"notificationRemoved":1521758453780.0,"numberUpdates":"none","ongoing":false,"placeCategoryPosted":"TYPE_BAR TYPE_AQUARIUM TYPE_ACCOUNTING TYPE_OTHER TYPE_ACCOUNTING TYPE_AMUSEMENT_PARK TYPE_AMUSEMENT_PARK TYPE_AQUARIUM","placeCategoryRemoved":"TYPE_BAR TYPE_AQUARIUM TYPE_ACCOUNTING TYPE_OTHER TYPE_ACCOUNTING TYPE_AMUSEMENT_PARK TYPE_AMUSEMENT_PARK TYPE_AQUARIUM","priority":"default","proximityPosted":"med","proximityRemoved":"med","responseTime":"within half hour","ringerModePosted":"vibrate","ringerModeRemoved":"vibrate","seenTime":"within half hour","significant":false,"subject":"unknown","userId":"8a3818ec00d6177ab0f8dfa41729c6d0b3f633267d2e1651d332419219fd1c41","visibility":"private","action":true,"postTime":"2018-03-22 22:20:43.460","removalTime":"2018-03-22 22:40:53.780","timeAppLastUsed":"over a week ago","timeOfDay":"night","dayOfWeek":3, "action":"False"},
            {"activityContextPosted":"unknown","appPackage":"com.google.android.gm","averageNoisePosted":"low","batteryLevelPosted":"high","category":"email","chargingPosted":false,"contactSignificantContext":"false","contactSignificantOverall":"false","headphonesInPosted":false,"lightIntensityPosted":"low","musicActivePosted":false,"numberUpdates":"none","placeCategoryPosted":"TYPE_ACCOUNTING TYPE_OTHER TYPE_AIRPORT TYPE_ACCOUNTING","priority":"default","proximityPosted":"med","ringerModePosted":"vibrate","subject":"education","visibility":"private","timeAppLastUsed":"within 24 hours","timeOfDay":"early-morning","dayOfWeek":1, "action":"True"}
	   ]
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
        }
    });

}

  sendNotifications();