const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length')
const sdata      = Buffer.from([0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
let   rdata      = new Uint8Array ();
let   checksum;

class MHZ19 {
  constructor (uart_path, callback) {
    const port      = new SerialPort (uart_path, {
                                      autoOpen: true,
                                      baudRate: 9600,
                                      dataBits: 8,
                                      parity:   'none',
                                      stopBits: 1
    });
    const parser    = port.pipe (new ByteLength ({length: 9}));

    port.on ("open", function () {
      if (require.main === module) {
        console.log ("MH-Z19 SerialPort: Open ('" + uart_path + "')");
        console.log ('MH-Z19 send data:    ', sdata);
      }

      port.write (sdata, 'binary', function() {
        parser.on ("data", function (data) {
          rdata = data;
          port.close ();
        });

        port.on ("error", function (err) {
          port.close ();
          callback ("MH-Z19 SerialPort: error", null, err);
        });

        port.on ("close", function () {
          if (require.main === module) {
            console.log ('MH-Z19 receive data: ', rdata);
            console.log ("MH-Z19 SerialPort: Close");
          }
          checksum = ((255-(rdata[1]+rdata[2]+rdata[3]+rdata[4]+rdata[5]+rdata[6]+rdata[7]))+1);
          if (rdata[8] == checksum) {
            callback (null, rdata[2]*256+rdata[3], null);
          }
          else {
            callback ("MH-Z19 Bad Checksum", rdata[2]*256+rdata[3], "Checksam value: " + rdata[8] + " / Calculated value: " + checksum);
          }
        });
      });
    });
  }
}

if (require.main === module) {
  new MHZ19 (process.argv[2], function(error, co2_level, stderr){
    console.log (co2_level);
    console.log (error);
    console.log (stderr);
  });
}
else {
  module.exports = MHZ19;
}
