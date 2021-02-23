const MHZ19 = require('mh_z19');
let   uart  = "/dev/ttyS0";

let mh_z19 = new MHZ19(uart, function(error, co2_level){
  console.log (co2_level);
});
