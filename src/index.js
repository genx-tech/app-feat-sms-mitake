const {
    Feature,
    Helpers: { requireConfig },
} = require('@genx/app');
const { ExternalServiceError } = require('@genx/error');
const superagent = require('superagent');

/**
 * Mitake SMS feature
 * @module Feature_SmsMitake
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
     * @property {string} options.username - The USERNAME param.
     * @property {string} options.password - The PASSWORD param.
     * @property {string} options.domain - The DOMAIN param.
     * @property {string} options.from - The FROM param.
     * @see {@link https://www.twilio.com/docs/glossary/what-e164|E.164}
     * @returns {Promise.<*>}
     *
     * @example
     *
     * username: '<USERNAME>',
     * password: '<PASSWORD>'
     * domain: '<DOMAIN>'
     * from: '<FROM>'
     */
    load_: async function (app, options, name) {
        requireConfig(app, options, ['username', 'password', 'domain', 'from'], name);

        const { username, password, domain, from } = options;

        const authQuery = { username, password };
        const client = superagent;

        const service = {
            from,
            viewCredit_: async (number) => {
                try {
                    const SmQuery = new URL('/api/mtk/SmQuery', domain).href;
                    const res = await client.post(SmQuery).query(authQuery).query(number);
                    const results = res.text.split('\r\n');
                    const statuscode = (results.find(res => res.includes('statuscode')))?.replace('statuscode=', '');
                    const error = (results.find(res => res.includes('Error')))?.replace('Error=', '');
                    const AccountPoint = (results.find(res => res.includes('AccountPoint')))?.replace('AccountPoint=', '');
                    const info = {};
                    if (AccountPoint) {
                        info.dateCreated = { AccountPoint };
                    }
                    if (statuscode && error) {
                        info.errorMessage = { statuscode, errorMessage: error };
                    }

                    return info;
                } catch (error) {
                    throw new ExternalServiceError(
                        'Failed to check credit point via mitake.',
                        error
                    );
                }
            },
            smsSend_: async (to, body) => {
                try {
                    const sendMultiple = Array.isArray(to);
                    const apiPath = sendMultiple ? '/api/mtk/SmBulkSend' : '/api/mtk/SmSend';
                    const sendSmsUrl = new URL(apiPath, domain).href;
                    let res;
                    if (sendMultiple) {
                        const parsedToList = to.map(user => {
                            const { ClientID, dstaddr, dlvtime, vldtime, destname, response } = user;
                            const parsedData = [ClientID, dstaddr, dlvtime, vldtime, destname, response, body].join('$$');
                            return parsedData;
                        });
                        const encodingPostIn = { Encoding_PostIn: "UTF8" };
                        const parsedBody = parsedToList.join("\r\n");
                        res = await client.post(sendSmsUrl).query(authQuery).query(encodingPostIn).send(parsedBody);
                    }
                    else {
                        const encodedBody = { smbody: body };
                        const encodingPostIn = { CharsetURL: "UTF8" };
                        res = await client.post(sendSmsUrl).query(authQuery).query(encodingPostIn).query(to).query(encodedBody);
                    }
                    
                    const result = res?.text || '';
                    const info = {};
                    const userList = result.split(/\[[0-9]+\]/).filter(text => text!== '');
                    const results = userList.map(user => {
                        const userDetail = user.split("\r\n").filter(text => text!== '');
                        const msgid = (userDetail.find(res => res.includes('msgid')))?.replace('msgid=', '');
                        const statuscode = (userDetail.find(res => res.includes('statuscode')))?.replace('statuscode=', '');
                        const AccountPoint = ((result.split("\r\n").filter(text => text!== '')).find(res => res.includes('AccountPoint')))?.replace('AccountPoint=', '');
                        return {msgid, statuscode, AccountPoint}
                    });
                    const errorcode = (userList.find(res => res.includes('statuscode')))?.replace('statuscode=', '');
                    const error = (userList.find(res => res.includes('Error')))?.replace('Error=', '');

                    if (results.length > 0) {
                        info.dateCreated = results;
                    }
                    if (errorcode && error) {
                        info.errorMessage = { statuscode: errorcode, errorMessage: error };
                    }
                    return info;
                } catch (error) {
                    throw new ExternalServiceError(
                        'Failed to send sms via mitake.',
                        error
                    );
                }
            },
        };

        app.registerService(name, service);
    },
};
