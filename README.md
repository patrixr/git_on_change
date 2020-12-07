# git_on_change

Little script to trigger a command only if some files of certain extensions have changed

## Usage

```bash
$> npx git_on_change --help

Usage: git_on_change [options] [command]

Options:
  -V, --version                  output the version number
  -e, --extensions <extensions>  comma separated list of extensions
  -h, --help                     display help for command

Commands:
  run <cmd>
  help [command]                 display help for command

    Examples:

    $> git_on_change --extensions "JS"   run "echo Some JS files were changed"
    $> git_on_change --extensions "-JS"  run "echo No JS files were changed"
```
