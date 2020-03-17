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

function extractInfo(json) {
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
    return {
        ratios: ratios,
        totale_casi: totale_casi,
        nuovi_attualmente_positivi: nuovi_attualmente_positivi,
        terapia_intensiva: terapia_intensiva,
        deceduti: deceduti
    }

}

function fillDatesTable(title, list) {
    let table = new google.visualization.DataTable();
    table.addColumn( 'date', 'Data' );
    table.addColumn( 'number', title );
    table.addRows( list );
    return table;
}

function drawChart () {
    getData()
        .then( res => res.json() )
        .then( json => {
            let dataTag;
            let data = extractInfo( json );

            var chartOptions = {
                title: 'Nessuno',
                width: 800,
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

            dataTag = 'ratio'
            draw( "Rapporto dell'incremento del giorno rispetto a quello del giorno prima",
                fillDatesTable( dataTag, data[ 'ratios' ] ), dataTag, chartOptions );

            chartOptions.trendlines[ 0 ].type = 'exponential';
            chartOptions.colors = [ '#6F9654' ];
            chartOptions.vAxis = {
                title: 'Positivi',
                scaleType: 'lin',
                ticks: [ 0, 5000, 10000, 15000, 20000, 25000]
            };

            dataTag = 'totale_casi';
            draw( "Totale dei casi", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );

            chartOptions.colors = [ '#6F0654' ];
            chartOptions.vAxis = {
                title: 'Positivi',
                scaleType: 'lin',
                ticks: [ 0, 1000, 2000, 3000 ]
            };

            dataTag = 'nuovi_attualmente_positivi';
            draw( "Nuovi positivi", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );

            // options.title = "In terapia intensiva";
            // draw( terapia_intensiva, 'terapia_intensiva', options );
            chartOptions.colors = [ '#6F5694' ];
            chartOptions.vAxis = {
                title: 'In terapia intensiva',
                scaleType: 'lin',
                ticks: [ 0, 1000, 2000, 3000 ]
            };

            dataTag = 'terapia_intensiva';
            draw( "In terapia intensiva", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );

            // options.title = "Deceduti";
            // options.colors = [ '#c21212' ];
            // draw( deceduti, 'deceduti', options );
            chartOptions.colors = [ '#c21212' ];
            chartOptions.vAxis = {
                title: 'Deceduti',
                scaleType: 'lin',
                ticks: [ 0, 1000, 2000, 3000 ]
            };

            dataTag = 'deceduti';
            draw( "Deceduti", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );


        } );
}