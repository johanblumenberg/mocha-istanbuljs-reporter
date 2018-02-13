var COVERAGE = require('istanbul-lib-coverage'),
    API = require('istanbul-api'),

/**
 * Expose `Istanbul`.
 */
exports = module.exports = Istanbul;

/**
 * Initialize a new Istanbul reporter.
 *
 * @param {Runner} runner
 * @public
 */
function Istanbul(runner) {

    runner.on('end', function(){

        var reporters;
        if (process.env.ISTANBUL_REPORTERS) {
            reporters = process.env.ISTANBUL_REPORTERS.split(',');
        } else {
            reporters = ['text-summary', 'html'];
        }

        var reportDir = process.env.ISTANBUL_REPORT_DIR || './coverage',
            cov = global.__coverage__ || {},
            coverageMap = COVERAGE.createCoverageMap();

        coverageMap.merge(cov);

        var reporter = API.createReporter(API.config.loadObject(API.config.defaultConfig().reporting, {
            dir: reportDir
        }));
        reporter.addAll(reporters);

        reporter.write(coverageMap, {});
    });

}
