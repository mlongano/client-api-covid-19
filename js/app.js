const urlsDataTrentino = {
    urlelencocomuni: 'https://covid19trentino.fbk.eu/data/codici_comuni.csv',
    //urlandamentocasi: 'https://covid19trentino.fbk.eu//spreadsheets/d/e/2PACX-1vQdZ7yQhx38EsaR05DRprb0YkaRf5eK6cfrrOGMfFnDKq-P-g8q-HMRv76UnTkoRYvCMrgkQkX-xJOE/pub?gid=0&single=true&output=csv',
    urlstatoclinico: 'https://covid19trentino.fbk.eu/data/stato_clinico_td.csv',
    urlcodicicomuni: "https://covid19trentino.fbk.eu/data/codici_comuni.csv",
    urlsituazionecomuni: 'https://covid19trentino.fbk.eu/data/stato_comuni_td.csv'
};

const CHART_WIDTH = 600;
const CHART_HIGHT = 400;

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
    //chart.draw( data, options );
    chartMaterial.draw( data, google.charts.Line.convertOptions( options ) );
}

function extractInfo ( json ) {
    console.log("Italia json:", json);
    let previous = json[ 0 ].nuovi_positivi;
    let ratios = [];
    let totale_casi = [];
    let nuovi_positivi = [];
    let terapia_intensiva = [];
    let deceduti = [];
    let tamponi = [];
    let ospedalizzati = [];
    let first = new Date( json[ 0 ].data ).getTime() / 86400000 - 18316;
    let last = first;
    let ultimiDeceduti = 0;
    let ultimiTamponi = 0;
    let ultimiTerapia = 0;
    let ultimiOspedalizzati = 0;
    let lastDateTime;
    for ( daily of json ) {
        lastDateTime = daily.data;
        let date = daily.data.split( " " )[ 0 ];
        //console.log( date );
        let ratio = daily.nuovi_positivi / previous;
        previous = daily.nuovi_positivi;
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
        nuovi_positivi.push( [ last, daily.nuovi_positivi ] );

        ospedalizzati.push( [ last, daily.totale_ospedalizzati - ultimiOspedalizzati, daily.totale_ospedalizzati ] );
        ultimiOspedalizzati = daily.totale_ospedalizzati;

        terapia_intensiva.push( [ last, daily.terapia_intensiva - ultimiTerapia, daily.terapia_intensiva  ]);
        ultimiTerapia = daily.terapia_intensiva;

        deceduti.push( [ last, daily.deceduti - ultimiDeceduti, daily.deceduti  ] );
        ultimiDeceduti = daily.deceduti;

        tamponi.push( [ last, daily.tamponi - ultimiTamponi, daily.tamponi ] );
        ultimiTamponi = daily.tamponi;
    }
    console.log( "Italia deceduti:", deceduti);
    return {
        date: lastDateTime,
        ratios: ratios,
        totale_casi: totale_casi,
        nuovi_positivi: nuovi_positivi,
        terapia_intensiva: terapia_intensiva,
        deceduti: deceduti,
        tamponi: tamponi,
        ospedalizzati: ospedalizzati,
    }

}

