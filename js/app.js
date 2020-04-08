const urlsDataTrentino = {
    urlelencocomuni: 'https://covid19trentino.fbk.eu/data/codici_comuni.csv',
    //urlandamentocasi: 'https://covid19trentino.fbk.eu//spreadsheets/d/e/2PACX-1vQdZ7yQhx38EsaR05DRprb0YkaRf5eK6cfrrOGMfFnDKq-P-g8q-HMRv76UnTkoRYvCMrgkQkX-xJOE/pub?gid=0&single=true&output=csv',
    urlstatoclinico: 'https://covid19trentino.fbk.eu/data/stato_clinico_td.csv',
    urlcodicicomuni: "https://covid19trentino.fbk.eu/data/codici_comuni.csv",
    urlsituazionecomuni: 'https://covid19trentino.fbk.eu/data/stato_comuni_td.csv'
};

const CHART_HIGHT = 400;
var CHART_WIDTH = getComputedStyle( document.documentElement )
    .getPropertyValue( '--chart-width' );


//return fetch( "https://coronavirus-tracker-api.herokuapp.com/all" );
const urlDataItaly = "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json";

//google.charts.load( 'current', { 'packages': [ 'corechart' ] } );
google.charts.load( 'current', { 'packages': [ 'corechart', 'line' ] } );

google.charts.setOnLoadCallback( drawChartItaly );
google.charts.setOnLoadCallback( drawChartTrentino );
google.charts.setOnLoadCallback( drawChartComuni );

function draw ( title, data, element, options, readyHandler = ( () => { } ) ) {
    options.title = title;
    const chartMaterial = new google.charts.Line( document.getElementById( element ) );
    //chart.draw( data, options );
    google.visualization.events.addListener( chartMaterial, 'ready', readyHandler );

    chartMaterial.draw( data, google.charts.Line.convertOptions( options ) );
}

function handleChartReady ( elementId ) {
    let titles = document.querySelectorAll( "#"+elementId+" svg defs+g rect+text" );
    let chart = document.querySelector( ".chart" );
    let chartWidth = chart.offsetWidth;

    for ( const title of titles ) {
        let bbox = title.getBBox();
        let width = bbox.width;
        let offset = ( chartWidth - width ) / 2;

        title.setAttribute( "x", offset.toString() );
        title.setAttribute( "y", "25" );
    }
}

function extractInfo ( json ) {
    console.log("Italia json:", json);
    let previous = json[ 0 ].nuovi_positivi;
    let ratios = [];
    let positivi = [];
    let nuovi_positivi = [];
    let terapia_intensiva = [];
    let deceduti = [];
    let tamponi = [];
    let ospedalizzati = [];
    let dimessi_guariti = [];
    let first = new Date( json[ 0 ].data ).getTime() / 86400000 - 18316;
    let last = first;
    let ultimiDeceduti = 0;
    let ultimiGuariti = 0;
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
        if (daily.totale_positivi instanceof String) {
            tc = parseInt( daily.totale_positivi );
        } else {
            tc = daily.totale_positivi;
        };

        positivi.push( [ last, daily.nuovi_positivi, tc ] );

        ospedalizzati.push( [ last, daily.totale_ospedalizzati - ultimiOspedalizzati, daily.totale_ospedalizzati ] );
        ultimiOspedalizzati = daily.totale_ospedalizzati;

        terapia_intensiva.push( [ last, daily.terapia_intensiva - ultimiTerapia, daily.terapia_intensiva  ]);
        ultimiTerapia = daily.terapia_intensiva;

        deceduti.push( [ last, daily.deceduti - ultimiDeceduti, daily.deceduti ] );
        ultimiDeceduti = daily.deceduti;

        dimessi_guariti.push( [ last, parseInt( daily.dimessi_guariti ) - ultimiGuariti, parseInt( daily.dimessi_guariti ) ] );
        ultimiGuariti = daily.dimessi_guariti;

        tamponi.push( [ last, daily.tamponi - ultimiTamponi, daily.tamponi ] );
        ultimiTamponi = daily.tamponi;
    }
    console.log( "Italia deceduti:", deceduti);
    return {
        date: lastDateTime,
        ratios: ratios,
        positivi: positivi,
        terapia_intensiva: terapia_intensiva,
        deceduti: deceduti,
        dimessi_guariti: dimessi_guariti,
        tamponi: tamponi,
        ospedalizzati: ospedalizzati,
    }

}

