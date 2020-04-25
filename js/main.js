const COLORS = {
    deceduti: [ '#e80e0e', '#B50000' ],
}

function loadComuniFactory (url) {

    let isComuniLoaded = false;
    let jsonComuni = {};

    return async function () {
        if ( isComuniLoaded ) {
            return jsonComuni;
        }
        let res = await fetch( url);
        jsonComuni = await res.json();
        isComuniLoaded = true;
        return jsonComuni;
    }
}
class Chart {
    constructor( {
        title = "",
        timeSeriesLabels = [],
        timeSeriesTypes = [],
        timeSeriesColors = [],
        timeSeries = [], //a list of list of values
        movingAveragedTimeSeries = [], //a list of list of moving averaged values
        movingAverage = {
            active: false,
            range: 3,
        },
        movingAverageFunction = () => { throw new ReferenceError( `No moving average function defined for the object of type ${this.constructor.name} with the title "${this.title}"` ) },
    } = {} ) {
        this.title = title;
        this.timeSeriesLabels = timeSeriesLabels;
        this.timeSeriesTypes = timeSeriesTypes;
        this.timeSeriesColors = timeSeriesColors;
        this._timeSeries = timeSeries;
        this.movingAveragedTimeSeries = movingAveragedTimeSeries;
        this.movingAverage = movingAverage;
        this.movingAverageFunction = movingAverageFunction;
    }
    get numberOfSeries () {
        return this.timeSeriesLabels.length;
    }

    get timeSeries () {
        if ( this.movingAverage.active ) {
            return this.movingAverageFunction( this._timeSeries, this.movingAverage.range );
        }
        return this._timeSeries;
    }
    set timeSeries ( series ) {
        if ( Array.isArray( series ) && Array.isArray( series[ 0 ] ) ) {
            this._timeSeries = series;
        } else {
            throw new TypeError( `The "timeSeries" of the object of type ${this.constructor.name} with the title "${this.title}" is not an Array of Arrays` )
        }
    }

}

function extractCumuneTimeSeries ( json, comune = "ROVERETO" ) {
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
    return {
        deceduti: deadsList,
        guariti: healedList,
        positivi: casesList,
    };
}

Vue.use( AsyncComputed );
Vue.component( "v-select", VueSelect.VueSelect );
var app = new Vue( {
    el: '#vue',
    data: {
        dataUrl: `${window.location.origin}/cov19-trentino.json`,
        selected: null,
        json: null,
        json1: null,
        options: [],
        picked: 'm',
        decedutiMva: false,
        decedutiSpan: "7",
        deceduti1Mva: false,
        deceduti1Span: "7",
        guaritiMva: false,
        guaritiSpan: "7",
        positiviMva: false,
        positiviSpan: "7",
        decedutiChart: new Chart( {
            title: "Deceduti",
            timeSeriesLabels: [ "Data", "Incremento", "Totale" ],
            timeSeriesTypes: [ "date", "number", "number" ],
            timeSeries: [ [] ],
            timeSeriesColors: COLORS.deceduti,
            movingAverageFunction: mvaTimeSeries,
        } )
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

        onSearch ( search, loading ) {
            loading && loading( true );
            this.search( loading, search, this );
        },
        search: _.debounce( ( loading, search, vm ) => {
            vm.options = vm.estraiOpzioni( vm.json, search, vm );
            loading && loading( false );
        }, 350 ),

        drawComuni () {
            google.charts.setOnLoadCallback( () => drawChartComuni( this.selected?.comune, {
                decedutiMva: this.decedutiMva,
                decedutiSpan: parseInt( this.decedutiSpan ),
                guaritiMva: this.guaritiMva,
                guaritiSpan: parseInt( this.guaritiSpan ),
                positiviMva: this.positiviMva,
                positiviSpan: parseInt( this.positiviSpan ),
            } ) );

        },
        drawChartComuni (chart, element) {
            google.charts.setOnLoadCallback( () => drawChart( chart, element) );
        },
    },

    watch: {
        selected () {
            this.drawComuni();
            loadComuniFactory( this.dataUrl )()
                .then( json => {
                    this.json1 = json;
                    this.decedutiChart.timeSeries = extractCumuneTimeSeries( this.json1, this.selected?.comune ).deceduti;
                    this.drawChartComuni( this.decedutiChart, "deceduti1_comuni" );
                } );
        },
        deceduti1Mva () {
            this.decedutiChart.movingAverage.active = this.deceduti1Mva;
            this.drawChartComuni( this.decedutiChart, "deceduti1_comuni" );
         },
        deceduti1Span () {
            this.decedutiChart.movingAverage.range = parseInt( this.deceduti1Span );
            if ( this.decedutiChart.movingAverage.active ) {
                this.drawChartComuni( this.decedutiChart, "deceduti1_comuni" );
            }
        },
        decedutiMva: { handler: 'drawComuni' },
        decedutiSpan () {
            if ( this.decedutiMva ) {
                this.drawComuni();
            }
        },
        guaritiMva: { handler: 'drawComuni' },
        guaritiSpan () {
            if ( this.guaritiMva ) {
                this.drawComuni();
            }
        },
        positiviMva: { handler: 'drawComuni' },
        positiviSpan () {
            if ( this.positiviMva ) {
                this.drawComuni();
            }
        },
        picked () {
            this.onSearch( "" )
        },
    },

    created () {
        loadComuniFactory( this.dataUrl )()
            .then( json => {
                this.json1 = json;
                this.decedutiChart.timeSeries = extractCumuneTimeSeries( this.json1, this.selected?.comune ).deceduti;
                this.drawChartComuni( this.decedutiChart, "deceduti1_comuni" );
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
        this.drawComuni();
    },

} )
