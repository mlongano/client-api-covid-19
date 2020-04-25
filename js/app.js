const urlsDataTrentino = {
    urlelencocomuni: 'https://covid19trentino.fbk.eu/data/codici_comuni.csv',
    //urlandamentocasi: 'https://covid19trentino.fbk.eu//spreadsheets/d/e/2PACX-1vQdZ7yQhx38EsaR05DRprb0YkaRf5eK6cfrrOGMfFnDKq-P-g8q-HMRv76UnTkoRYvCMrgkQkX-xJOE/pub?gid=0&single=true&output=csv',
    urlstatoclinico: 'https://covid19trentino.fbk.eu/data/stato_clinico_td.csv',
    urlcodicicomuni: "https://covid19trentino.fbk.eu/data/codici_comuni.csv",
    urlsituazionecomuni: 'https://covid19trentino.fbk.eu/data/stato_comuni_td.csv'
};

const urlDataItaly = "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json";

const CHART_HIGHT = 400;
var CHART_WIDTH = getComputedStyle( document.documentElement )
    .getPropertyValue( '--chart-width' );

google.charts.load( 'current', { 'packages': [ 'corechart', 'line' ] } );

function draw ( title, data, element, options, readyHandler = ( () => { } ) ) {
    options.title = title;
    const chartMaterial = new google.charts.Line( document.getElementById( element ) );
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

function fillDatesTable ( types, titles, series ) {
    let table = new google.visualization.DataTable();
    table.addColumn( types[ 0 ], titles[ 0 ] );
    for (let index = 1; index < types.length; index++) {
        table.addColumn( types[ index ], titles[ index ] );
    }
    table.addRows( series );
    return table;
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
        fillDatesTable(chart.timeSeriesTypes, chart.timeSeriesLabels,  chart.timeSeries), htmlElement, chartOptions, () => handleChartReady( htmlElement ) );
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