const winston = require('winston');
const Transport = require('winston-transport');
const axios = require('axios');

class SplunkHec extends Transport {
  constructor(opts) {
    super(opts);

    opts = opts || {};

    this.name = 'SplunkHec'
    this.flushInterval = opts.flushInterval || 5000;
    this.buffering = opts.buffering || true;
    this.bufferLimit = opts.bufferLimit || undefined;
    this.splunkUrl = opts.splunkUrl;
    this.splunkHec = opts.splunkHec;
    this.buff = "";
    this.requestConfig = {
      method: 'post',
      url: this.splunkUrl,
      headers: {'Authorization': `Splunk ${this.splunkHec}`},
  }
    if(this.buffering) {
      setInterval(this.sendLogs, this.flushInterval);
    }
  }

  sendLogs = async (logs) => {
    let logsToSend;

    if(this.buffering) {
      logsToSend = this.buff;
      this.buff = "";
    } else {

      logsToSend = typeof logs == "object" ? JSON.stringify(logs) : logs;
    }

    
    try {
      if(logsToSend.length > 0) {
            console.log(logsToSend)
            await axios({...this.requestConfig, data: logsToSend})
            this.emit('logged', logsToSend);
        }
    } catch (err) {
        this.emit('error', err);
    }
  }

  log(info, callback) {
    const toLog = typeof info == "object" ? JSON.stringify(info) : info;
    if(this.buffering) {
      this.buff = this.buff.concat(toLog);

      if(this.bufferLimit && this.buff.length > this.bufferLimit) {
        this.sendLogs();
      } else {
        this.emit('logged', toLog);
      }
    } else {
      this.sendLogs(toLog);
    }
    
    if (callback) {
      setImmediate(callback);
    }
  }
}

winston.transports.SplunkHec = SplunkHec;

module.exports = SplunkHec;

