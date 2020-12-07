#!/usr/bin/env node

const { execSync, spawnSync }  = require('child_process');

if (process.argv.length !== 4) {
  console.error(`
    git_on_change will run the specified command only if the type of extension specified was changed in the last commit
    
    Usage:
      git_on_change [extensions] [command]

      Example:
        git_on_change JS "npm run test" # Will only run tests if javascript has changed
        git_on_change -JS "echo 'NO JS files were changed'"
  `)
  process.exit(1);
}

const files       = execSync(`git --no-pager diff --name-only HEAD HEAD~1`).toString().split('\n');
const extensions  = {}

const identity = (i) => i

const upper = (s) => s.toUpperCase()

files.forEach(f => {
  const split = f.split('.')
  const ext   = split[split.length - 1];
  
  extensions[ext] = true;
});

const changes =Object
  .keys(extensions)
  .filter(identity)
  .map(upper)
  
const extensionsToListen  = process.argv[2];
const commandToRun        = process.argv[3];

let shouldTrigger = false;

console.info('=== Detected the following file type changes', changes);
console.info('=== Comparing with', extensionsToListen);

extensionsToListen.split(',').forEach(input => {
  const not       = input[0] == '-';
  const ext       = input.toUpperCase().replace(/-/g, '');
  const inChanges = changes.find(c => c === ext);

  if (!shouldTrigger) {
    shouldTrigger = (inChanges && !not) || (!inChanges && not);
  }
});

if (shouldTrigger) {
  console.info(`=== Running ${commandToRun}`)
  const res   = spawnSync(commandToRun, { stdio: 'inherit' });
  const code  = res.status === null ? 1 : 0;

  console.info(`=== Exiting with status ${code}`)
  process.exit(code);
}

