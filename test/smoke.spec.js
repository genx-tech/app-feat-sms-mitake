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
        await suite.testCase("send single sms test", async () => {                 
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

                // const singleResult = await mitake.smsSend_(singleSms, body);
                // console.log('singleResult: ', singleResult);
                // should.exist(singleResult);
                // should.exist(singleResult.dateCreated);
                // should.equal(singleResult.errorMessage, undefined)

                const multiResult = await mitake.smsSend_(multipleSms, body);
                console.log('multiResult: ', multiResult);
                should.exist(multiResult);
                should.exist(multiResult.dateCreated);
                should.
                should.equal(multiResult.errorMessage, undefined)
            });
        });
    }, 
    { verbose: true }
);
