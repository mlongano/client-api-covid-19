Vue.component( "v-select", VueSelect.VueSelect );

var app = new Vue( {
    el: '#vue',
    data: {
        dataUrl: `${window.location.origin}/cov19-trentino.json`,
        json: null,
        selected: null,
        options: [],
        picked: 'm'
    },
    methods: {
        estraiOpzioni ( json, search, vm ) {
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
            let last = [...json[ json.length - 1 ].cov19_data];
            let match = last.splice( 1 )
                .filter( ( row ) => {
                    return row[ 1 ].search( re ) > -1;
                } )
                .map( ( row ) => ( { id: row[ 0 ], comune: row[ 1 ], text: `${row[ 1 ]} (c:${row[ 2 ]}, m:${row[ 4 ]}, g:${row[ 3 ]})`, c: row[ 2 ], m: row[ 4 ], g: row[ 3 ] } ) );
            console.log( "VUE", match );
            return match.sort( ( a, b ) => ( parseInt( b[ vm.picked ] ) - parseInt( a[ vm.picked ] ) ) );
        },

        onSearch ( search, loading ) {
            loading && loading( true );
            this.search( loading, search, this );
        },
        search: _.debounce( ( loading, search, vm ) => {
            vm.options = vm.estraiOpzioni( vm.json, search, vm );
            loading && loading( false );
        }, 350 ),

        drawComuni () {
            google.charts.setOnLoadCallback( () => drawChartComuni( this.selected?.comune ) );
        },
    },

    watch: {
        selected: { handler: 'drawComuni' },
        picked () {
            this.onSearch( "" )
        },
    },

    created () {
        fetch(
            this.dataUrl
        )
            .then( res => res.json())
            .then( json => {
                this.json = json;
                this.selected = this.estraiOpzioni( json, "ROVERETO", this )[ 0 ];
                this.options = this.estraiOpzioni( json, "", this );
            });
        this.drawComuni();
    },

} )
