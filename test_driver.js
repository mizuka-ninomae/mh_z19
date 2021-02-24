const MHZ19     = require('mh_z19');
let   uart_path = "/dev/ttyS0";

let mh_z19 = new MHZ19(uart_path, function(error, co2_level, stderr){
  console.log (co2_level);
  console.log (error);
  console.log (stderr);
});
