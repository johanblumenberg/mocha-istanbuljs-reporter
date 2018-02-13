var INSTRUMENTER = require('istanbul-lib-instrument'),
    convert = require('convert-source-map'),
    sourceMapSupport = require('source-map-support'),
    { SourceMapConsumer, SourceMapGenerator } = require('source-map'),
    Module = require('module'),
    glob = require('glob'),
    path = require('path');

sourceMapSupport.install({
    environment: 'node',
    hookRequire: true
});

installInstrumenter();

function installInstrumenter() {
    var include = process.env.ISTANBUL_INSTRUMENT_SOURCES || '**/*.js';
    var instrumentSources = glob.sync(include).map(file => path.join(process.cwd(), file));
    var codeCache = {};

    var instrumenter = INSTRUMENTER.createInstrumenter({
        compact: false,
        esModules: true,
        produceSourceMap: true,
    });

    function shouldInstrument(filename) {
        return instrumentSources.indexOf(filename) >= 0;
    }
        
    function instrument(code, filename) {
        const code2 = instrumenter.instrumentSync(code, filename);
        const outputSourceMap = new SourceMapConsumer(instrumenter.lastSourceMap());
        const combinedSourceMap = SourceMapGenerator.fromSourceMap(outputSourceMap);

        const inputSourceMap = convert.fromSource(code);
        if (inputSourceMap) {
            combinedSourceMap.applySourceMap(new SourceMapConsumer(inputSourceMap.toObject()), filename);
        }

        return code2.replace(/\/\/# sourceMappingURL=.*$/, '') + convert.fromObject(combinedSourceMap).toComment();
    }

    const _compile = Module.prototype._compile;
    Module.prototype._compile = function (code, fileName) {
        if (shouldInstrument(fileName)) {
            if (codeCache[fileName]) {
                code = codeCache[fileName];
            } else {
                code = codeCache[fileName] = instrument(code, fileName);
            }
        }
        return _compile.call(this, code, fileName);
    };
}
