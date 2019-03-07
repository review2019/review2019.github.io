$.getJSON(
    'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/marathon.json',
    function (data) {
    	Highcharts.chart('pccontainer', {
            chart: {
                type: 'spline',
                parallelCoordinates: true,
                parallelAxes: {
                    lineWidth: 2
                }
            },
            title: {
                text: 'Notification data'
            },
            plotOptions: {
                series: {
                    animation: false,
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    },
                    states: {
                        hover: {
                            halo: {
                                size: 0
                            }
                        }
                    },
                    events: {
                        mouseOver: function () {
                            this.group.toFront();
                        }
                    }
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{point.color}">\u25CF</span>' +
                    '{series.name}: <b>{point.formattedValue}</b><br/>'
            },
            xAxis: {
                categories: [
                    'Subject',
                    'Category',
                    'Post time',
                    'Action',
                    'Seen Time',
                    'Response Time'
                ],
                offset: 10
            },
            yAxis: [{
            	categories: [
                     'Other',
                     'Travel',
                     'Hobbies',
                     'Sports',
                     'News',
                     'Food & Drink',
                     'IT',
                     'Business',
                     'Arts'
                ]
            }, {
            	categories: [
                     'Unknown',
                     'Status',
                     'Message',
                     'Email',
                     'Service',
                     'Recommendation',
                     'Alarm',
                     'Transport',
                     'Progress',
                     'Call',
                     'Event',
                     'Reminder'
                ]
            }, {
            	categories: [
                    '0:00-0:59',
                    '1:00-1:59',
                    '2:00-2:59',
                    '3:00-3:59',
                    '4:00-4:59',
                    '5:00-5:59',
                    '6:00-6:59',
                    '7:00-7:59',
                    '8:00-8:59',
                    '9:00-9:59',
                    '10:00-10:59',
                    '11:00-11:59',
                    '12:00-12:59',
                    '13:00-13:59',
                    '14:00-14:59',
                    '15:00-15:59',
                    '16:00-16:59',
                    '17:00-17:59',
                    '18:00-18:59',
                    '19:00-19:59',
                    '20:00-20:59',
                    '21:00-21:59',
                    '22:00-22:59',
                    '23:00-23:59'
                ]
            }, {
                categories: [
                    'Reject',
                    'Accept'
                ]
            }, {
            	min: 0,
                tooltipValueFormat: '{value} seconds'
            }, {
            	min: 0,
                tooltipValueFormat: '{value} seconds'
            }],
            colors: ['rgba(11, 200, 200, 0.1)'],
            series: (function() { return getData();})().map(function (set, i) {
                return {
                    name: 'Notification ' + i,
                    data: set,
                    shadow: false
                };
            })
        });
    }
);
