const {
    Feature,
    Helpers: { requireConfig },
} = require('@genx/app');
const { ExternalServiceError } = require('@genx/error');

/**
 * Twilio SMS feature
 * @module Feature_SmsTwilio
 */

module.exports = {
    /**
     * This feature is loaded at service stage
     * @member {string}
     */
    type: Feature.SERVICE,

    /**
     * This feature can be grouped by serviceGroup
     * @member {boolean}
     */
    groupable: true,

    /**
     * Load the feature
     * @param {App} app - The app module object
     * @param {object} options - Options for the feature
     * @property {string} options.accountSid - The ACCOUNT SID param.
     * @property {string} options.authToken - The AUTH TOKEN param.
     * @property {string} options.from - The from param, e.g. +14155552671
     * @see {@link https://www.twilio.com/docs/glossary/what-e164|E.164}
     * @returns {Promise.<*>}
     *
     * @example
     *
     * accountSid: '<ACCOUNT SID>',
     * authToken: '<AUTH TOKEN>'
     */
    load_: async function (app, options, name) {
        requireConfig(app, options, ['accountSid', 'authToken', 'from'], name);

        const { accountSid, authToken, from } = options;
        const Twilio = app.tryRequire('twilio');

        const client = new Twilio(accountSid, authToken);

        const service = {
            from,
            sendSms_: async (to, body) => {
                try {
                    return await client.messages.create({ from, to, body });
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
