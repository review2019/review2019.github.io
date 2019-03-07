Highcharts.chart('radialcontainer', {
    data: {
        table: 'freq',
        startRow: 1,
        endRow: 13,
        endColumn: 2
    },

    chart: {
        polar: true,
        type: 'column',
        backgroundColor:'rgba(255, 255, 255, 0.0)'
    },

    title: {
        text: 'Notifications for a user'
    },

    subtitle: {
        text: 'Accepted & rejected'
    },

    pane: {
        size: '85%'
    },

    

    xAxis: {
        tickmarkPlacement: 'on'
    },

    yAxis: {
        min: 0,
        endOnTick: false,
        showLastLabel: true,
        title: {
            text: ''
        },
        labels: {
            formatter: function () {
                return this.value;
            }
        },
        reversedStacks: true
    },

    tooltip: {
        valueSuffix: ' notifications'
    },

    plotOptions: {
        series: {
            stacking: 'normal',
            shadow: false,
            groupPadding: 0,
            pointPlacement: 'on'
        }
    }
});