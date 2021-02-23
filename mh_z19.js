const SerialPort   = require('serialport');
const sdata        = Buffer.from([0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
let   rdata        = Buffer.alloc(0);

class MHZ19 {
  constructor (uart, callback) {
    const uart_path = "/dev/" + uart;
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
      console.log ("MH-Z19 Co2Sensor SerialPort: error");
      callback (err, null);
    });

    port.on ("close", function () {
      if (require.main === module) {
      console.log ('MH-Z19 Co2Sensor receive data: ', rdata);
      console.log ("MH-Z19 Co2Sensor SerialPort: Close");
    }
      let adata    = new Uint8Array (rdata);
      callback (null, adata[2]*256+adata[3]);
    });
  }
}

if (require.main === module) {
  let mh_z19 = new MHZ19 (process.argv[2], function(error, co2_level){
    console.log (co2_level);
  });
}
else {
  module.exports = MHZ19;
}
