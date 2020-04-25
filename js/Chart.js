const COLORS = {
    ospedalizzati: [ '#c805b9', '#76056e' ],
    intensiva: [ '#FFAE25', '#C88005' ],
    deceduti: [ '#e80e0e', '#B50000' ],
    guariti: [ '#55e57c', '#0f3b1b' ],
    tamponi: [ '#0012F2', '#0082F2' ],
    positivi: [ '#976393', '#685489' ],
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

