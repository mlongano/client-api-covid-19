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

const elementsNazionali = {
    nazOspMva: document.querySelector( "#nazOspMva" ),
    nazOspSpan: document.querySelector( "#nazOspSpan" ),
    nazIntMva: document.querySelector( "#nazIntMva" ),
    nazIntSpan: document.querySelector( "#nazIntSpan" ),
    nazDecMva: document.querySelector( "#nazDecMva" ),
    nazDecSpan: document.querySelector( "#nazDecSpan" ),
    nazGuaMva: document.querySelector( "#nazGuaMva" ),
    nazGuaSpan: document.querySelector( "#nazGuaSpan" ),
    nazTamMva: document.querySelector( "#nazTamMva" ),
    nazTamSpan: document.querySelector( "#nazTamSpan" ),
    nazPosMva: document.querySelector( "#nazPosMva" ),
    nazPosSpan: document.querySelector( "#nazPosSpan" ),
};
for ( let el in elementsNazionali ) {
    elementsNazionali[ el ].addEventListener( "change", handleItalyCharts, false );
}


const elementsTrentino = {

    trentOspMva: document.querySelector( "input[type='checkbox'][data-type='ospedalizzati']" ),
    trentOspSpan: document.querySelector( "input[type='number'][data-type='ospedalizzati']" ),
    trentIntMva: document.querySelector( "#trentIntMva" ),
    trentIntSpan: document.querySelector( "#trentIntSpan" ),
    trentDecMva: document.querySelector( "#trentDecMva" ),
    trentDecSpan: document.querySelector( "#trentDecSpan" ),
    trentGuaMva: document.querySelector( "#trentGuaMva" ),
    trentGuaSpan: document.querySelector( "#trentGuaSpan" ),
    trentPosMva: document.querySelector( "#trentPosMva" ),
    trentPosSpan: document.querySelector( "#trentPosSpan" ),
};
for ( let el in elementsTrentino ) {
    elementsTrentino[ el ].addEventListener( "change", handleTrentinoCharts, false );
}


//return fetch( "https://coronavirus-tracker-api.herokuapp.com/all" );
const urlDataItaly = "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json";

//google.charts.load( 'current', { 'packages': [ 'corechart' ] } );
google.charts.load( 'current', { 'packages': [ 'corechart', 'line' ] } );

google.charts.setOnLoadCallback( () => drawChartItaly() );
google.charts.setOnLoadCallback( drawChartTrentino );
//google.charts.setOnLoadCallback( drawChartComuni );

function draw ( title, data, element, options, readyHandler = ( () => { } ) ) {
    options.title = title;
    const chartMaterial = new google.charts.Line( document.getElementById( element ) );
    //chart.draw( data, options );
    google.visualization.events.addListener( chartMaterial, 'ready', readyHandler );

    chartMaterial.draw( data, google.charts.Line.convertOptions( options ) );
}

function draw1 ( title, data, element, options, readyHandler = ( () => { } ) ) {
    options.title = title;
    const chartMaterial = new google.charts.Line( document.getElementById( element ) );
    //chart.draw( data, options );
    google.visualization.events.addListener( chartMaterial, 'ready', readyHandler );

    chartMaterial.draw( data, google.charts.Line.convertOptions( options ) );
}


