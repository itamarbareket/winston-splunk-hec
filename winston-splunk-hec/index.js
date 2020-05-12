const winston = require('winston');
const Transport = require('winston-transport');
const axios = require('axios');

class SplunkHec extends Transport {
  constructor(opts) {
    super(opts);
    this.flushInterval = opt.flushInterval || 2000;
    this.buffering = opt.buffering || true;
    this.bufferLimit = opt.bufferLimit || null;
    this.splunkUrl = opt.splunkUrl;
    this.splunkHec = opt.splunkHec;
    this.buff = '';
    this.requestConfig = {
      method: 'post',
      url: opt.splunkUrl,
      headers: {'Authorization': `Splunk ${opt.splunkHec}`},
      timeout: opt.flushInterval, 
  }
    if(this.buffering) {
      setInterval(this.sendLogs, this.flushInterval);
    }
  }

  async sendLogs(logs) {
    let logsToSend;

    if(this.buffering) {
      logsToSend = this.buff;
      this.buff = '';
    } else {
      logsToSend = typeof logs == "object" ? JSON.stringify(logs) : logs;
    }

    try {
        if(logsToSend.length > 0) {
            await axios({...this.requestConfig, data: logsToSend})
        }
    } catch (err) {
        this.buff.concat(logsToSend);
        console.error(`[winston:splunk] Could not send logs to splunk, err: ${err}`)
    }
  }; 

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    const toLog = typeof info == "object" ? JSON.stringify(info) : info;
    if(this.buffering) {
      this.buff.concat(toLog);

      if(this.bufferLimit && this.buff.length > this.bufferLimit) {
        this.sendLogs();
      }
    } else {
      this.sendLogs(toLog);
    }

    callback();
  }
}

winston.transports.SplunkHec = SplunkHec;

module.exports = {
  SplunkHec
};
