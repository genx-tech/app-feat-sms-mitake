const testSuite = require("@genx/test");

testSuite(
    __filename,
    async (suite) => {
        await suite.testCase("smoke test", async () => {                 
            await suite.startWorker_(async (app) => {
                const mitake = app.getService('mitake');
                should.exist(mitake);
                const result = await mitake.viewCredit_();
                should.exist(result);
                should.exist(result.dateCreated);
                should.equal(result.errorMessage, undefined);
            });
        });
        await suite.testCase("send sms test", async () => {                 
            await suite.startWorker_(async (app) => {
                const body = "這是簡訊測試，this is sms testing.";
                const singleSms = { 
                    ClientID: null,
                    dstaddr: '0900311212',
                    dlvtime: null,
                    vldtime: null,
                    destname: null
                };
                const multipleSms = [
                    { 
                        ClientID: null,
                        dstaddr: '0900311212',
                        dlvtime: null,
                        vldtime: null,
                        destname: null
                    },
                    { 
                        ClientID: null,
                        dstaddr: '0900311212',
                        dlvtime: null,
                        vldtime: null,
                        destname: null
                    }
                ];

                const mitake = app.getService('mitake');
                should.exist(mitake);

                // sending single sms
                const singleResult = await mitake.sendSms_(singleSms, body);
                should.exist(singleResult);
                should.exist(singleResult.dateCreated);
                should.equal(singleResult.errorMessage, undefined)

                // sending multiple sms in once
                const multiResult = await mitake.sendSms_(multipleSms, body);
                should.exist(multiResult);
                should.exist(multiResult.dateCreated);
                should.equal(multiResult.errorMessage, undefined)
            });
        });
    }, 
    { verbose: true }
);
