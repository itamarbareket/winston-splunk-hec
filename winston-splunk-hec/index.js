const winston = require('winston');
const Transport = require('winston-transport');
const axios = require('axios');
const { Semaphore } = require('async-mutex');

const MAX_CONCURRENT_LOG_WRITES = 100;

class LogBuffer {
    constructor() {
        this.buff = '';
        this.writeMutex = new Semaphore(MAX_CONCURRENT_LOG_WRITES);
    }
    /**
     * Pushes a log to the buffer, scheduled to be sent later.
     * @param {*} log 
     */
    async push(log) {
        const [value, release] = await this.writeMutex.acquire();
        try {
            if(typeof log == "object") {
              log = JSON.stringify(log);
            }

            this.buff = this.buff.concat(JSON.stringify(log))

          } finally {
            release();
        }
    }

    length() {
      return this.buff.length;
    }

    /**
     * Fluses the buffer, returning the buffer's contents
     */
    async flush() {
        const releases = [];
        let flushedData;

        try {
            for (let i = 0; i < MAX_CONCURRENT_LOG_WRITES; i++) {
                const [value, release] = await this.writeMutex.acquire();
                releases.push(release);
            } 

            flushedData = this.buff;
            this.buff = '';
        } finally {
            releases.forEach(release => release());
        }

        return flushedData;
    }
}

class SplunkHec extends Transport {
  constructor(opts) {
    super(opts);
    this.flushInterval = opt.flushInterval || 2000;
    this.buffering = opt.buffering || true;
    this.bufferLimit = opt.bufferLimit || null;
    this.splunkUrl = opt.splunkUrl;
    this.splunkHec = opt.splunkHec;
    this.buff = new LogBuffer(this.bufferLimit);
    this.requestConfig = {
      method: 'post',
      url: opt.splunkUrl,
      headers: {'Authorization': `Splunk ${opt.splunkHec}`},
      timeout: opt.flushInterval, 
  }
    if(this.buffering) {
      registerIntervals();
    }
  }

  async sendLogs(logs) {
    let logsToSend = this.buffering ? await this.buff.flush() : logs;

    if(typeof logsToSend == "object") {
        logsToSend = JSON.stringify(logsToSend);0
    }

    try {
        if(logsToSend.length > 0) {
            await axios({...this.requestConfig, data: logsToSend})
        }
    } catch (err) {
        await buff.push(logsToSend);
        console.error(`[winston:splunk] Could not send logs to splunk, err: ${err}`)
    }
  }; 
   registerIntervals() {
      setInterval(this.sendLogs, this.flushInterval);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', level);
    });

    if(this.buffering) {
      this.buff.push(info);

      if(this.bufferLimit && this.buff.length() > this.bufferLimit) {
        this.sendLogs();
      }
    } else {
      this.sendLogs(info);
    }

    callback();
  }
}

winston.transports.SplunkHec = SplunkHec;

module.exports = {
  SplunkHec
};
