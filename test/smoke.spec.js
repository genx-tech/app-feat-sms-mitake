const testSuite = require("@genx/test");

testSuite(
    __filename,
    function (suite) {
        suite.testCase("smoke test", async function () {                 
            suite.startWorker_(async (app) => {
                const twilio = app.getService('twilio');
                should.exist(twilio);

                const result = await twilio.sendSms_(null /** to be replaced by a verified number */, 'test from sandbox');
                should.exist(result);
                should.exist(result.dateCreated);
                should.not.exist(result.errorMessage);
            });
        });
    }, 
    { verbose: true }
);
