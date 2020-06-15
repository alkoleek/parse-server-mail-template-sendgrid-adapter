import fs from 'fs';

module.exports = mailOptions => {
  if (!mailOptions || !mailOptions.adapter) {
    throw 'MailTemplateAdapter requires an adapter';
  }

  const { adapter, apiKey, fromAddress } = mailOptions;

  if (!mailOptions.template) {
    return mailOptions.adapter;
  }

  if (!fromAddress) {
    throw 'MailTemplateAdapter requires a fromAddress';
  }
  if (!apiKey) {
    throw 'MailTemplateAdapter requires a apiKey';
  }

  const customized = {};

  if (mailOptions.template.verification) {
    const { templateId } = mailOptions.template.verification;

    if (!templateId) {
      throw 'MailTemplateAdapter requires a template id';
    }

    customized.sendVerificationEmail = options =>
      sendTemplate({
        link: options.link,
        email: options.user.get('email'),
        username: options.user.get('username'),
        appName: options.appName,
        templateId,
        apiKey,
        fromAddress
      });
  }

  if (mailOptions.template.resetPassword) {
    const { templateId } = mailOptions.template.resetPassword;

    if (!templateId) {
      throw 'MailTemplateAdapter requires a template id';
    }

    customized.sendPasswordResetEmail = options =>
      sendTemplate({
        link: options.link,
        email: options.user.get('email'),
        username: options.user.get('username'),
        appName: options.appName,
        templateId,
        apiKey,
        fromAddress
      });
  }

  return Object.freeze(Object.assign(customized, adapter));
};

const replacePlaceHolder = (text, options) =>
  text
    .replace(/%email%/g, options.user.get('email'))
    .replace(/%username%/g, options.user.get('username'))
    .replace(/%appname%/g, options.appName)
    .replace(/%link%/g, options.link);

function sendTemplate(params) {
  const sendgrid = require('@sendgrid/mail');
  sendgrid.setApiKey(params.apiKey);

  const { email, link, username, appName, fromAddress, templateId } = params;
  const msg = {
    to: email,
    from: fromAddress,

    templateId: templateId,
    dynamic_template_data: {
        'link': link,
        'email': email,
        'username': username,
        'appname': appName
    },
  };

  return sendgrid.send(msg);
}
