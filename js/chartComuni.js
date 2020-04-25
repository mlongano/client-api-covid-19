function loadComuniFactory ( url ) {

    let isComuniLoaded = false;
    let jsonComuni = {};

    return async function () {
        if ( isComuniLoaded ) {
            return jsonComuni;
        }
        let res = await fetch( url );
        jsonComuni = await res.json();
        isComuniLoaded = true;
        return jsonComuni;
    }
}
Vue.use( AsyncComputed );
Vue.component( "v-select", VueSelect.VueSelect );
var chartsComuni = new Vue( {
    el: '#chartsComuni',
    data: {
        dataUrl: `${window.location.origin}/cov19-trentino.json`,
        selected: null,
        json: null,
        options: [],
        picked: 'm',
        lastDate: null,
        charts: [
            {
                chart: new Chart( {
                    title: "Deceduti",
                    timeSeriesLabels: [ "Data", "Incremento", "Totale" ],
                    timeSeriesTypes: [ "date", "number", "number" ],
                    timeSeries: [ [] ],
                    timeSeriesColors: COLORS.deceduti,
                    movingAverage: { active: false, range: 7 },
                    movingAverageFunction: mvaTimeSeries,
                } ),
                element: "deceduti_comuni",
            },
            {
                chart: new Chart( {
                    title: "Guariti",
                    timeSeriesLabels: [ "Data", "Incremento", "Totale" ],
                    timeSeriesTypes: [ "date", "number", "number" ],
                    timeSeries: [ [] ],
                    timeSeriesColors: COLORS.guariti,
                    movingAverage: { active: false, range: 7 },
                    movingAverageFunction: mvaTimeSeries,
                } ),
                element: "guariti_comuni",
            },
            {
                chart: new Chart( {
                    title: "Positivi",
                    timeSeriesLabels: [ "Data", "Incremento", "Totale" ],
                    timeSeriesTypes: [ "date", "number", "number" ],
                    timeSeries: [ [] ],
                    timeSeriesColors: COLORS.positivi,
                    movingAverage: { active: false, range: 7 },
                    movingAverageFunction: mvaTimeSeries,
                } ),
                element: "positivi_comuni",
            },
        ],
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
            let last = [ ...json[ json.length - 1 ].cov19_data ];
            let match = last.splice( 1 )
                .filter( ( row ) => {
                    return row[ 1 ].search( re ) > -1;
                } )
                .map( ( row ) => ( { id: row[ 0 ], comune: row[ 1 ], text: `${row[ 1 ]} (c:${row[ 2 ]}, m:${row[ 4 ]}, g:${row[ 3 ]})`, c: row[ 2 ], m: row[ 4 ], g: row[ 3 ] } ) );
            console.log( "VUE", match );
            return match.sort( ( a, b ) => ( parseInt( b[ vm.picked ] ) - parseInt( a[ vm.picked ] ) ) );
        },
        extractCumuneTimeSeries ( json, comune = "ROVERETO" ) {
            comune = comune || "ROVERETO";
            let casesList = [];
            let deadsList = [];
            let healedList = [];
            let before = 0;
            let data = json[ json.length - 1 ].cov19_data;
            //data = Array.from( data );
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
                    return row[ idx - 1 ] === comune;
                } )[ 0 ];
                if ( !cases ) {
                    continue;
                }
                data.shift();
                let positivi = parseInt( cases[ idx ] );
                let daily = positivi - before;
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
                before = positivi;
                casesList.push( [ date, daily, positivi ] );
                //console.log( date, total );
            }
            this.lastDate = date.toISOString().split( "T" )[ 0 ].split( "-" ).reverse().join( "/" );
            this.charts[ 0 ].chart.timeSeries = deadsList;
            this.charts[ 1 ].chart.timeSeries = healedList;
            this.charts[ 2 ].chart.timeSeries = casesList;
        },

        onSearch ( search, loading ) {
            loading && loading( true );
            this.search( loading, search, this );
        },
        search: _.debounce( ( loading, search, vm ) => {
            vm.options = vm.estraiOpzioni( vm.json, search, vm );
            loading && loading( false );
        }, 350 ),
        drawChartComuni ( chart, element ) {
            google.charts.setOnLoadCallback( () => drawChart( chart, element ) );
        },

        onMovingAverageActiveChanged ( chart ) {
            this.drawChartComuni( chart.chart, chart.element );
        },
        onMovingAverageRangeChanged ( chart ) {
            if ( chart.chart.movingAverage.active ) {
                this.drawChartComuni( chart.chart, chart.element );
            }
        },
    },

    watch: {
        selected () {
            loadComuniFactory( this.dataUrl )()
                .then( json => {
                    this.json = json;
                    this.extractCumuneTimeSeries( this.json, this.selected?.comune );
                    for ( const chart of this.charts ) {
                        this.drawChartComuni( chart.chart, chart.element );
                    }
                } );
        },
        picked () {
            this.onSearch( "" )
        },
    },

    created () {
        loadComuniFactory( this.dataUrl )()
            .then( json => {
                this.json = json;
                this.extractCumuneTimeSeries( this.json, this.selected?.comune );
                for ( const chart of this.charts ) {
                    this.drawChartComuni( chart.chart, chart.element );
                }
            } );
        fetch(
            this.dataUrl
        )
            .then( res => res.json() )
            .then( json => {
                this.json = json;
                this.selected = this.estraiOpzioni( json, "ROVERETO", this )[ 0 ];
                this.options = this.estraiOpzioni( json, "", this );
            } );
        for ( const chart of this.charts ) {
            this.$watch( () => chart.chart.movingAverage.active, () => this.onMovingAverageActiveChanged( chart ) );
            this.$watch( () => chart.chart.movingAverage.range, () => this.onMovingAverageRangeChanged( chart ) );
        }

    },

} );
