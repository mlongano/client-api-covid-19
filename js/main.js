Vue.component( "v-select", VueSelect.VueSelect );

var app = new Vue( {
    el: '#vue',
    data: {
        selected: null,
        options: [],
        picked: 'm'
    },
    methods: {
        estraiOpzioni ( json, search, vm = this ) {
            let re = new RegExp( search, "i" );

            // prende i dati dell'ultimo giorno, toglie l'intestazione,
            // filtra sul comune in base alla stringa immessa
            // e ritorna la lista delle opzioni {id: codice, comune: nome_comune}
            let match = json[ json.length - 1 ].cov19_data.splice( 1 )
                .filter( ( row ) => {
                    return row[ 1 ].search( re ) > -1;
                } )
                .map( ( row ) => ( { id: row[ 0 ], comune: row[ 1 ] } ) );
            console.log( "VUE", match );
            vm.options = match;
        },

        onSearch ( search, loading ) {
            loading && loading( true );
            this.search( loading, search, this );
        },
        search: _.debounce( ( loading, search, vm ) => {
            /*             if ( !search ) {
                            vm.options = [];
                            loading( false );
                            return;
                        }
             */
            fetch(
                `${window.location.origin}/cov19-trentino.json`
            ).then( res => {
                res.json().then( json => {
                    let re = new RegExp( search, "i" );

                    // prende i dati dell'ultimo giorno, toglie l'intestazione,
                    // filtra sul comune in base alla stringa immessa
                    // e ritorna la lista delle opzioni {id: codice, comune: nome_comune}
                    // gli ultimi dati forniti hanno sono un array con questa struttura:
                    // [
                    //     "codice",
                    //     "nome",
                    //     "contagi",
                    //     "guariti",
                    //     "decessi",
                    //     "aggiornamento",
                    //     "lat",
                    //     "lon"
                    // ]

                    let match = json[ json.length - 1 ].cov19_data.splice( 1 )
                        .filter( ( row ) => {
                            return row[ 1 ].search( re ) > -1;
                        } )
                        .map( ( row ) => ( { id: row[ 0 ], comune: row[ 1 ], text: `${row[ 1 ]} (c:${row[ 2 ]}, m:${row[ 4 ]}, g:${row[ 3 ]})`, c: row[ 2 ], m: row[ 4 ], g: row[ 3 ] } ) );
                    console.log( "VUE", match );
                    match.sort( ( a, b ) => ( parseInt( b[ vm.picked ] ) - parseInt( a[ vm.picked]) ) );
                    vm.options = match;
                } );
                loading && loading( false );
            } );
        }, 350 ),

        drawComuni () {
            google.charts.setOnLoadCallback( () => drawChartComuni( this.selected?.comune ) );
        },
    },

    watch: {
        selected: { handler: 'drawComuni' },
        picked () {this.onSearch( "" )
    },
    },

    created () {
        this.onSearch( "" );
        this.drawComuni();
    },

} )