function handleChartReady ( elementId ) {
    let titles = document.querySelectorAll( "#" + elementId + " svg defs+g rect+text" );
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
    console.log( "Italia json:", json );
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
    let ultimiPositivi = json[ 0 ].nuovi_positivi;
    let ultimiDeceduti = json[ 0 ].deceduti;
    let ultimiGuariti = json[ 0 ].dimessi_guariti;
    let ultimiTamponi = json[ 0 ].tamponi;
    let ultimiTerapia = json[ 0 ].terapia_intensiva;
    let ultimiOspedalizzati = json[ 0 ].totale_ospedalizzati;
    let lastDateTime;
    for ( daily of json ) {
        lastDateTime = daily.data;
        let date = daily.data.split( " " )[ 0 ];
        //console.log( date );
        let ratio = daily.nuovi_positivi / ultimiPositivi;
        ultimiPositivi = daily.nuovi_positivi;
        //console.log( daily );
        last = new Date( date );
        ratios.push( [ last, ratio ] );
        let tc = 0;
        if ( daily.totale_positivi instanceof String ) {
            tc = parseInt( daily.totale_positivi );
        } else {
            tc = daily.totale_positivi;
        };

        positivi.push( [ last, daily.nuovi_positivi, tc ] );

        ospedalizzati.push( [ last, daily.totale_ospedalizzati - ultimiOspedalizzati, daily.totale_ospedalizzati ] );
        ultimiOspedalizzati = daily.totale_ospedalizzati;

        terapia_intensiva.push( [ last, daily.terapia_intensiva - ultimiTerapia, daily.terapia_intensiva ] );
        ultimiTerapia = daily.terapia_intensiva;

        deceduti.push( [ last, daily.deceduti - ultimiDeceduti, daily.deceduti ] );
        ultimiDeceduti = daily.deceduti;

        dimessi_guariti.push( [ last, parseInt( daily.dimessi_guariti ) - ultimiGuariti, parseInt( daily.dimessi_guariti ) ] );
        ultimiGuariti = daily.dimessi_guariti;

        tamponi.push( [ last, daily.tamponi - ultimiTamponi, daily.tamponi ] );
        ultimiTamponi = daily.tamponi;
    }
    //console.log( "Italia deceduti:", deceduti);
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

function fillDatesTable1 ( types, titles, series ) {
    let table = new google.visualization.DataTable();
    table.addColumn( types[ 0 ], titles[ 0 ] );
    for (let index = 1; index < types.length; index++) {
        table.addColumn( types[ index ], titles[ index ] );
    }
    table.addRows( series );
    return table;
}

function fillDatesTable ( titles, list, useMva = false, span = 3 ) {
    let table = new google.visualization.DataTable();
    table.addColumn( 'date', 'Data' );
    for ( title of titles ) {
        table.addColumn( 'number', title );
    }

    if ( useMva ) {
        let date = list.map( d => d[ 0 ] );
        let columns = [];
        let newList = [];
        for ( let i = 1; i < list[ 0 ].length; i++ ) {
            columns[ i - 1 ] = mva( list.map( d => d[ i ] ), span );
        }
        let values = [];
        for ( let i = 0; i < list.length; i++ ) {
            let row = []
            for ( let k = 1; k < list[ 0 ].length; k++ ) {
                row.push( columns[ k - 1 ][ i ] );
            }
            values.push( row );
        }
        for ( let i = 0; i < list.length; i++ ) {
            newList.push( [ date[ i ], ...values[ i ] ] );
        }
        list = newList;
    }

    table.addRows( list );
    return table;
}

async function drawChartItaly ( {
    nazOspMva = false,
    nazOspSpan = 3,
    nazIntMva = false,
    nazIntSpan = 3,
    nazDecMva = false,
    nazDecSpan = 3,
    nazGuaMva = false,
    nazGuaSpan = 3,
    nazTamMva = false,
    nazTamSpan = 3,
    nazPosMva = false,
    nazPosSpan = 3,
} = {} ) {
    let res = await fetch( urlDataItaly );
    let json = await res.json();
    let dataTag;
    let data = extractInfo( json );
    let header = document.querySelector( '#head-nazionali' );
    let titleH1 = document.querySelector( '#head-nazionali > p' );
    titleH1.textContent = `Ultimo aggiornamento ${data.date.split( "T" )[ 0 ].split( "-" ).reverse().join( "/" )}`;
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
    draw( "Ospedalizzati", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], nazOspMva, nazOspSpan ), dataTag, chartOptions, () => handleChartReady( 'ospedalizzati' ) );

    chartOptions.colors = [ '#FFAE25', '#C88005' ];
    dataTag = 'terapia_intensiva';
    draw( "In terapia intensiva", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], nazIntMva, nazIntSpan ), dataTag, chartOptions, () => handleChartReady( 'terapia_intensiva' ) );

    chartOptions.colors = [ '#e80e0e', '#B50000' ];
    dataTag = 'deceduti';
    draw( "Deceduti", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], nazDecMva, nazDecSpan ), dataTag, chartOptions, () => handleChartReady( 'deceduti' ) );

    chartOptions.colors = [ '#55e57c', '#0f3b1b' ];
    dataTag = 'dimessi_guariti';
    draw( "Dimessi guariti", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], nazGuaMva, nazGuaSpan ), dataTag, chartOptions, () => handleChartReady( 'dimessi_guariti' ) );


    chartOptions.colors = [ '#0012F2', '#0082F2' ];
    dataTag = 'tamponi';
    draw( "Tamponi", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], nazTamMva, nazTamSpan ), dataTag, chartOptions, () => handleChartReady( 'tamponi' ) );

    chartOptions.colors = [ '#976393', '#685489' ];
    dataTag = 'positivi';
    draw( "Positivi", fillDatesTable( [ "Incremento", "Totale" ], data[ dataTag ], nazPosMva, nazPosSpan ), dataTag, chartOptions, () => handleChartReady( 'positivi' ) );

}

