//google.charts.load( 'current', { 'packages': [ 'corechart' ] } );
google.charts.load( 'current', { 'packages': [ 'corechart', 'line' ] } );

google.charts.setOnLoadCallback( drawChart );
google.charts.setOnLoadCallback( drawTrentino);


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
    let nuovi_deceduti = [];
    let first = new Date( json[ 0 ].data ).getTime() / 86400000 - 18316;
    let last = first;
    let lastDeceduti = 0;
    let lastDateTime;
    for ( daily of json ) {
        lastDateTime = daily.data;
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
        nuovi_deceduti.push( [ last, daily.deceduti - lastDeceduti ] );
        lastDeceduti = daily.deceduti;
    }
    return {
        date: lastDateTime,
        ratios: ratios,
        totale_casi: totale_casi,
        nuovi_attualmente_positivi: nuovi_attualmente_positivi,
        terapia_intensiva: terapia_intensiva,
        deceduti: deceduti,
        nuovi_deceduti: nuovi_deceduti
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

            let header = document.querySelector( '#head-nazionali' );
            let titleH1 = document.createElement( 'p' );
            titleH1.textContent = `Ultimo aggiornamento ${data.date}`;
            titleH1.className = "lead";
            header.appendChild( titleH1 );

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

            chartOptions.vAxis = {
                title: 'Deceduti',
                scaleType: 'lin',
                ticks: [ 0, 250, 500, 750, 1000 ]
            };

            dataTag = 'nuovi_deceduti';
            draw( "Nuovi deceduti", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );


        } );
}

function drawTrentino () {
    fetch( window.location.origin + "/cov19-trentino.json" ).then( ( response ) => {
        response.json().then( json => {
            let list = [];
            let dailyList = [];
            let ratioList = [];
            let before = 0;
            let data = json[ 0 ].cov19_data;
            data = Array.from( data );
            data.shift();
            let beforeDaily = data.reduce( ( accumulator, currentValue ) => accumulator + parseInt( currentValue[ 3 ] ), 0 );
            let date;
            for ( day of json ) {
                date = new Date( day.date );
                data = day.cov19_data;
                data.shift();
                let total = data.reduce( ( accumulator, currentValue ) => accumulator + parseInt( currentValue[ 3 ] ), 0 );
                let daily = total - before;
                let ratio = daily / beforeDaily;
                beforeDaily = daily;
                before = total;
                list.push( [ date, total ] );
                dailyList.push( [ date, daily ] );
                ratioList.push( [ date, ratio ] );
                console.log( date, total );
            }
            let header = document.querySelector( '#head-trentino' );
            let titleH1 = document.createElement( 'p' );
            titleH1.textContent = `Ultimo aggiornamento ${date.toISOString().split("T")[0]} ${date.toLocaleTimeString()}`;
            titleH1.className = "lead";
            header.appendChild( titleH1 );

            var chartOptions = {
                title: 'Nessuno',
                width: 800,
                height: 500,
                chartArea: { width: '50%' },

                hAxis: {
                    title: 'Date'
                },
                vAxis: {
                    title: 'Positivi',
                    ticks: [ 0, 200, 400, 600, 800, 1000 ]
                },
                trendlines: {
                    0: {
                        type: 'linear',
                        showR2: true,
                        visibleInLegend: true
                    }
                }

            };

            dataTag = 'trentino'
            draw( "Totale positivi. Dati ricavati da quelli pubblicati dall'APSS",
                fillDatesTable( dataTag, list), dataTag, chartOptions );

            chartOptions.vAxis = {
                title: 'Positivi',
                scaleType: 'lin',
                ticks: [ 0, 50, 100, 150, 200 ]
            };

            dataTag = 'nuovi_trentino'
            draw( "Nuovi positivi. Dati ricavati da quelli pubblicati dall'APSS",
                fillDatesTable( dataTag, dailyList ), dataTag, chartOptions );

            chartOptions.vAxis = {
                title: 'Positivi',
                scaleType: 'lin',
                ticks: [ 0, 0.5, 1, 1.5, 2 ]
            };

            dataTag = 'trentino_ratio'
            draw( "Rapporto dell'incremento del giorno rispetto a quello del giorno prima",
                fillDatesTable( dataTag, ratioList ), dataTag, chartOptions );



        });
    });

}