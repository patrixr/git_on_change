#!/usr/bin/env node

const { execSync, spawnSync }   = require('child_process');
const { program }               = require('commander');
const debug                     = require('debug')
const pkg                       = require('./package.json')

const info        = debug('info');
const error       = debug('fatal');
const commaSplit  = (value) => value.split(',');
const upper       = (s = "") => s.toUpperCase()

const exit = (code) => {
  if (code === 0) {
    info(`Exiting with status ${code}`)
  } else {
    error(`Exiting with status ${code}`)
  }
  process.exit(0);
}

program
  .version(pkg.version)
  .option('-e, --extensions <extensions>', 'comma separated list of extensions', commaSplit)
  .command('run <cmd>')
  .action((commandToRun) => {
    console.log(program.extensions)
    const extensions  = program.extensions || [];
    const files       = execSync(`git --no-pager diff --name-only HEAD HEAD~1`).toString().split('\n');
    const changes     = files.reduce((arr, f) => {
      const split = f.split('.')
      const ext   = upper(split[split.length - 1])
      return (ext && arr.indexOf(ext) < 0) ? [...arr, ext] : arr;
    }, []);

    info('Detected the following file type changes', changes);
    info('Comparing with', extensions);

    const shouldTrigger = extensions.find(extIn => {
      const not       = extIn[0] == '-';
      const ext       = extIn.toUpperCase().replace(/-/g, '');
      const inChanges = changes.find(c => c === ext);
    
      return (inChanges && !not) || (!inChanges && not);
    });

    if (shouldTrigger) {
      info(`Running ${commandToRun}`)
      const { status } = spawnSync(commandToRun, { stdio: 'inherit' });
      exit(status === null ? 1 : status);
    }

    exit(0)
  });

program.on('--help', () => {
  console.log(`
    Examples:

    $> git_on_change --extensions JS   "echo 'Some JS files were changed'
    $> git_on_change --extensions -JS  "echo 'No JS files were changed'"
  `)
});
  

program.parse(process.argv);
