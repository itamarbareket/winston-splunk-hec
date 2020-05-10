# winston-splunk-hec

A [splunk](https://splunk.com) (over HEC)
transport for the [winston](https://github.com/winstonjs/winston) logging toolkit.

## Installation

```sh
npm install --save winston winston-elasticsearch
```

## Usage

```js
var winston = require('winston');
var SplunkTrasport = require('winston-splunk-hec');

var TransportOpts = {
  level: 'info'
};
var logger = winston.createLogger({
  transports: [
    new SplunkTrasport(TransportOpts)
  ]
});
```

The [winston API for logging](https://github.com/winstonjs/winston#streams-objectmode-and-info-objects)
can be used with one restriction: Only one JS object can only be logged and indexed as such.
If multiple objects are provided as arguments, the contents are stringified.

## Options

- `level` [`info`] Messages logged with a severity greater or equal to the given one are logged to ES; others are discarded.
- `buffering` [true] Boolean flag to enable or disable messages buffering. The `bufferLimit` option is ignored if set to `false`.
- `bufferLimit` [null] Limit for the number of log messages in the buffer.
- `SplunkUrl` Url for splunk HEC endopint
- `SplunkHec` HEC token