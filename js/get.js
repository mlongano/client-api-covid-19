const request = require( 'request' );
const CSV = require( 'csv-string' );
const fs = require( 'fs' );
const cheerio = require( 'cheerio' );
const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;
const csv = require( 'csvtojson' )
const fetch = require( 'node-fetch' );


const oldLinks = [
    'https://datawrapper.dwcdn.net/tvzAQ/4/', // 11 marzo 2020 ore 12:00
    'https://datawrapper.dwcdn.net/qXJwB/7/', // 12 marzo 2020 ore 12:00
    'https://datawrapper.dwcdn.net/HXYZC/2/', // 13 marzo 2020 ore 12:00
    'https://datawrapper.dwcdn.net/57bYc/7/', // 14 marzo 2020 ore 12:00
    'https://datawrapper.dwcdn.net/KTWii/1/', // 16 marzo 2020 ore 12:00
    'https://datawrapper.dwcdn.net/xY8kZ/1/', // 17 marzo 2020 ore 12:00
    'https://datawrapper.dwcdn.net/oyFMH/1/'  // 18 marzo 2020 ore 12:00
];

const dataTrentino = {
    urlelencocomuni: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSoP79r_KG6CSuIF6Woik3c8o54B_K8EPDYgI_zpPehuYydjNztNzLAPqGwpAoHn6uGLE2_J7zy1Lwa/pub?gid=1484863998&single=true&output=csv',
    urlandamentocasi: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQdZ7yQhx38EsaR05DRprb0YkaRf5eK6cfrrOGMfFnDKq-P-g8q-HMRv76UnTkoRYvCMrgkQkX-xJOE/pub?gid=0&single=true&output=csv',
    urlstatoclinico: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQdZ7yQhx38EsaR05DRprb0YkaRf5eK6cfrrOGMfFnDKq-P-g8q-HMRv76UnTkoRYvCMrgkQkX-xJOE/pub?gid=1231542924&single=true&output=csv',
    urlcodicicomuni: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQdZ7yQhx38EsaR05DRprb0YkaRf5eK6cfrrOGMfFnDKq-P-g8q-HMRv76UnTkoRYvCMrgkQkX-xJOE/pub?gid=1576237135&single=true&output=csv",
    urlsituazionecomuni: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSoP79r_KG6CSuIF6Woik3c8o54B_K8EPDYgI_zpPehuYydjNztNzLAPqGwpAoHn6uGLE2_J7zy1Lwa/pub?gid=1484863998&single=true&output=csv'
};

function getLatestData () {
    request( 'https://www.apss.tn.it/-/covid19', ( err, res, body ) => {
        if ( err ) { return console.log( err ); }
        const $ = cheerio.load( res.body );
        let link = $( 'u>a' )[ 0 ].attribs.href;
        console.log( `Latest data from url: ${link}` );
        link = "https://covid19trentino.fbk.eu/#datixcomune";
        getData( link );
    } );
}

function getAllLinks ( links ) {
    for ( const link of links ) {
        getData( link );
    }
}

function getData ( link ) {
    request( link, ( err, res, body ) => {
        if ( err ) { return console.log( err ); }
        const $ = cheerio.load( res.body );
        const dataPath = 'cov19-trentino.json'
        const linksPath = 'cov19-trentino-links.json'

        const dom = new JSDOM( res.body );


        // Get the date from the intro of the graph page
        // let date = $( 'p.chart-intro' )[ 0 ].children[ 0 ].data;

        // // Get rid of the text that dosen't contain date information
        // date = date.replace( 'Aggiornamento: ', '' );
        // date = date.replace( 'ore ', '' );
        let date = $( 'oggi' ).children[ 0 ].data;
        date = new Date( date );
        console.log(`Date: ${date}`);

        saveJson( linksPath, { date: date, url: link } );

        // Searching for the data in the page
        let embededData = $( 'script' )[ 12 ].children[ 0 ].data;
        const regex = /(chartData: ")(.*)(",)/;
        let m, data;
        if ( ( m = regex.exec( embededData ) ) !== null ) {
            let res = m[ 2 ].replace( /\\n/g, "\n" );
            data = CSV.parse( res, ";" );
            //console.log(data);
        }
        // In the hope we find it save the data
        saveJson( dataPath, { date: date, url: link, cov19_data: data } );
    } );
}

function saveJson ( path, json ) {
    let data;
    try {
        if ( fs.existsSync( path ) ) {
            // if the file already exists extract the data and back up it
            let content = fs.readFileSync( path, 'utf8' );
            data = JSON.parse( content );
            fs.writeFileSync( path + '.bkup', content );
            // be aware that the dates stored in date are strings and in json the date is an instance of Date

            let result = data.find( ( { date } ) => date === json.date.toISOString() );
            if ( !result ) {
                data.push( json );
                console.log( `Adding data of ${json.date} to the file ${path}. Total number of items: ${data.length}` );
            }
            // trying to normalize how the dates are stored (all strings)
            data = JSON.parse( JSON.stringify( data ) );

            // hopefully the dates are all strings in the ISO format and sorting them as strings is correct
            data.sort( compareValues( 'date' ) );

        } else {
            data = [ json ];
        }
        fs.writeFileSync( path, JSON.stringify( data ) );
    } catch ( err ) {
        console.error( err.message, `Content of file ${path} is invalid` );
    }
}

/// UTILS

function compareValues ( key, order = 'asc' ) {
    return function innerSort ( a, b ) {
        if ( !a.hasOwnProperty( key ) || !b.hasOwnProperty( key ) ) {
            // property doesn't exist on either object
            return 0;
        }

        const varA = ( typeof a[ key ] === 'string' )
            ? a[ key ].toUpperCase() : a[ key ];
        const varB = ( typeof b[ key ] === 'string' )
            ? b[ key ].toUpperCase() : b[ key ];

        let comparison = 0;
        if ( varA > varB ) {
            comparison = 1;
        } else if ( varA < varB ) {
            comparison = -1;
        }
        return (
            ( order === 'desc' ) ? ( comparison * -1 ) : comparison
        );
    };
}


async function getNewData () {
    const dataPath = 'cov19-trentino.json'
    const linksPath = 'cov19-trentino-links.json'

    let res = await fetch( dataTrentino.urlandamentocasi );
    let csvString = await res.text();
    let jsonAndamento = await csv().fromString( csvString );
    let lastDateStr = jsonAndamento[ jsonAndamento.length - 1 ].data;
    let lastDate = new Date( lastDateStr.split( "/" ).reverse().join( "-" ) );
    let lastConfirmed = parseInt( jsonAndamento[ jsonAndamento.length - 1 ].cumulete );

    console.log( lastDate, lastConfirmed );


    res = await fetch( dataTrentino.urlsituazionecomuni );
    csvString = await res.text();
    //let json = await csv().fromString( csvString );
    let json = CSV.parse( csvString, "," );
    console.log(json);

    //let total = json.reduce( ( accumulator, currentValue ) => accumulator + parseInt( currentValue[ 'NR CASI' ] ), 0 );
    let total = json.reduce( ( accumulator, currentValue ) => {
        let n = parseInt( currentValue[ 1 ] );
        return accumulator + (n ? n : 0);
    }, 0 );
    console.log( total );
    if ( lastConfirmed == total ) {
        saveJson( linksPath, { date: lastDate, url: dataTrentino.urlsituazionecomuni } );
        saveJson( dataPath, { date: lastDate, url: dataTrentino.urlsituazionecomuni, cov19_data: json } );
    }

}


// Main
//getAllLinks( oldLinks );
getNewData();