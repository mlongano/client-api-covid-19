function loadNazionaliFactory ( url ) {

    let isNazionaliLoaded = false;
    let jsonNazionali = {};

    return async function () {
        if ( isNazionaliLoaded ) {
            return jsonNazionali;
        }

        let res = await fetch( url );
        jsonNazionali = await res.json();
        console.log( "Nazionali", jsonNazionali );
        isNazionaliLoaded = true;
        return jsonNazionali;
    }
}

Vue.component( "gchart", VueGoogleCharts );
var chartsNazionali = new Vue( {
    el: '#chartsNazionali',
    data: {
        dataUrl: urlDataItaly,
        lastDate: null,
        json: null,
        chartData: [
            [ 'Year', 'Sales', 'Expenses', 'Profit' ],
            [ '2014', 1000, 400, 200 ],
            [ '2015', 1170, 460, 250 ],
            [ '2016', 660, 1120, 300 ],
            [ '2017', 1030, 540, 350 ]
        ],
        chartOptions: {
            chart: {
                title: 'Company Performance',
                subtitle: 'Sales, Expenses, and Profit: 2014-2017',
            }
        },

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
                element: "ospedalizzati_Nazionali",
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
                element: "intensiva_Nazionali",
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
                element: "deceduti_Nazionali",
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
                element: "guariti_Nazionali",
            },
            {
                chart: new Chart( {
                    title: "Tamponi",
                    timeSeriesLabels: [ "Data", "Incremento", "Totale" ],
                    timeSeriesTypes: [ "date", "number", "number" ],
                    timeSeries: [ [] ],
                    timeSeriesColors: COLORS.tamponi,
                    movingAverage: { active: false, range: 7 },
                    movingAverageFunction: mvaTimeSeries,
                } ),
                element: "tamponi_Nazionali",
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
                element: "positivi_Nazionali",
            },
        ],
    },

    methods: {
        extractNazionaliTimeSeries ( json ) {
            console.log( "Italia json:", json );
            let positivi = [];
            let terapia_intensiva = [];
            let deceduti = [];
            let tamponi = [];
            let ospedalizzati = [];
            let dimessi_guariti = [];
            let first = new Date( json[ 0 ].data ).getTime() / 86400000 - 18316;
            let last = first;
            let ultimiDeceduti = json[ 0 ].deceduti;
            let ultimiGuariti = json[ 0 ].dimessi_guariti;
            let ultimiTamponi = json[ 0 ].tamponi;
            let ultimiTerapia = json[ 0 ].terapia_intensiva;
            let ultimiOspedalizzati = json[ 0 ].totale_ospedalizzati;
            let lastDateTime;
            for ( let daily of json ) {
                lastDateTime = daily.data;
                let date = daily.data.split( " " )[ 0 ];
                last = new Date( date );
                let tc = 0;
                if ( daily.totale_positivi instanceof String ) {
                    tc = parseInt( daily.totale_positivi );
                } else {
                    tc = daily.totale_positivi;
                };

                positivi.push( [ last, daily.nuovi_positivi, tc ] );

                ospedalizzati.push( [ last, daily.totale_ospedalizzati - ultimiOspedalizzati, daily.totale_ospedalizzati ] );
                ultimiOspedalizzati = daily.totale_ospedalizzati;

                terapia_intensiva.push( [ last, daily.terapia_intensiva - ultimiTerapia, daily.terapia_intensiva ] );
                ultimiTerapia = daily.terapia_intensiva;

                deceduti.push( [ last, daily.deceduti - ultimiDeceduti, daily.deceduti ] );
                ultimiDeceduti = daily.deceduti;

                dimessi_guariti.push( [ last, parseInt( daily.dimessi_guariti ) - ultimiGuariti, parseInt( daily.dimessi_guariti ) ] );
                ultimiGuariti = daily.dimessi_guariti;

                tamponi.push( [ last, daily.tamponi - ultimiTamponi, daily.tamponi ] );
                ultimiTamponi = daily.tamponi;
            }

            this.lastDate = lastDateTime.split( "T" )[ 0 ].split( "-" ).reverse().join( "/");
            this.charts[ 0 ].chart.timeSeries = ospedalizzati;
            this.charts[ 1 ].chart.timeSeries = terapia_intensiva;
            this.charts[ 2 ].chart.timeSeries = deceduti;
            this.charts[ 3 ].chart.timeSeries = dimessi_guariti;
            this.charts[ 4 ].chart.timeSeries = tamponi;
            this.charts[ 5 ].chart.timeSeries = positivi;
        },

        drawChartNazionali ( chart, element ) {
            google.charts.setOnLoadCallback( () => drawChart( chart, element ) );
        },

        onMovingAverageActiveChanged ( chart ) {
            this.drawChartNazionali( chart.chart, chart.element );
        },
        onMovingAverageRangeChanged ( chart ) {
            if ( chart.chart.movingAverage.active ) {
                this.drawChartNazionali( chart.chart, chart.element );
            }
        },
    },

    created () {
        let getJson = loadNazionaliFactory( this.dataUrl );
        getJson()
            .then( json => {
                this.json = json;
                this.extractNazionaliTimeSeries( this.json );
                for ( const chart of this.charts ) {
                    this.drawChartNazionali( chart.chart, chart.element );
                }
            } );
        for ( const chart of this.charts ) {
            this.$watch( () => chart.chart.movingAverage.active, () => this.onMovingAverageActiveChanged( chart ) );
            this.$watch( () => chart.chart.movingAverage.range, () => this.onMovingAverageRangeChanged( chart ) );
        }

    },

} );