function fillDatesTable ( title, list, ncol=1 ) {
    let table = new google.visualization.DataTable();
    table.addColumn( 'date', 'Data' );
    for ( let n = 0; n < ncol; n++ ) {
        table.addColumn( 'number', title );
    }
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
    titleH1.textContent = `Ultimo aggiornamento ${data.date.split( "T" )[ 0 ].split("-").reverse().join("/")}`;
    titleH1.className = "lead subtitle";
    header.appendChild( titleH1 );

    const chartOptions = {
        width: CHART_WIDTH,
        height: CHART_HIGHT,
        chartArea: { width: '50%' },

        hAxis: {
            title: 'Date'
        },
    };

    chartOptions.colors = [ '#0012F2', '#F012F2' ];

    chartOptions.series = {
        // Gives each series an axis name that matches the Y-axis below.
        0: { axis: 'nuovi' },
        1: { axis: 'totale' }
    };
    chartOptions.axes = {
        // Adds labels to each axis; they don't have to match the axis names.
        y: {
            nuovi: { label: 'Nuovi' },
            totale: { label: 'Totale' }
        }
    }
    chartOptions.legend = { position: 'none' }

    dataTag = 'ospedalizzati';
    draw( "Ospedalizzati", fillDatesTable( dataTag, data[ dataTag ], 2 ), dataTag, chartOptions );

    chartOptions.colors = [ '#6F5694', '#FF5694'  ];

    dataTag = 'terapia_intensiva';
    draw( "In terapia intensiva", fillDatesTable( dataTag, data[ dataTag ], 2 ), dataTag, chartOptions );

    chartOptions.colors = [ '#c21212',  '#c28212'];

    dataTag = 'deceduti';
    draw( "Deceduti", fillDatesTable( dataTag, data[ dataTag ], 2 ), dataTag, chartOptions );

    chartOptions.colors = [ '#0012F2', '#0082F2'  ];

    dataTag = 'tamponi';
    draw( "Tamponi", fillDatesTable( dataTag, data[ dataTag ], 2 ), dataTag, chartOptions );

}

async function drawChartTrentino () {
    //let res = await fetch( urlsDataTrentino.urlandamentocasi );
    //let csvString = await res.text();
    //const json = await csv().fromString( csvString );
    //console.log( json );
    let res = await fetch( urlsDataTrentino.urlstatoclinico );
    let csvString = await res.text();
    const json = await csv().fromString( csvString );
    console.log( "Trentino", json );
    let totaleList = [];
    let nuoviList = [];
    let ratioList = [];

    let terapia_intensiva = [];
    let deceduti = [];
    let ospedalizzati = [];

    let beforeDaily = Infinity;
    let date;

    let ultimiDeceduti = 0;
    let ultimiTerapia = 0;
    let ultimiOspedalizzati = 0;

    //let beforeDaily = json[ 0 ].day;
    for ( daily of json ) {
        date = new Date( daily.giorno.split( "/" ).reverse().join( "-" ) );
        let nuovi_positivi = parseInt( daily.incremento );
        let ratio = nuovi_positivi / beforeDaily;
        beforeDaily = nuovi_positivi;
        totaleList.push( [ date, parseInt( daily.totale_pos ) ] );
        nuoviList.push( [ date, nuovi_positivi ] );
        ratioList.push( [ date, ratio ] );
        //deceduti = parseInt( day.deceduti );
        console.log( "Trentino totale positivi:", date, parseInt( daily.totale_pos ) );

        let inf = parseInt( daily.infettive );
        let alta = parseInt( daily.alta_int );
        let inte = parseInt( daily.terapia_in );
        let tot = inf + alta + inte;
        let terap = alta + inte;


        ospedalizzati.push( [ date, tot - ultimiOspedalizzati, tot ] );
        ultimiOspedalizzati = tot;

        terapia_intensiva.push( [ date, terap - ultimiTerapia, terap ] );
        ultimiTerapia = terap;

        deceduti.push( [ date, parseInt( daily.deceduti ) - ultimiDeceduti, parseInt( daily.deceduti )  ]);
        ultimiDeceduti = parseInt(daily.deceduti);


    }

    console.log( "Trentino", "nuovi dec.", deceduti );

    let header = document.querySelector( '#head-trentino' );
    let titleH1 = document.createElement( 'p' );
    titleH1.textContent = `Ultimo aggiornamento ${date.toISOString().split( "T" )[ 0 ].split( "-" ).reverse().join( "/" )}`;
    titleH1.className = "lead subtitle";
    header.appendChild( titleH1 );

    const chartOptions = {
        width: CHART_WIDTH,
        height: CHART_HIGHT,
        chartArea: { width: '50%' },

        hAxis: {
            title: 'Date'
        },
    };


    chartOptions.series = {
        // Gives each series an axis name that matches the Y-axis below.
        0: { axis: 'nuovi' },
        1: { axis: 'totale' }
    };
    chartOptions.axes = {
        // Adds labels to each axis; they don't have to match the axis names.
        y: {
            nuovi: { label: 'Nuovi' },
            totale: { label: 'Totale' }
        }
    }
    chartOptions.legend = { position: 'none' }

    chartOptions.colors = [ '#0012F2', '#F012F2' ];
    dataTag = 'ospedalizzati_trentino'
    draw( "Ospedalizzati. Dati APSS",
        fillDatesTable( dataTag, ospedalizzati, 2 ), dataTag, chartOptions );

    chartOptions.colors = [ '#6F5694', '#FF5694' ];
    dataTag = 'terapia_intensiva_trentino'
    draw( "In terapia intensiva/alta intensità. Dati APSS",
        fillDatesTable( dataTag, terapia_intensiva, 2 ), dataTag, chartOptions );

    chartOptions.colors = [ '#c21212', '#c28212' ];
    dataTag = 'deceduti_trentino'
    draw( "Deceduti. Dati APSS",
        fillDatesTable( dataTag, deceduti, 2 ), dataTag, chartOptions );


}

