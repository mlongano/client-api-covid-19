const urlsDataTrentino = {
    urlelencocomuni: 'https://covid19trentino.fbk.eu/data/codici_comuni.csv',
    //urlandamentocasi: 'https://covid19trentino.fbk.eu//spreadsheets/d/e/2PACX-1vQdZ7yQhx38EsaR05DRprb0YkaRf5eK6cfrrOGMfFnDKq-P-g8q-HMRv76UnTkoRYvCMrgkQkX-xJOE/pub?gid=0&single=true&output=csv',
    urlstatoclinico: 'https://covid19trentino.fbk.eu/data/stato_clinico_td.csv',
    urlcodicicomuni: "https://covid19trentino.fbk.eu/data/codici_comuni.csv",
    urlsituazionecomuni: 'https://covid19trentino.fbk.eu/data/stato_comuni_td.csv'
};

//return fetch( "https://coronavirus-tracker-api.herokuapp.com/all" );
const urlDataItaly = "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json";

//google.charts.load( 'current', { 'packages': [ 'corechart' ] } );
google.charts.load( 'current', { 'packages': [ 'corechart', 'line' ] } );

google.charts.setOnLoadCallback( drawChartItaly );
google.charts.setOnLoadCallback( drawChartTrentino );
google.charts.setOnLoadCallback( drawChartComuni );

function draw ( title, data, element, options ) {
    options.title = title;
    const chartMaterial = new google.charts.Line( document.getElementById( element ) );
    const chart = new google.visualization.LineChart( document.getElementById( element ) );
    chart.draw( data, options );
    //chartMaterial.draw( data, google.charts.Line.convertOptions( options ) );
}

function extractInfo ( json ) {
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
        //console.log( date );
        let ratio = daily.nuovi_attualmente_positivi / previous;
        previous = daily.nuovi_attualmente_positivi;
        //console.log( daily );
        last = new Date( date );
        ratios.push( [ last, ratio ] );
        let tc = 0;
        if ( daily.totale_casi === "") {
            
        }
        if (daily.totale_casi instanceof String) {
            tc = parseInt( daily.totale_casi );
        } else {
            tc = daily.totale_casi;
        };

        totale_casi.push( [ last, tc ] );
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

function fillDatesTable ( title, list ) {
    let table = new google.visualization.DataTable();
    table.addColumn( 'date', 'Data' );
    table.addColumn( 'number', title );
    table.addRows( list );
    return table;
}

async function drawChartItaly () {
    let res = await fetch( urlDataItaly );
    let json = await res.json();
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
            // ticks: [ 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4 ]
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
        //ticks: [ 0, 5000, 10000, 15000, 20000, 25000]
    };

    dataTag = 'totale_casi';
    draw( "Totale dei casi", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );

    chartOptions.colors = [ '#6F0654' ];
    chartOptions.vAxis = {
        title: 'Positivi',
        scaleType: 'lin',
        //ticks: [ 0, 1000, 2000, 3000 ]
    };

    dataTag = 'nuovi_attualmente_positivi';
    draw( "Nuovi positivi", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );

    // options.title = "In terapia intensiva";
    // draw( terapia_intensiva, 'terapia_intensiva', options );
    chartOptions.colors = [ '#6F5694' ];
    chartOptions.vAxis = {
        title: 'In terapia intensiva',
        scaleType: 'lin',
        //ticks: [ 0, 1000, 2000, 3000 ]
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
        //ticks: [ 0, 1000, 2000, 3000 ]
    };

    dataTag = 'deceduti';
    draw( "Deceduti", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );

    chartOptions.vAxis = {
        title: 'Deceduti',
        scaleType: 'lin',
        //ticks: [ 0, 250, 500, 750, 1000 ]
    };

    dataTag = 'nuovi_deceduti';
    draw( "Nuovi deceduti", fillDatesTable( dataTag, data[ dataTag ] ), dataTag, chartOptions );

}

