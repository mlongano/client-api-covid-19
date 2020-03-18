const request = require( 'request' );
const CSV = require( 'csv-string' );
const fs = require( 'fs' );
const cheerio = require( 'cheerio' );
// old links 'https://datawrapper.dwcdn.net/57bYc/7/'

request( 'https://www.apss.tn.it/-/covid19', ( err, res, body ) => {
    if ( err ) { return console.log( err ); }
    const $ = cheerio.load( res.body );
    let link = $( 'u>a' )[ 0 ].attribs.href;
    //link = 'https://datawrapper.dwcdn.net/57bYc/7/';
    console.log( link );
    getData( link );
} );

function getData ( link ) {
    request( link, ( err, res, body ) => {
        if ( err ) { return console.log( err ); }
        const $ = cheerio.load( res.body );


        let date = $( 'p.chart-intro' )[ 0 ].children[ 0 ].data;
        //date = date.split( ":" )[ 1 ].split( " " );
        date = date.replace( 'Aggiornamento: ', '' );
        date = date.replace( 'ore ', '' );
        date = new Date(date);
        let embededData = $( 'script' )[ 12 ].children[ 0 ].data;
        const regex = /(chartData: ")(.*)(",)/;
        let m, data;
        if ( ( m = regex.exec( embededData ) ) !== null ) {
            let res = m[ 2 ].replace( /\\n/g, "\n" );
            data = CSV.parse( res, ";" );
            //console.log(data);
        }
        let json = { date: date, cov19_data: data } ;

        const path = 'cov19-trentino.json'
        let oldData;
        try {
            if ( fs.existsSync( path ) ) {
                let content = fs.readFileSync( path, 'utf8' );
                fs.writeFileSync( path+'.bkup', content);

                data = JSON.parse( content );
                let d = new Date( '2020-03-18T11:00:00.000Z');
                //console.log(data);
                let result = data.find( ( { date } ) => {
                    console.log( date === json.date.toISOString());
                    return date === json.date.toISOString();
                } );
                if ( !result ) {
                    data.push( json );
                    console.log( data.length );
                }
                data = JSON.parse( JSON.stringify( data ) );
                data.sort( compareValues( 'date' ) );
            } else {
                data = [ json ];
            }
            fs.writeFileSync( path, JSON.stringify(data) );
        } catch ( err ) {
            console.error( err.message, `Content of file ${path} is invalid` );
        }



    } );

}
    //console.log(a);



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