async function drawChartComuni () {
    let res = await fetch( window.location.origin + "/cov19-trentino.json" );
    let json = await res.json();
    let comune = document.querySelector( '#comune' ).value;

    const COMUNE = comune || "ROVERETO";
    let ratioList = [];
    let casesList = [];
    let deadsList = [];
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
        console.log(COMUNE,"Dati:",  data);

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
        if ( !cases ) {
            continue;
        }
        data.shift();
        let comune = parseInt( cases[ idx ] );
        let daily = comune - before;
        let ratio = daily / beforeDaily;
        //console.log( COMUNE, date, ratio, daily, beforeDaily );
        if ( idx === 2 ) {
            let last = cases[ idx + 2 ];
            deadsList.push( [ date, parseInt( last ) - parseInt( deads ), parseInt( last ) ] );
            deads = last;
        }
        beforeDaily = daily;
        before = comune;
        casesList.push( [ date, daily, comune ] );
        ratioList.push( [ date, ratio ] );
        //console.log( date, total );
    }
    let title = document.querySelector( '#head-comune > h1' );
    title.textContent = `Dati di ${COMUNE}`;
    let titleH1 = document.querySelector( '#head-comune > p' );
    titleH1.textContent = `Ultimo aggiornamento ${date.toISOString().split( "T" )[ 0 ].split( "-" ).reverse().join( "/" )}`;
    titleH1.className = "lead subtitle";

    const chartOptions = {
        width: CHART_WIDTH,
        height: CHART_HIGHT,
        chartArea: { width: '50%' },

        hAxis: {
            title: 'Date'
        },
    };


    chartOptions.series = {
        // Gives each series an axis name that matches the Y-axis below.
        0: { axis: 'nuovi' },
        1: { axis: 'totale' }
    };
    chartOptions.axes = {
        // Adds labels to each axis; they don't have to match the axis names.
        y: {
            nuovi: { label: 'Nuovi' },
            totale: { label: 'Totale' }
        }
    }
    chartOptions.legend = { position: 'none' }

    chartOptions.colors = [ '#0012F2', '#F012F2' ];

    dataTag = 'comuni'
    draw( "Totale positivi. Dati APSS",
        fillDatesTable( dataTag, casesList, 2 ), dataTag, chartOptions );

    chartOptions.colors = [ '#c21212', '#c28212' ];
    dataTag = 'comuni_deceduti'
    draw( "Deceduti. Dati APSS",
        fillDatesTable( dataTag, deadsList, 2 ), dataTag, chartOptions );

}

function handleOptions () {
    google.charts.setOnLoadCallback( drawChartComuni );

}

let comune = document.querySelector( "#comune" );
comune.addEventListener( "change", handleOptions, false );