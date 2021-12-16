'use strict';

require('source-map-support/register');

const {
    Feature,
    Helpers: { requireConfig },
} = require('@genx/app');

const { ExternalServiceError } = require('@genx/error');

module.exports = {
    type: Feature.SERVICE,
    groupable: true,
    load_: async function (app, options, name) {
        requireConfig(app, options, ['accountSid', 'authToken', 'from'], name);
        const { accountSid, authToken, from } = options;
        const Twilio = app.tryRequire('twilio');
        const client = new Twilio(accountSid, authToken);
        const service = {
            from,
            sendSms_: async (to, body) => {
                try {
                    return await client.messages.create({
                        from,
                        to,
                        body,
                    });
                } catch (error) {
                    throw new ExternalServiceError(
                        'Failed to send sms via twilio.',
                        error
                    );
                }
            },
        };
        app.registerService(name, service);
    },
};
//# sourceMappingURL=index.js.map
