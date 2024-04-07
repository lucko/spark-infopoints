const Pbf = require('pbf');
const fs = require('fs');
const YAML = require('yaml');
const marked = require('marked');
const compile = require('pbf/compile');
const schema = require('protocol-buffers-schema');

const proto = schema.parse(fs.readFileSync('index.proto'));
const InfoPoints = compile(proto).InfoPoints;

const points = [];

const files = fs.readdirSync('../points/')
    .filter(name => name.endsWith('.yaml'))
    .map(name => `../points/${name}`);

for (const file of files) {
    console.log(`reading: ${file}`);

    for (const entry of YAML.parse(fs.readFileSync(file, 'utf8'))) {
        const point = {
            methods: [],
            threads: [],
            description: marked.parseInline(entry.description, { gfm: true, breaks: true }).trim(),
        };
        if (entry.method) point.methods.push(entry.method);
        if (entry.methods) point.methods.push(...entry.methods);
        if (entry.thread) point.threads.push(entry.thread);
        if (entry.threads) point.threads.push(...entry.threads);
        points.push(point);
    }
}

if (!fs.existsSync('../out')){
    fs.mkdirSync('../out');
}

fs.writeFile('../out/points.json', JSON.stringify({ points }), 'utf8', () => {});
fs.writeFile('../out/points-pretty.json', JSON.stringify({ points }, null, 2), 'utf8', () => {});

const writer = new Pbf();
InfoPoints.write({ points }, writer);
fs.writeFile('../out/points.wasm', writer.finish(), 'utf8', () => {});

console.log('done');
