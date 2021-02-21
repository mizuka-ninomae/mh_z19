  const SerialPort  = require('serialport');
  let sdata        = this.sdata;
  let rdata        = Buffer.alloc(0);
  let co2_level    = 0;
  let co2_detected = 0;
  const port       = new SerialPort(this.uart_path, {
                                    autoOpen: true,
                                    baudRate: 9600,
                                    dataBits: 8,
                                    parity:   'none',
                                    stopBits: 1
  });

  port.on("open", function() {
    if (this.debag) {
      this.log("Co2Sensor SerialPort: Open");
      this.log('Co2Sensor send data:    ', sdata);
    }
    port.write(sdata);
  }.bind(this));

  port.on("data", function(data) {
    rdata = Buffer.concat([rdata, data]);
    if (rdata.byteLength >= 9) {
      if (this.debag) {
        this.log('Co2Sensor receive data: ', rdata);
      }
      let adata    = new Uint8Array(rdata);
      co2_level    = adata[2]*256+adata[3];
      let checksum = (256-(adata[1]+adata[2]+adata[3]+adata[4]+adata[5]+adata[6]+adata[7]));
      if (adata[8] == checksum) {
      }
      else {
        this.log('Co2Sensor Bad Checksum: ' + adata[8] + ' / ' + checksum)
      }
      port.close();
      if (this.debag) {
        this.log("Co2Sensor SerialPort: Close");
      }
      if (this.warning_level > co2_level) {
        co2_detected = 0;
      }
      else {
        co2_detected = 1;
      }
      if (this.debag) {
        this.log(co2_level);
        this.log(co2_detected);
      }
      callback(null, co2_level, co2_detected);
    }
  }.bind(this));

  port.on("error", function(err) {
    this.log("Co2Sensor error");
    port.close();
    callback(err, co2_level, co2_detected);
  }.bind(this));
