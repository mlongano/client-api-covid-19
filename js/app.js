//google.charts.load( 'current', { 'packages': [ 'corechart' ] } );
google.charts.load( 'current', { 'packages': [ 'corechart', 'line' ] } );

google.charts.setOnLoadCallback( drawChart );
const getData = () => {
    //return fetch( "https://coronavirus-tracker-api.herokuapp.com/all" );
    return fetch( "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json" );
}
function draw(title, data, element, options ) {
    options.title = title;
    var chart = new google.visualization.LineChart( document.getElementById( element ) );
    chart.draw( data, options );
}

function drawChart () {
    getData()
        .then( res => res.json() )
        .then( json => {


            let ratioTable = new google.visualization.DataTable();
            ratioTable.addColumn( 'date', 'Data' );
            ratioTable.addColumn( 'number', 'Ratio' );

            let totaleTable = new google.visualization.DataTable();
            totaleTable.addColumn( 'date', 'Data' );
            totaleTable.addColumn( 'number', 'Totale' );

            let nuovi_attualmente_positiviTable = new google.visualization.DataTable();
            nuovi_attualmente_positiviTable.addColumn( 'date', 'Data' );
            nuovi_attualmente_positiviTable.addColumn( 'number', 'Nuovi' );

            let terapia_intensivaTable = new google.visualization.DataTable();
            terapia_intensivaTable.addColumn( 'date', 'Date' );
            terapia_intensivaTable.addColumn( 'number', 'Intensiva' );

            let decedutiTable = new google.visualization.DataTable();
            decedutiTable.addColumn( 'date', 'Date' );
            decedutiTable.addColumn( 'number', 'Deceduti' );

            let previous = json[ 0 ].nuovi_attualmente_positivi;
            let ratios = [];
            let totale_casi = [];
            let nuovi_attualmente_positivi = [];
            let terapia_intensiva = [];
            let deceduti = [];
            let first = new Date( json[ 0 ].data ).getTime() / 86400000 - 18316;
            let last = first;
            for ( daily of json ) {
                let date = daily.data.split( " " )[ 0 ];
                console.log( date );
                let ratio = daily.nuovi_attualmente_positivi / previous;
                previous = daily.nuovi_attualmente_positivi;
                console.log( daily );
                last = new Date( date );
                ratios.push( [ last, ratio ] );
                totale_casi.push( [ last, daily.totale_casi ] );
                nuovi_attualmente_positivi.push( [ last, daily.nuovi_attualmente_positivi ] );
                terapia_intensiva.push( [ last, daily.terapia_intensiva ] );
                deceduti.push( [ last, daily.deceduti ] );
            }
            ratioTable.addRows( ratios );
            totaleTable.addRows( totale_casi );
            nuovi_attualmente_positiviTable.addRows( nuovi_attualmente_positivi );
            terapia_intensivaTable.addRows( terapia_intensiva );
            decedutiTable.addRows( deceduti );

            var optionsOld = {
                width: 600,
                height: 300,
                hAxis: { minValue: first, maxValue:  last},
                vAxis: { minValue: 0, maxValue: 4 },
                chartArea: { width: '50%' },
                trendlines: {
                    0: {
                        type: 'linear',
                        showR2: true,
                        visibleInLegend: true
                    }
                }
            };
            var chartOptions = {
                title: 'Nessuno',
                width: 450,
                height: 500,
                chartArea: { width: '50%' },

                hAxis: {
                    title: 'Date'
                },
                vAxis: {
                    title: 'Ratio',
                    ticks: [ 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4 ]
                },
                trendlines: {
                    0: {
                        type: 'linear',
                        showR2: true,
                        visibleInLegend: true
                    }
                }

            };

            draw( "Rapporto dell'incremento del giorno rispetto a quello del giorno prima",
                ratioTable, 'ratio', chartOptions );

            chartOptions.trendlines[ 0 ].type = 'exponential';
            chartOptions.colors = [ '#6F9654' ];
            chartOptions.vAxis = {
                title: 'Positivi',
                scaleType: 'lin',
                ticks: [ 0, 5000, 10000, 15000, 20000, 25000]
            };
            draw( "Totale dei casi", totaleTable, 'totale_casi', chartOptions );

            chartOptions.colors = [ '#6F0654' ];
            chartOptions.vAxis = {
                title: 'Positivi',
                scaleType: 'lin',
                ticks: [ 0, 1000, 2000, 3000 ]
            };
            draw( "Nuovi positivi", nuovi_attualmente_positiviTable, 'nuovi_attualmente_positivi', chartOptions );


            // options.title = "In terapia intensiva";
            // draw( terapia_intensiva, 'terapia_intensiva', options );
            chartOptions.colors = [ '#6F5694' ];
            chartOptions.vAxis = {
                title: 'In terapia intensiva',
                scaleType: 'lin',
                ticks: [ 0, 1000, 2000, 3000 ]
            };
            draw( "In terapia intensiva", terapia_intensivaTable, 'terapia_intensiva', chartOptions );

            // options.title = "Deceduti";
            // options.colors = [ '#c21212' ];
            // draw( deceduti, 'deceduti', options );
            chartOptions.colors = [ '#c21212' ];
            chartOptions.vAxis = {
                title: 'In terapia intensiva',
                scaleType: 'lin',
                ticks: [ 0, 1000, 2000, 3000 ]
            };
            draw( "Decedutia", decedutiTable, 'deceduti', chartOptions );


        } );
}