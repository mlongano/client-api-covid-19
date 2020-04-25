const getData = () => {
    //return fetch( "https://coronavirus-tracker-api.herokuapp.com/all" );
    return fetch( "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json" );
}
/* function drawChart ( data, element ) {
    return () => {
        let options = {
            title: "Rapporto dell'incremento del giorno rispetto a quello del giorno prima",
            hAxis: { title: 'Giorno' },
            vAxis: { title: 'Ratio' },
            legend: 'none',
            trendlines: {
                0: {
                    type: 'linear',
                    showR2: true,
                    visibleInLegend: true
                }
            }
        };

        var chart = new google.visualization.ScatterChart( document.getElementById( element ) );
        chart.draw( google.visualization.arrayToDataTable( data ), options );
        console.log(options);
    }
}
 */
getData()
    .then( res => res.json() )
    .then( json => {
        google.charts.load( "current", { packages: [ "corechart" ] } );

        let previous = json[ 0 ].nuovi_positivi;
        var options = {
            dataAxis: { showMinorLabels: true },
            legend: { left: { position: "bottom-left" } },
            start: "2014-06-09",
            end: "2014-07-03"
        };

        let items = [];

        let data =  [
            [ 'Giorno', 'Ratio' ]
        ];

        for ( daily of json ) {
            let date = daily.data.split( " " )[ 0 ];
            console.log( date );
            let ratio = daily.nuovi_positivi / previous;
            previous = daily.nuovi_positivi;
            console.log( daily );
            items.push( { x: date, y: ratio } )
            data.push( [ date, 1.2 ] );
        }
/*         var options = {
            dataAxis: { showMinorLabels: true },
            legend: { left: { position: "bottom-left" } },
            start: items[ 0 ].x,
            end: items[ items.length - 1 ].x
        };
 */
        //var dataset = new vis.DataSet( items );
        //var graph2d = new vis.Graph2d( container, dataset );
        google.charts.setOnLoadCallback( drawChart( data, 'chart_pointSize' ) );

    } );

const showLatestButtons = ( data ) => {
    const app = document.querySelector( "#app" );

}

