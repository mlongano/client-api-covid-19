function loadTrentinoFactory ( url ) {

    let isTrentinoLoaded = false;
    let jsonTrentino = {};

    return async function () {
        if ( isTrentinoLoaded ) {
            return jsonTrentino;
        }

        let res = await fetch( url );
        let csvString = await res.text();
        jsonTrentino = await csv().fromString( csvString );
        console.log( "Trentino", jsonTrentino );
        isTrentinoLoaded = true;
        return jsonTrentino;
    }
}

var chartsTrentino = new Vue( {
    el: '#chartsTrentino',
    data: {
        dataUrl: urlsDataTrentino.urlstatoclinico,
        lastDate: null,
        json: null,
        charts: [
            {
                chart: new Chart( {
                    title: "Ospedalizzati",
                    timeSeriesLabels: [ "Data", "Incremento", "Totale" ],
                    timeSeriesTypes: [ "date", "number", "number" ],
                    timeSeries: [ [] ],
                    timeSeriesColors: COLORS.ospedalizzati,
                    movingAverage: { active: false, range: 7 },
                    movingAverageFunction: mvaTimeSeries,
                } ),
                element: "ospedalizzati_Trentino",
            },
            {
                chart: new Chart( {
                    title: "Terapia intensiva/alta intensità",
                    timeSeriesLabels: [ "Data", "Incremento", "Totale" ],
                    timeSeriesTypes: [ "date", "number", "number" ],
                    timeSeries: [ [] ],
                    timeSeriesColors: COLORS.intensiva,
                    movingAverage: { active: false, range: 7 },
                    movingAverageFunction: mvaTimeSeries,
                } ),
                element: "intensiva_Trentino",
            },
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
                element: "deceduti_Trentino",
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
                element: "guariti_Trentino",
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
                element: "positivi_Trentino",
            },
        ],
    },

    methods: {
        extractTrentinoTimeSeries ( json ) {
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

                ospedalizzati.push( [ date, tot - ultimiOspedalizzati, tot ] );
                ultimiOspedalizzati = tot;

                terapia_intensiva.push( [ date, terap - ultimiTerapia, terap ] );
                ultimiTerapia = terap;

                deceduti.push( [ date, parseInt( daily.deceduti ) - ultimiDeceduti, parseInt( daily.deceduti ) ] );
                ultimiDeceduti = parseInt( daily.deceduti );

                guariti.push( [ date, parseInt( daily.guariti ) - ultimiGuariti, parseInt( daily.guariti ) ] );
                ultimiGuariti = parseInt( daily.guariti );

                positivi.push( [ date, parseInt( daily.incremento ), parseInt( daily.pos_att ) ] );

            }
            this.lastDate = date.toISOString().split( "T" )[ 0 ].split( "-" ).reverse().join( "/" );
            this.charts[ 0 ].chart.timeSeries = ospedalizzati;
            this.charts[ 1 ].chart.timeSeries = terapia_intensiva;
            this.charts[ 2 ].chart.timeSeries = deceduti;
            this.charts[ 3 ].chart.timeSeries = guariti;
            this.charts[ 4 ].chart.timeSeries = positivi;
        },

        drawChartTrentino ( chart, element ) {
            google.charts.setOnLoadCallback( () => drawChart( chart, element ) );
        },

        onMovingAverageActiveChanged ( chart ) {
            this.drawChartTrentino( chart.chart, chart.element );
        },
        onMovingAverageRangeChanged ( chart ) {
            if ( chart.chart.movingAverage.active ) {
                this.drawChartTrentino( chart.chart, chart.element );
            }
        },
    },

    created () {
        let getJson = loadTrentinoFactory( this.dataUrl );
        getJson()
            .then( json => {
                this.json = json;
                this.extractTrentinoTimeSeries( this.json );
                for ( const chart of this.charts ) {
                    this.drawChartTrentino( chart.chart, chart.element );
                }
            } );
        for ( const chart of this.charts ) {
            this.$watch( () => chart.chart.movingAverage.active, () => this.onMovingAverageActiveChanged( chart ) );
            this.$watch( () => chart.chart.movingAverage.range, () => this.onMovingAverageRangeChanged( chart ) );
        }

    },

} );
