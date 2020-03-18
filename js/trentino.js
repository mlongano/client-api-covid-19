fetch( 'https://datawrapper.dwcdn.net/57bYc/7/' )
    .then( function ( response ) {
        // When the page is loaded convert it to text
        return response.text()
    } )
    .then( function ( html ) {
        // Initialize the DOM parser
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString( html, "text/html" );

        // You can now even select part of that html as you would in the regular DOM
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;

        let t = ( doc.querySelectorAll( 'script' )[ 11 ].text.split( ";" )[ 1 ].split( "=" )[ 1 ] );
        console.log( t );
        console.log(doc);
    } )
    .catch( function ( err ) {
        console.log( 'Failed to fetch page: ', err );
    } );
