function showVis2(){
    Highcharts.chart('bubblecontainer', {
        chart: {
            type: 'packedbubble',
            height: '60%'
        },
        title: {
            text: 'Notification Subjects & Categories'
        },
        tooltip: {
            useHTML: true,
            pointFormat: '<b>{point.name}:</b> {point.y} Notifications'
        },
        plotOptions: {
            packedbubble: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    filter: {
                        property: 'y',
                        operator: '>',
                        value: 150
                    },
                    style: {
                        color: 'black',
                        textOutline: 'none',
                        fontWeight: 'normal'
                    }
                },

                 minSize: 10,
                 maxSize: 50
            }
        },
        series: [{
            name: 'Notification Category',
            color:'pink',
            data: [{
                name: 'Call',
                value: 50
            }, {
                name: 'Message',
                value: 15
            },
            {
                name: "Progress Report",
                value: 83
            },
            {
                name: "Status",
                value: 10
            },
            {
                name: "System Update",
                value: 123
            },
            {
                name: "transport",
                value: 29
            },
            {
                name: "Uknown Category",
                value: 1901
            }]
        }, {
            name: 'Notification Subject',
            data: [{
                name: 'Arts & Entertainment',
                value: 48
            }, {
                name: 'Music & Audio',
                value: 3
            },
            {
                name: "Online Image Galleries",
                value: 1
            },
            {
                name: "TV & Video",
                value: 3
            },
            {
                name: "Fitness",
                value: 2
            },
            {
                name: "Literature",
                value: 1
            },
            {
                name: "Computer Peripherals",
                value: 2
            },
            {
                name: "Internet Software",
                value: 3
            },
            {
                name: "Accounting & Auditing",
                value: 1
            },
            {
                name: "Telecom",
                value: 4
            },
            {
                name: "Weather",
                value: 5
            },
            {
                name: "Online Communities",
                value: 9
            },
            {
                name: "Social Networks",
                value: 11
            },
            {
                name: "Friends & Family",
                value: 3
            },
            {
                name: "Maps",
                value: 5
            },
            {
                name: "Sports",
                value: 6
            },
            {
                name: "Bus & Rail",
                value: 1
            },
            {
                name: "Tourist Destinations",
                value: 1
            },
            {
                name: "App Process",
                value: 1
            },
            {
                name: "Unknown Subject",
                value: 2102
            }]
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'right',
                        verticalAlign: 'middle',
                        layout: 'vertical'
                    }
                }
            }]
        }
    });
}
