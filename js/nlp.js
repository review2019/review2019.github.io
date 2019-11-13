
var composeTemplate = '<div class="toast" style="margin-right: 5px; text-align:left; color: black;background-color: floralwhite;"'+
                                'role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false">'+
                              '<div class="toast-header" style="background-color: palegoldenrod;">'+
                                '<span style="margin-right:5px">&#128276;</span>'+
                                '<strong class="mr-auto">EmPushy - {{:category}}</strong>'+
                                '<small>11 mins ago</small>'+
                                '<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">'+
                                  '<span aria-hidden="true">&times;</span>'+
                                '</button>'+
                              '</div>'+
                              '<div class="toast-body" style="">'+
                                '{{:text}}'+
                              '</div>'+
                            '</div>'
var webPushTemplate = '<div class="toast" style="margin-right: 5px; text-align:left; color: black;background-color: floralwhite;"'+
                        'role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false">'+
                      '<div class="toast-header" style="background-color: palegoldenrod;">'+
                        '<span style="margin-right:5px">&#128276;</span>'+
                        '<strong class="mr-auto">EmPushy</strong>'+
                        '<small>11 mins ago</small>'+
                        '<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">'+
                          '<span aria-hidden="true">&times;</span>'+
                        '</button>'+
                      '</div>'+
                      '<div class="toast-body" style="">'+
                        '{{:text}}'+'<br>Find out more: <a href="{{:url}}" target="_blank" style="color:cadetblue">{{:url}}<a/>'+
                      '</div>'+
                    '</div>'

$.templates("composeTemplate", composeTemplate);  
$.templates("webPushTemplate", webPushTemplate);

function toggleProgress(){
    $('#progressBarCompose').css('visibility', 'visible')
    $('#composeButton').attr("disabled", true);
    $("#progressBarCompose.progress-bar-fill").css({"width":"100%","transition":"60s"});
}

function compose(){

    toggleProgress()
    var demoUrl = "https://empushy.azurewebsites.net/v1/nlp/web/compose";


    var selectedCB = $('#selectCB').children("option:selected").val();
    var selectedTopic = $('#selectTopic').children("option:selected").val();
    var selectedEmojis = $('#selectEmoji').children("option:selected").val();

    var prompt = ''
    var emojiKey = false
    if(selectedCB=='clickbaiting')
        prompt = '[CB_'+selectedTopic+'] '
    else
        prompt = '[NCB_'+selectedTopic+'] '

    if(selectedEmojis=='keyword emojis')
        emojiKey = true



    var formData = JSON.stringify({
        "text": prompt,
        "emoji": emojiKey?'key':'sen'             
    })

    $.ajax ({
        url: demoUrl,
        type: "POST",
        data: formData,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        success: function(data) {
            try{
                var prediction = data['compositions']  
                notifications = []
                for(val of prediction){
                    var body = val.text+' '
                    if(!emojiKey)
                        body = body + val.emojis[0]
                    else{
                        for(pair of val.emojis){
                            rand1 = (Math.floor(Math.random() * 2) + 1 )-1
                            body = body.replace(pair.keyword, pair.keyword+' '+pair.emojis.split(' ')[rand1])
                        }
                    }
                    body = body.replace('[CB', '').replace('[NCB', '').replace('[MEH]', '').replace('[', '').replace(']','')
                    notifications.push({text: body, category: selectedTopic})
                }
                var html = $.templates.composeTemplate(notifications);
                $("#generatedNotifications").append(html)
                $('.toast').toast('show')

                $(".progress-bar-fill").css({"width":"0%","transition":"none"});
                $('#progressBarCompose').css('visibility', 'invisible')
                $('#composeButton').attr("disabled", false);
            }
            catch(err){}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
            $(".progress-bar-fill").css({"width":"0%","transition":"none"});
            $('#progressBarCompose').css('visibility', 'invisible')
            $('#composeButton').attr("disabled", false);
            alert('Error generating notifications, try again.')
        }

    });
}

function toggleProgressWebPush(){
    $('#progressBarWebPush').css('visibility', 'visible')
    $('#webPushButton').attr("disabled", true);
    $("#progressBarWebPush.progress-bar-fill").css({"width":"100%","transition":"20s"});
}

function webPush(){
    $("#generatedNotificationsWebPush").empty();
    toggleProgressWebPush()
    var webPushDemoURL = "https://empushy.azurewebsites.net/v1/nlp/web/webpush";


    var url = $('#webPushUrl').val();
    var selectedEmojisWebPush = $('#selectEmoji2').children("option:selected").val();

    var emojiKeyWebPush = false

    if(selectedEmojisWebPush=='keyword emojis')
        emojiKeyWebPush = true



    var formData = JSON.stringify({
        "url": url,
        "emoji": emojiKeyWebPush?'key':'sen'             
    })

    $.ajax ({
        url: webPushDemoURL,
        type: "POST",
        data: formData,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        success: function(data) {
            try{
                var prediction = data['results']  
                console.log(prediction)
                var notifications = []
                for(val of prediction){
                    var body = val.summary
                    body = body.substring(0, 120)
                    body = body+'... '
                    if(!emojiKeyWebPush)
                        body = body + val.emojis[0]
                    else{
                        for(pair of val.emojis){
                            rand1 = (Math.floor(Math.random() * 3) + 1 )-1
                            body = body.replace(pair.keyword, pair.keyword+' '+pair.emojis.split(' ')[rand1])
                        }
                    }
                    notifications.push({text: body, url: url})
                }

                console.log(notifications)
                var html = $.templates.webPushTemplate(notifications);
                $("#generatedNotificationsWebPush").append(html)
                $('.toast').toast('show')

                $("#progressBarWebPush.progress-bar-fill").css({"width":"0%","transition":"none"});
                $('#progressBarWebPush').css('visibility', 'invisible')
                $('#webPushButton').attr("disabled", false);
            }
            catch(err){}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
            $("#progressBarWebPush.progress-bar-fill").css({"width":"0%","transition":"none"});
            $('#progressBarWebPush').css('visibility', 'invisible')
            $('#webPushButton').attr("disabled", false);
            alert('Error generating notifications, try again.')
        }

    });
}

/*abstract_notifications(true);
function abstract_notifications(emojiKey){
    $.getJSON("./data/abstract_notifications.json", function(json) {
        console.log(json); // this will show the info it in firebug console
        notifications = []
        for(val of json){
            var body = val[0].substring(0,150)+'... '
            if(!emojiKey)
                body = body + val[2]
            else{
                for(pair of val[1]){
                    rand1 = (Math.floor(Math.random() * 2) + 1 )-1
                    body = body.replace(pair.keyword, pair.keyword+' '+pair.emojis.split(' ')[rand1])
                }
            }
            notifications.push({text: body, category: 'My Abstract'})
        }
        var html = $.templates.composeTemplate(notifications);
        $("#generatedNotifications").append(html)
        $('.toast').toast('show')
    });
}*/