function fillDatesTable ( titles, list ) {
    let table = new google.visualization.DataTable();
    table.addColumn( 'date', 'Data' );
    for ( title of titles) {
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
        titleTextStyle: {
            color: "#888",
            fontName: 'BlinkMacSystemFont,-apple-system,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif',
            fontSize: 22,
            bold: false,
            italic: false
        },
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
            nuovi: { label: 'Incremento' },
            totale: { label: 'Totale' }
        }
    }
    chartOptions.legend = { position: 'none' }


    chartOptions.colors = [ '#c805b9', '#76056e' ];
    dataTag = 'ospedalizzati';
    draw( "Ospedalizzati", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], 2 ), dataTag, chartOptions, () => handleChartReady( 'ospedalizzati' ) );

    chartOptions.colors = [ '#FFAE25', '#C88005'  ];
    dataTag = 'terapia_intensiva';
    draw( "In terapia intensiva", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], 2 ), dataTag, chartOptions, () => handleChartReady( 'terapia_intensiva' ) );

    chartOptions.colors = [ '#e80e0e',  '#B50000'];
    dataTag = 'deceduti';
    draw( "Deceduti", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], 2 ), dataTag, chartOptions, () => handleChartReady( 'deceduti' ) );

    chartOptions.colors = [ '#55e57c', '#0f3b1b' ];
    dataTag = 'dimessi_guariti';
    draw( "Dimessi guariti", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], 2 ), dataTag, chartOptions, () => handleChartReady( 'dimessi_guariti' ) );


    chartOptions.colors = [ '#0012F2', '#0082F2' ];
    dataTag = 'tamponi';
    draw( "Tamponi", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], 2 ), dataTag, chartOptions, () => handleChartReady( 'tamponi' ) );

    chartOptions.colors = [ '#976393', '#685489' ];
    dataTag = 'positivi';
    draw( "Positivi", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], 2 ), dataTag, chartOptions, () => handleChartReady( 'positivi') );

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
    let guariti = [];
    let ospedalizzati = [];

    let beforeDaily = Infinity;
    let date;

    let ultimiDeceduti = 0;
    let ultimiGuariti = 0;
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

        deceduti.push( [ date, parseInt( daily.deceduti ) - ultimiDeceduti, parseInt( daily.deceduti ) ] );
        ultimiDeceduti = parseInt( daily.deceduti );

        guariti.push( [ date, parseInt( daily.guariti ) - ultimiDeceduti, parseInt( daily.guariti ) ] );
        ultimiGuariti = parseInt( daily.guariti );
    }

    console.log( "Trentino", "nuovi dec.", deceduti );

    let header = document.querySelector( '#head-trentino' );
    let titleH1 = document.createElement( 'p' );
    titleH1.textContent = `Ultimo aggiornamento ${date.toISOString().split( "T" )[ 0 ].split( "-" ).reverse().join( "/" )}`;
    titleH1.className = "lead subtitle";
    header.appendChild( titleH1 );

    const chartOptions = {
        titleTextStyle: {
            color: "#888",
            fontName: 'BlinkMacSystemFont,-apple-system,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif',
            fontSize: 22,
            bold: false,
            italic: false
        },
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
            nuovi: { label: 'Incremento' },
            totale: { label: 'Totale' }
        }
    }
    chartOptions.legend = { position: 'none' }

    chartOptions.colors = [ '#c805b9', '#76056e' ];
    dataTag = 'ospedalizzati_trentino'
    draw( "   Ospedalizzati. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], ospedalizzati, 2 ), dataTag, chartOptions, () => handleChartReady( 'ospedalizzati_trentino' ) );

    chartOptions.colors = [ '#FFAE25', '#C88005' ];
    dataTag = 'terapia_intensiva_trentino'
    draw( "   In terapia intensiva/alta intensità. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], terapia_intensiva, 2 ), dataTag, chartOptions, () => handleChartReady( 'terapia_intensiva_trentino' ) );

    chartOptions.colors = [ '#e80e0e', '#B50000' ];
    dataTag = 'deceduti_trentino'
    draw( "Deceduti. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], deceduti, 2 ), dataTag, chartOptions, () => handleChartReady( 'deceduti_trentino' ) );

    chartOptions.colors = [ '#55e57c', '#0f3b1b' ];
    dataTag = 'guariti_trentino'
    draw( "Guariti. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], guariti, 2 ), dataTag, chartOptions, () => handleChartReady( 'guariti_trentino' ) );
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
        titlePosition: "out",
        titleTextStyle: {
            color: "#888",
            fontName: 'BlinkMacSystemFont,-apple-system,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif',
            fontSize: 22,
            bold: false,
            italic: false
        },
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
            nuovi: { label: 'Incremento' },
            totale: { label: 'Totale' }
        }
    }
    chartOptions.legend = { position: 'none' }

    chartOptions.colors = [ '#976393', '#685489' ];
    dataTag = 'comuni'
    draw( "Totale positivi. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], casesList, 2 ), dataTag, chartOptions, () => handleChartReady( 'comuni' ) );

    chartOptions.colors = [ '#e80e0e', '#B50000' ];
    dataTag = 'comuni_deceduti'
    draw( "Deceduti. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], deadsList, 2 ), dataTag, chartOptions, () => handleChartReady( 'comuni_deceduti' ) );

}

function handleOptions () {
    google.charts.setOnLoadCallback( drawChartComuni );

}

let comune = document.querySelector( "#comune" );
comune.addEventListener( "change", handleOptions, false );

function isMobileDevice () {
    return ( typeof window.orientation !== "undefined" ) || ( navigator.userAgent.indexOf( 'IEMobile' ) !== -1 );
};

// http://arcg.is/C1unv (versione desktop) e http://arcg.is/081a51 (versione mobile)

function addLink ( selector, linkDesktop, linkMobile = "" ) {

    let title = document.querySelector( selector );
    let titleText = title.firstChild;
    let link = document.createElement( 'a' );
    console.log( title.firstChild );

    linkMobile = linkMobile || linkDesktop;
    link.href = isMobileDevice() ? linkMobile : linkDesktop;
    link.target = "_blank"
    link.textContent = titleText.textContent;
    title.replaceChild( link, titleText );
    console.log( title.firstChild );
}

addLink( "#head-nazionali h1", "http://arcg.is/C1unv", "http://arcg.is/081a51" );
addLink( "#head-trentino h1", "https://covid19trentino.fbk.eu");