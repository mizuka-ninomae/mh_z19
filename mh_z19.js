
const SerialPort   = require('serialport');
const sdata        = Buffer.from([0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
let   rdata        = Buffer.alloc(0);
let   co2_level;

class MHZ19 {
  constructor (uart) {
    const uart_path = "/dev/" + uart;
    const port      = new SerialPort (uart_path, {
                                      autoOpen: true,
                                      baudRate: 9600,
                                      dataBits: 8,
                                      parity: 'none',
                                      stopBits: 1
    });

    port.on ("open", function() {
      if (require.main === module) {
        console.log ("MH-Z19 Co2Sensor SerialPort: Open ('" + uart_path + "')");
        console.log ('MH-Z19 Co2Sensor send data:    ', sdata);
      }
      port.write (sdata);
    });

    port.on ("data", function(data) {
      rdata = Buffer.concat ([rdata, data]);
      if (rdata.byteLength >= 9) {
        if (require.main === module) {
          console.log ('MH-Z19 Co2Sensor receive data: ', rdata);
        }
        let adata      = new Uint8Array (rdata);
        co2_level      = adata[2]*256+adata[3];
        let checksum   = (256-(adata[1]+adata[2]+adata[3]+adata[4]+adata[5]+adata[6]+adata[7]));
        if (adata[8]  == checksum) {
        }
        else {
          console.log ('MH-Z19 Co2Sensor Bad Checksum: ' + adata[8] + ' / ' + checksum)
        }
        port.close ();
        if (require.main === module) {
          console.log ("MH-Z19 Co2Sensor SerialPort: Close");
        }
      }
    });

    port.on ("error", function() {
      port.close ();
      console.log ("MH-Z19 Co2Sensor SerialPort: error");
      return;
    });

    port.on ("close", function() {
      if (require.main === module) {
        console.log ("MH-Z19 Co2Sensor Co2_level: " + co2_level);
      }
      return co2_level;
    });
  }
}

if (require.main === module) {
  let mh_z19 = new MHZ19 (process.argv[2]);
}
else {
  module.exports = MHZ19;
}