async function drawChartTrentino ( {
    trentOspMva = false,
    trentOspSpan = 3,
    trentIntMva = false,
    trentIntSpan = 3,
    trentDecMva = false,
    trentDecSpan = 3,
    trentGuaMva = false,
    trentGuaSpan = 3,
    trentPosMva = false,
    trentPosSpan = 3,
} = {} ) {
    //let res = await fetch( urlsDataTrentino.urlandamentocasi );
    //let csvString = await res.text();
    //const json = await csv().fromString( csvString );
    //console.log( json );
    let res = await fetch( urlsDataTrentino.urlstatoclinico );
    let csvString = await res.text();
    const json = await csv().fromString( csvString );
    console.log( "Trentino", json );

    let terapia_intensiva = [];
    let deceduti = [];
    let guariti = [];
    let ospedalizzati = [];
    let positivi = [];

    let beforeDaily = Infinity;
    let date;

    let ultimiDeceduti = 0;
    let ultimiGuariti = 0;
    let ultimiTerapia = 0;
    let ultimiOspedalizzati = 0;

    for ( daily of json ) {
        date = new Date( daily.giorno.split( "/" ).reverse().join( "-" ) );
        let nuovi_positivi = parseInt( daily.incremento );
        let ratio = nuovi_positivi / beforeDaily;
        beforeDaily = nuovi_positivi;

        let inf = parseInt( daily.infettive );
        let alta = parseInt( daily.alta_int );
        let inte = parseInt( daily.terapia_in );
        let tot = inf + alta + inte;
        let terap = alta + inte;

        positivi.push( [ date, parseInt( daily.incremento ), parseInt( daily.pos_att ) ] );

        ospedalizzati.push( [ date, tot - ultimiOspedalizzati, tot ] );
        ultimiOspedalizzati = tot;

        terapia_intensiva.push( [ date, terap - ultimiTerapia, terap ] );
        ultimiTerapia = terap;

        deceduti.push( [ date, parseInt( daily.deceduti ) - ultimiDeceduti, parseInt( daily.deceduti ) ] );
        ultimiDeceduti = parseInt( daily.deceduti );

        guariti.push( [ date, parseInt( daily.guariti ) - ultimiGuariti, parseInt( daily.guariti ) ] );
        ultimiGuariti = parseInt( daily.guariti );

    }

    //console.log( "Trentino", "nuovi dec.", deceduti );

    let header = document.querySelector( '#head-trentino' );
    let titleH1 = document.querySelector( '#head-trentino > p' );
    titleH1.textContent = `Ultimo aggiornamento ${date.toISOString().split( "T" )[ 0 ].split( "-" ).reverse().join( "/" )}`;
    titleH1.className = "lead subtitle";

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
        fillDatesTable( [ "Incremento", "Totale" ], ospedalizzati, trentOspMva, trentOspSpan ), dataTag, chartOptions, () => handleChartReady( 'ospedalizzati_trentino' ) );

    chartOptions.colors = [ '#FFAE25', '#C88005' ];
    dataTag = 'terapia_intensiva_trentino'
    draw( "   In terapia intensiva/alta intensità. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], terapia_intensiva, trentIntMva, trentIntSpan ), dataTag, chartOptions, () => handleChartReady( 'terapia_intensiva_trentino' ) );

    chartOptions.colors = [ '#e80e0e', '#B50000' ];
    dataTag = 'deceduti_trentino'
    draw( "Deceduti. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], deceduti, trentDecMva, trentDecSpan ), dataTag, chartOptions, () => handleChartReady( 'deceduti_trentino' ) );

    chartOptions.colors = [ '#55e57c', '#0f3b1b' ];
    dataTag = 'guariti_trentino'
    draw( "Guariti. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], guariti, trentGuaMva, trentGuaSpan ), dataTag, chartOptions, () => handleChartReady( 'guariti_trentino' ) );

    chartOptions.colors = [ '#976393', '#685489' ];
    dataTag = 'positivi_trentino';
    draw( "Positivi. Dati APSS", fillDatesTable( [ "Incremento", "Totale" ], positivi, trentPosMva, trentPosSpan ), dataTag, chartOptions, () => handleChartReady( 'positivi_trentino' ) );

}



/**
 * @param  { Chart } `chart` Chart object containing all the information for drawing the chart.
 * @param  {String} `htmlElement` element.
 * @return { Null }
 * @api public
 */
function drawChart (chart, htmlElement) {
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
            title: chart.timeSeriesLabels[ 0 ],
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
            nuovi: { label: chart.timeSeriesLabels[ 1 ] },
            totale: { label: chart.timeSeriesLabels[ 2 ] }
        }
    }
    chartOptions.legend = { position: 'none' }
    chartOptions.colors = chart.timeSeriesColors;
    draw( chart.title,
        fillDatesTable1(chart.timeSeriesTypes, chart.timeSeriesLabels,  chart.timeSeries), htmlElement, chartOptions, () => handleChartReady( htmlElement ) );
}


