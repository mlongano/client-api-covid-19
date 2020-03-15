google.charts.load( 'current', { 'packages': [ 'corechart' ] } );
google.charts.setOnLoadCallback( drawChart );
const getData = () => {
    //return fetch( "https://coronavirus-tracker-api.herokuapp.com/all" );
    return fetch( "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json" );
}
function draw(data, element, options) {
    var chart = new google.visualization.ScatterChart( document.getElementById( element ) );
    chart.draw( data, options );
}

function drawChart () {
    getData()
        .then( res => res.json() )
        .then( json => {
            let previous = json[ 0 ].nuovi_attualmente_positivi;
            let data = [
                [ 'Giorno', 'Ratio' ]
            ];
            let totale_casi = [
                [ 'Giorno', 'Totale' ]
            ];
            let nuovi_attualmente_positivi = [
                [ 'Giorno', 'nuovi' ]
            ];
            let terapia_intensiva = [
                [ 'Giorno', 'intensiva' ]
            ];
            let deceduti = [
                [ 'Giorno', 'Deceduti' ]
            ];
            let first = new Date( json[ 0 ].data ).getTime() / 86400000 - 18316;
            let last = first;
            for ( daily of json ) {
                let date = daily.data.split( " " )[ 0 ];
                console.log( date );
                let ratio = daily.nuovi_attualmente_positivi / previous;
                previous = daily.nuovi_attualmente_positivi;
                console.log( daily );
                last = new Date( date ).getTime() / 86400000 - 18316;
                data.push( [ last, ratio ] );
                totale_casi.push( [ last, daily.totale_casi ] );
                nuovi_attualmente_positivi.push( [ last, daily.nuovi_attualmente_positivi ] );
                terapia_intensiva.push( [ last, daily.terapia_intensiva ] );
                deceduti.push( [ last, daily.deceduti ] );
            }

            data = google.visualization.arrayToDataTable( data );
            totale_casi = google.visualization.arrayToDataTable( totale_casi );
            nuovi_attualmente_positivi = google.visualization.arrayToDataTable( nuovi_attualmente_positivi );
            terapia_intensiva = google.visualization.arrayToDataTable( terapia_intensiva );
            deceduti = google.visualization.arrayToDataTable( deceduti );


            var options = {
                hAxis: { minValue: first, maxValue:  last},
                vAxis: { minValue: 0, maxValue: 4 },
                legend: { left: { position: "bottom-left" } },
                chartArea: { width: '50%' },
                trendlines: {
                    0: {
                        type: 'linear',
                        showR2: true,
                        visibleInLegend: true
                    }
                }
            };
            draw( data, 'ratio', options );

            options.trendlines[ 0 ].type = 'exponential';
            options.colors = [ '#6F9654' ];
            draw( totale_casi, 'totale_casi', options );
            draw( nuovi_attualmente_positivi, 'nuovi_attualmente_positivi', options );
            draw( terapia_intensiva, 'terapia_intensiva', options );
            options.colors = [ '#c21212' ];
            draw( deceduti, 'deceduti', options );

        } );
}