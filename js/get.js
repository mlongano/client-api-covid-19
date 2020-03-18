const request = require( 'request' );
const CSV = require( 'csv-string' );
const fs = require( 'fs' );

request( 'https://datawrapper.dwcdn.net/57bYc/7/', ( err, res, body ) => {
    if ( err ) { return console.log( err ); }
    const cheerio = require( 'cheerio' );
    const $ = cheerio.load( res.body );


    //console.log( $( 'script' )[ 12 ].children[ 0 ].data );
    var str = $( 'script' )[ 12 ].children[ 0 ].data;
    const regex = /(chartData: ")(.*)(",)/;
    let m, data;
    if ( ( m = regex.exec( str ) ) !== null ) {
        let res = m[ 2 ].replace( /\\n/g, "\n" );
        data = CSV.parse( res, ";" );
        //console.log(data);
    }
    let now = new Date();
    let json = JSON.stringify( { date: now, cov19_data: data } );

    const path = '../cov19-trentino.json'
    let oldData;
    try {
        if ( fs.existsSync( path ) ) {
            let content = fs.readFileSync( path, 'utf8' );
            
        }
    } catch ( err ) {
        console.error( err )
    }



} );


    //console.log(a);