async function drawChartComuni ( selected, {
    decedutiMva = false,
    decedutiSpan = 3,
    guaritiMva = false,
    guaritiSpan = 3,
    positiviMva = false,
    positiviSpan = 3,
} = {}
) {
    let res = await fetch( window.location.origin + "/cov19-trentino.json" );
    let json = await res.json();
    const COMUNE = selected || "ROVERETO";
    let ratioList = [];
    let casesList = [];
    let deadsList = [];
    let healedList = [];
    let before = 0;
    let data = json[ 0 ].cov19_data;
    data = Array.from( data );
    data.shift();
    let beforeDaily = 1;
    let deads = 0;
    let healed = 0;
    let date;
    let idx;
    for ( day of json ) {
        date = new Date( day.date );
        data = day.cov19_data;
        //console.log(COMUNE,"Dati:",  data);

        if ( data[ 0 ][ 0 ] === "Lat" ) {
            idx = 3;
        } else if ( data[ 0 ][ 0 ] === "codice" ) {
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

            let lastHealed = cases[ idx + 1 ];
            healedList.push( [ date, parseInt( lastHealed ) - parseInt( healed ), parseInt( lastHealed ) ] );
            healed = lastHealed;

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

    chartOptions.colors = [ '#e80e0e', '#B50000' ];
    dataTag = 'deceduti_comuni'
    draw( "Deceduti. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], deadsList, decedutiMva, decedutiSpan ), dataTag, chartOptions, () => handleChartReady( 'deceduti_comuni' ) );

    chartOptions.colors = [ '#55e57c', '#0f3b1b' ];
    dataTag = 'guariti_comuni'
    draw( "Guariti. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], healedList, guaritiMva, guaritiSpan ), dataTag, chartOptions, () => handleChartReady( 'guariti_comuni' ) );


    chartOptions.colors = [ '#976393', '#685489' ];
    dataTag = 'positivi_comuni'
    draw( "Totale positivi. Dati APSS",
        fillDatesTable( [ "Incremento", "Totale" ], casesList, positiviMva, positiviSpan ), dataTag, chartOptions, () => handleChartReady( 'positivi_comuni' ) );

}

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
addLink( "#head-trentino h1", "https://covid19trentino.fbk.eu" );

function handleItalyCharts () {
    google.charts.setOnLoadCallback( () => drawChartItaly( {
        nazOspMva: elementsNazionali.nazOspMva.checked,
        nazOspSpan: parseInt( elementsNazionali.nazOspSpan.value ),
        nazIntMva: elementsNazionali.nazIntMva.checked,
        nazIntSpan: parseInt( elementsNazionali.nazIntSpan.value ),
        nazDecMva: elementsNazionali.nazDecMva.checked,
        nazDecSpan: parseInt( elementsNazionali.nazDecSpan.value ),
        nazGuaMva: elementsNazionali.nazGuaMva.checked,
        nazGuaSpan: parseInt( elementsNazionali.nazGuaSpan.value ),
        nazTamMva: elementsNazionali.nazTamMva.checked,
        nazTamSpan: parseInt( elementsNazionali.nazTamSpan.value ),
        nazPosMva: elementsNazionali.nazPosMva.checked,
        nazPosSpan: parseInt( elementsNazionali.nazPosSpan.value ),
    } ) );
}

function handleTrentinoCharts () {
    google.charts.setOnLoadCallback( () => drawChartTrentino( {
        trentOspMva: elementsTrentino.trentOspMva.checked,
        trentOspSpan: parseInt( elementsTrentino.trentOspSpan.value ),
        trentIntMva: elementsTrentino.trentIntMva.checked,
        trentIntSpan: parseInt( elementsTrentino.trentIntSpan.value ),
        trentDecMva: elementsTrentino.trentDecMva.checked,
        trentDecSpan: parseInt( elementsTrentino.trentDecSpan.value ),
        trentGuaMva: elementsTrentino.trentGuaMva.checked,
        trentGuaSpan: parseInt( elementsTrentino.trentGuaSpan.value ),
        trentPosMva: elementsTrentino.trentPosMva.checked,
        trentPosSpan: parseInt( elementsTrentino.trentPosSpan.value ),
    } ) );
}
