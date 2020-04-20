
function compareValues ( key, order = 'asc' ) {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

/**
 * Calculate the simple moving average of an array. A new array is returned with the average
 * of each range of elements. A range will only be calculated when it contains enough elements to fill the range.
 *
 * ```js
 * console.log(sma([1, 2, 3, 4, 5, 6, 7, 8, 9], 4));
 * //=> [ '2.50', '3.50', '4.50', '5.50', '6.50', '7.50' ]
 * //=>   │       │       │       │       │       └─(6+7+8+9)/4
 * //=>   │       │       │       │       └─(5+6+7+8)/4
 * //=>   │       │       │       └─(4+5+6+7)/4
 * //=>   │       │       └─(3+4+5+6)/4
 * //=>   │       └─(2+3+4+5)/4
 * //=>   └─(1+2+3+4)/4
 * ```
 * @param  {Array} `arr` Array of numbers to calculate.
 * @param  {Number} `range` Size of the window to use to when calculating the average for each range. Defaults to array length.
 * @param  {Function} `format` Custom format function called on each calculated average. Defaults to `n.toFixed(2)`.
 * @return {Array} Resulting array of averages.
 * @api public
 */

function sma ( arr, range, format ) {
  if ( !Array.isArray( arr ) ) {
    throw TypeError( 'expected first argument to be an array' );
  }

  var fn = typeof format === 'function' ? format : toFixed;
  var num = range || arr.length;
  var res = [];
  var len = arr.length + 1;
  var idx = num - 1;
  while ( ++idx < len ) {
    res.push( fn( avg( arr, idx, num ) ) );
  }
  return res;
}

/**
 * Create an average for the specified range.
 *
 * ```js
 * console.log(avg([1, 2, 3, 4, 5, 6, 7, 8, 9], 5, 4));
 * //=> 3.5
 * ```
 * @param  {Array} `arr` Array to pull the range from.
 * @param  {Number} `idx` Index of element being calculated
 * @param  {Number} `range` Size of range to calculate.
 * @return {Number} Average of range.
 */

function avg ( arr, idx, range ) {
  return sum( arr.slice( idx - range, idx ) ) / range;
}

/**
 * Calculate the sum of an array.
 * @param  {Array} `arr` Array
 * @return {Number} Sum
 */

function sum ( arr ) {
  var len = arr.length;
  var num = 0;
  while ( len-- ) num += Number( arr[ len ] );
  return num;
}

/**
 * Default format method.
 * @param  {Number} `n` Number to format.
 * @return {String} Formatted number.
 */

function toFixed ( n ) {
  return n.toFixed( 2 );
}

/**
 * validate an index in a range.
 * @param  {Number} `idx` index to validate
 * @param  {Number} `idxmax` maximun value allowed
 * @param  {Number} `idxmin` minimum value allowed
 * @return {Number} `idx` if idxmin <= idx <= idxmax otherwise idxmin or idxmax
 */

function validIndex ( idx, idxmax = Infinity, idxmin = 0) {
  //console.log(x,xmax)
  if ( idx < idxmin )
    return idxmin
  if ( idx > idxmax ) {
    return idxmax
  }
  return idx
}

/**
 * Calculate the moving average of an array. A new array is returned with the average
 * of each range of elements. A range will be calculated with the elements available.
 *
 * ```js
 * console.log(mva([1, 2, 3, 4, 5, 6, 7, 8, 9], 5));
 * //=> [ '2', '2.5', '3', '4', '5', '6', '7', '7.5', '8' ]
 * //=>   │      │     │    │    │    │   │     │    └─(7+8+9)/5
 * //=>   │      │     │    │    │    │   │     └─(6+7+8+9)/5
 * //=>   │      │     │    │    │    │   └─(5+6+7+8+9)/5
 * //=>   │      │     │    │    │    └─(4+5+6+7+8)/5
 * //=>   │      │     │    │    └─(3+4+5+6+7)/5
 * //=>   │      │     │    └─(2+3+4+5+6)/5
 * //=>   │      │     └─(1+2+3+4+5)/5
 * //=>   │      └─(1+2+3+4)/5
 * //=>   └─(1+2+3)/5
 * ```
 * @param  {Array} `data` Array of numbers to calculate.
 * @param  {Number} `span` Size of the window to use to when calculating the average for each range. Defaults to 3.
 * @return {Array} Resulting array of averages.
 * @api public
 */
function mva ( data, span = 3 ) {
  let kinf = parseInt( ( span - 1 ) / 2 );
  let ksup = parseInt( ( span - 1 ) / 2 + 1.5 );
  let dataAveraged = [];
  for ( let i = 0; i < data.length; i++ ) {
    let range = data.slice( validIndex( i - kinf), validIndex( i + ksup,data.length ) );
    let avg = range.reduce( ( a, b ) => a + b, 0 ) / range.length
    dataAveraged.push( avg );
  }
  return dataAveraged;
}