async function drawChartComuni () {
    let res = await fetch( window.location.origin + "/cov19-trentino.json" );
    let json = await res.json();
    const COMUNE = "ROVERETO";
    let dailyList = [];
    let ratioList = [];
    let casesList = [];
    let deadsList = [];
    let deadsDailyList = [];
    let before = 0;
    let data = json[ 0 ].cov19_data;
    data = Array.from( data );
    data.shift();
    let beforeDaily = 1;
    let deads = 0;
    let date;
    let idx;
    for ( day of json ) {
        date = new Date( day.date );
        data = day.cov19_data;
        if ( data[ 0 ][ 0 ] === "Lat" ) {
            idx = 3;
        } else if ( data[ 0 ][ 0 ] === "codice") {
            idx = 2;
        } else {
            idx = 1;
        }
        //console.log(idx);
        let cases = data.filter( ( row ) => {
            return row[ idx - 1 ] === COMUNE;
        } )[ 0 ];
        data.shift();
        let total = data.reduce( ( accumulator, currentValue ) => accumulator + parseInt( currentValue[ 3 ] ), 0 );
        let comune = parseInt( cases[ idx ] );
        let daily = comune - before;
        let ratio = daily / beforeDaily;
        console.log( COMUNE, date, ratio, daily, beforeDaily );
        if ( idx === 2 ) {
            let last = cases[ idx + 2 ];
            deadsList.push( [ date, parseInt( last ) ] );
            deadsDailyList.push( [ date, parseInt( last - deads ) ] );
            deads = last;
        }
        beforeDaily = daily;
        before = comune;
        casesList.push( [ date, comune ] );
        dailyList.push( [ date, daily ] );
        ratioList.push( [ date, ratio ] );
        //console.log( date, total );
    }
    let header = document.querySelector( '#head-comune' );
    let title = document.querySelector( '#head-comune > h1' );
    title.textContent += COMUNE;
    let titleH1 = document.createElement( 'p' );
    titleH1.textContent = `Ultimo aggiornamento ${date.toISOString().split( "T" )[ 0 ]} ${date.toLocaleTimeString()}`;
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
            //ticks: [ 0, 200, 400, 600, 800, 1000 ]
        },
        trendlines: {
            0: {
                type: 'exponential',
                showR2: true,
                visibleInLegend: true
            }
        }

    };
    chartOptions.trendlines[ 0 ].type = 'exponential';

    dataTag = 'comuni'
    draw( "Totale positivi. Dati ricavati da quelli pubblicati dall'APSS",
        fillDatesTable( dataTag, casesList ), dataTag, chartOptions );
    chartOptions.trendlines[ 0 ].type = 'exponential';

    chartOptions.vAxis = {
        title: 'Positivi',
        scaleType: 'lin',
        //ticks: [ 0, 50, 100, 150, 200 ]
    };

    dataTag = 'nuovi_comuni'
    draw( "Nuovi positivi. Dati ricavati da quelli pubblicati dall'APSS",
        fillDatesTable( dataTag, dailyList ), dataTag, chartOptions );

    chartOptions.colors = [ '#c21212' ];
    chartOptions.vAxis = {
        title: 'Deceduti',
        scaleType: 'lin',
    };


    dataTag = 'comuni_deceduti'
    draw( "Deceduti. Dati ricavati da quelli pubblicati dall'APSS",
        fillDatesTable( dataTag, deadsList ), dataTag, chartOptions );

    dataTag = 'comuni_nuovi_deceduti'
    draw( "Nuovi deceduti. Dati ricavati da quelli pubblicati dall'APSS",
        fillDatesTable( dataTag, deadsDailyList ), dataTag, chartOptions );
}

async function drawChartTrentino () {
    //let res = await fetch( urlsDataTrentino.urlandamentocasi );
    //let csvString = await res.text();
    //const json = await csv().fromString( csvString );
    //console.log( json );
    let res = await fetch( urlsDataTrentino.urlstatoclinico );
    let csvString = await res.text();
    const json = await csv().fromString( csvString );
    console.log( json );
    let totaleList = [];
    let nuoviList = [];
    let ratioList = [];
    let decedutiList = [];
    let decedutiNuoviList = [];
    let beforeDaily = Infinity;
    let date;
    let deceduti = 0;
    //let beforeDaily = json[ 0 ].day;
    for ( day of json ) {
        date = new Date( day.giorno.split( "/" ).reverse().join( "-" ) );
        let daily = parseInt( day.incremento );
        let ratio = daily / beforeDaily;
        beforeDaily = daily;
        totaleList.push( [ date, parseInt( day.totale_pos ) ] );
        nuoviList.push( [ date, daily ] );
        ratioList.push( [ date, ratio ] );
        decedutiList.push( [ date, parseInt( day.deceduti ) ] );
        decedutiNuoviList.push( [ date, parseInt( day.deceduti ) - deceduti ] );
        deceduti = parseInt( day.deceduti );
        console.log( date, parseInt( day.totale_pos ) );
    }

    console.log( "nuovi dec.", decedutiNuoviList );

    let header = document.querySelector( '#head-trentino' );
    let titleH1 = document.createElement( 'p' );
    titleH1.textContent = `Ultimo aggiornamento ${date.toISOString().split( "T" )[ 0 ]}`;
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
            //ticks: [ 0, 200, 400, 600, 800, 1000 ]
        },
        trendlines: {
            0: {
                type: 'exponential',
                showR2: true,
                visibleInLegend: true
            }
        }

    };

    dataTag = 'trentino'
    draw( "Totale positivi. Dati ricavati da quelli pubblicati dall'APSS",
        fillDatesTable( dataTag, totaleList ), dataTag, chartOptions );

    chartOptions.vAxis = {
        title: 'Positivi',
        scaleType: 'lin',
        //ticks: [ 0, 50, 100, 150, 200 ]
    };

    dataTag = 'nuovi_trentino'
    draw( "Nuovi positivi. Dati ricavati da quelli pubblicati dall'APSS",
        fillDatesTable( dataTag, nuoviList ), dataTag, chartOptions );

    chartOptions.vAxis = {
        title: 'Positivi',
        scaleType: 'lin',
        //ticks: [ 0, 0.5, 1, 1.5, 2 ]
    };
    chartOptions.trendlines[ 0 ].type = 'linear';

    dataTag = 'trentino_ratio'
    draw( "Rapporto dell'incremento del giorno rispetto a quello del giorno prima",
        fillDatesTable( dataTag, ratioList ), dataTag, chartOptions );

    chartOptions.colors = [ '#c21212' ];
    chartOptions.vAxis = {
        title: 'Deceduti',
        scaleType: 'lin',
        //ticks: [ 0, 0.5, 1, 1.5, 2 ]
    };
    chartOptions.trendlines[ 0 ].type = 'exponential';

    dataTag = 'deceduti_trentino'
    draw( "Totale deceduti. Dati ricavati da quelli pubblicati dall'APSS",
        fillDatesTable( dataTag, decedutiList ), dataTag, chartOptions );

    dataTag = 'nuovi_deceduti_trentino'
    draw( "Nuovi deceduti. Dati ricavati da quelli pubblicati dall'APSS",
        fillDatesTable( dataTag, decedutiNuoviList ), dataTag, chartOptions );

}