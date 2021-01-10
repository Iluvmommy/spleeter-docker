const chalk = require("chalk");
const { exec, execSync } = require("child_process");
const { argv } = require("process");

// does it have spleeter? download

const runSpleeterMac = (file, stems) => {
  console.log(chalk.blue('Running spleeter. May take a minute...'))
  exec(`spleeter separate -i ${file} -p spleeter:${stems} -o output`, (err, stout, sderr) => {
    if (err) {
      console.error(err)
    }
    if (stout){
      console.log("stout " + stout)
    }
    if (sderr) {
      console.log( "sderr " + sderr)
    }
  })
};

const file = argv[3] || "Cleopatra"
const stem =  argv[2] || "2stems"
runSpleeterMac(file, stem)