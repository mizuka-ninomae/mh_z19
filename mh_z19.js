const SerialPort   = require('serialport');
const sdata        = Buffer.from([0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
let   rdata        = Buffer.alloc(0);

class MHZ19 {
  constructor (uart_path, callback) {
    const port      = new SerialPort (uart_path, {
                                      autoOpen: true,
                                      baudRate: 9600,
                                      dataBits: 8,
                                      parity:   'none',
                                      stopBits: 1
    });

    port.on ("open", function () {
      if (require.main === module) {
        console.log ("MH-Z19 Co2Sensor SerialPort: Open ('" + uart_path + "')");
        console.log ('MH-Z19 Co2Sensor send data:    ', sdata);
      }
      port.write (sdata);
    });

    port.on ("data", function (data) {
      rdata = Buffer.concat ([rdata, data]);
      if (rdata.byteLength >= 9) {
        port.close ();
      }
    });

    port.on ("error", function (err) {
      port.close ();
      callback ("MH-Z19 Co2Sensor SerialPort: error", null, err);
    });

    port.on ("close", function () {
      if (require.main === module) {
      console.log ('MH-Z19 Co2Sensor receive data: ', rdata);
      console.log ("MH-Z19 Co2Sensor SerialPort: Close");
    }
      let adata    = new Uint8Array (rdata);
      let checksum = ((255-(adata[1]+adata[2]+adata[3]+adata[4]+adata[5]+adata[6]+adata[7]))+1);
      if (adata[8] == checksum) {
        callback (null, adata[2]*256+adata[3], null);
      }
      else {
        callback ("MH-Z19 Co2Sensor Bad Checksum", adata[2]*256+adata[3], "Checksam value: " + adata[8] + " / Calculated value: " + checksum);
      }
    });
  }
}

if (require.main === module) {
  let mh_z19 = new MHZ19 (process.argv[2], function(error, co2_level, stderr){
    console.log (co2_level);
    console.log (error);
    console.log (stderr);
  });
}
else {
  module.exports = MHZ19;
}
