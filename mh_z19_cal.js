const SerialPort = require('serialport');
const sdata      = Buffer.from([0xFF, 0x01, 0x87, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78]);
let   rdata      = new Uint8Array ();
let   checksum;

class MHZ19_Cal {
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
        console.log ("MH-Z19 SerialPort: Open ('" + uart_path + "')");
        console.log ('MH-Z19 send data:    ', sdata);
      }

      port.write (sdata, 'binary', function() {
        port.close ();
        if (require.main === module) {
          console.log ("MH-Z19 SerialPort: Close");
        }
        callback (null, "MH-Z19 Calibrate zero point", null);
      });
    });
  }
}

if (require.main === module) {
  new MHZ19_Cal (process.argv[2], function(error, calibrate, stderr){
    console.log (calibrate);
  });
}
else {
  module.exports = MHZ19_Cal;
}
