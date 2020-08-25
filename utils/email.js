const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

//new Email(user, url).sendWelcome()

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Fadillah Azhar <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // return nodemailer.createTransport(
      //   mandrillTransport({
      //     auth: {
      //       apiKey: 'D29rsoAqdHnIpJVN0vqY2w'
      //     }
      //   })
      // );
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    //1. Create html template
    const html = pug.renderFile(`${__dirname}/../view/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    //2. Create email option
    const emailContent = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };
    //3. Send email
    await this.createTransport().sendMail(emailContent);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family!');
  }

  async resetPassword() {
    await this.send(
      'resetPassword',
      'Reset your password (only valid for 10 minutes!)'
    );
  }
};
