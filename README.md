# An easy to use Webpack Unpacker

## Installation

```bash
npm install webpack-unpacker
```

## Usage

```
usage: index.js [-h] [-d DIR] [sourceMapFilePath]

Webpack Source Map Unpacker

positional arguments:
  sourceMapFilePath  Source map file path

optional arguments:
  -h, --help         show this help message and exit
  -d DIR, --dir DIR  Specify the unpacked directory (default: current directory)

usage for multiple map files: find . -name "*.map" | wup [-d DIR]
```