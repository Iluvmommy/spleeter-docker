const chalk = require("chalk");
const { exec, execSync } = require("child_process");
const path = require("path");
const { argv } = require("process");

/**
@article{spleeter2020,
  doi = {10.21105/joss.02154},
  url = {https://doi.org/10.21105/joss.02154},
  year = {2020},
  publisher = {The Open Journal},
  volume = {5},
  number = {50},
  pages = {2154},
  author = {Romain Hennequin and Anis Khlif and Felix Voituret and Manuel Moussallam},
  title = {Spleeter: a fast and efficient music source separation tool with pre-trained models},
  journal = {Journal of Open Source Software},
  note = {Deezer Research}
} */

const startDocker = (filename, stems) => {
  console.log(chalk.blue("Starting Docker..."));

  try {
    execSync("docker container rm spleeter");
  } catch (e) {
    console.log(chalk.yellow(`Warning: ${e.message}`));
  }

  console.log(chalk.blue("Pulling spleeter..."));
  exec(
    "docker pull researchdeezer/spleeter@sha256:e46b042c25781c8ef041847d9615d799b3fa76d56a653ece0d0e2585067153a2",
    (err) => {
      if (err) {
        console.log(chalk.red(`Could not run Docker.`));
        console.log(chalk.red(`Error running docker pull: ${err.message}`));
        done();
      } else {
        runSpleeterDocker(filename, stems);
      }
    }
  );
};

const runSpleeterDocker = (filename, stems) => {
  const env = {
    input: path.resolve(path.dirname(filename)),
    model: path.join(__dirname, "pretrained_models"),
  };
  const cmd =
    "docker run --name spleeter " +
    `-v "${env.input}":/input ` +
    `-v "${env.model}":/model ` +
    `-e MODEL_PATH=/model researchdeezer/spleeter:3.7 separate ` +
    `-i "/input/${path.basename(filename)}" ` +
    `-o /output ` +
    `-p spleeter:${stems}`;
  console.log(chalk.blue(`Spleeter is running. This may take a minute...`));
  console.log(cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.log(chalk.redBright(`Error running Spleeter: ${err.message}`));
      console.log(
        chalk.redBright(
          "Spleeter failed. Make sure Docker can access your audio files and has enough memory."
        )
      );
      return;
    }
    if (stderr) {
      console.log(chalk.green(`Spleeter stderr: ${stderr}`));
    }
    if (stdout) {
      console.log(chalk.red(`Spleeter stdout: ${stdout}`));
    }

    const correctFilename = path
      .basename(filename)
      .split(".")
      .slice(0, -1)
      .join(".");
    const outputFilename = path.join(__dirname, correctFilename);
    console.log(chalk.blue("Running docker copy..."));
    exec(
      `docker cp spleeter:"/output/${correctFilename}/" "${outputFilename}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.log(chalk.red(`Error running docker cp: ${err.message}`));
          console.log(chalk.red(`Could not copy files from Docker.`));
          return;
        } else {
          try {
            exec(`open ${outputFilename}`);
          } catch (e) {
            return;
          }
        }
        console.log(chalk.green("Done"));
      }
    );
  });
};

const file = argv[2] || "Sleep On The Floor.mp3";
console.log(chalk.blueBright(`starting ${file}`));
startDocker(file, "4stems-16kHz");
