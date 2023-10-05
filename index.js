#!/usr/bin/env node

const sourceMap = require("source-map");
const fs = require('fs');
const path = require('path');
const argparse = require('argparse');

const parser = new argparse.ArgumentParser({
    description: 'Webpack Source Map Unpacker',
    usage: 'wup [-h] [-d DIR] [sourceMapFilePath]',
    epilog: 'usage for multiple map files: find . -name "*.map" | wup [-d DIR]'
});

parser.add_argument('-d', '--dir', {
    help: 'Specify the unpacked directory (default: current directory)',
    default: './',
});

parser.add_argument('sourceMapFilePath', {
    nargs: '?',
    help: 'Source map file path',
});

async function unpackFile(mapData) {
    return new Promise((resolve, reject) => {
        try {
            sourceMap.SourceMapConsumer.with(
                mapData,
                null,
                async function (consumer) {
                    const sourceInfo = consumer.sources.map((source) => {
                        const content = consumer.sourceContentFor(source);
                        return {
                            "path": source.replace(/^\/|\/$/g, ""),
                            "source": content
                        };
                    });
                    resolve(sourceInfo);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}

async function writeFile(filePath, content) {
    const folderPath = path.dirname(filePath);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, {
            recursive: true
        });
    }

    fs.writeFileSync(filePath, content);
}

async function processSourceMap(mapData, unpackedDir) {
    try {
        const unpacks = await unpackFile(mapData);
        unpacks.forEach((unpack) => {
            const outputPath = path.join(unpackedDir, unpack.path);
            writeFile(outputPath, unpack.source);
        });
    } catch (err) {
        console.error("Error processing source map:", err);
    }
}

async function main() {
    const args = parser.parse_args();

    let sourceMapData;
    let sourceMapFilePath;

    if (!args.sourceMapFilePath && process.stdin.isTTY) {
        console.error(parser.formatHelp());
        process.exit(1);
    } else if (args.sourceMapFilePath) {
        sourceMapFilePath = args.sourceMapFilePath.trim();
        sourceMapData = fs.readFileSync(sourceMapFilePath, 'utf8');
        processSourceMap(sourceMapData, args.dir);
    } else {
        let sourceMapFilePaths = await new Promise((resolve) => {
            let data = "";
            process.stdin.on('data', (chunk) => {
                data += chunk;
            });
            process.stdin.on('end', () => {
                resolve(data);
            });
        });
        sourceMapFilePaths = sourceMapFilePaths.trim().split('\n');
        for (const sourceMapFilePath of sourceMapFilePaths) {
            sourceMapData = fs.readFileSync(sourceMapFilePath, 'utf8');
            processSourceMap(sourceMapData, args.dir);
        }
    }

    
}

main();
