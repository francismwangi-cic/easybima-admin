const nodemailer = require("nodemailer");
const twilio = require("twilio");

class NotificationService {
  constructor() {
    // Email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // SMS client
    this.smsClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // Send email
  async sendEmail({ to, subject, text, html, attachments = [] }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
        attachments,
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Send SMS
  async sendSMS({ to, message }) {
    try {
      const result = await this.smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });

      return { success: true, sid: result.sid };
    } catch (error) {
      console.error("SMS sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Send payment reminder
  async sendPaymentReminder(client, policy, payment) {
    const emailSubject = `Payment Reminder - Policy ${policy.policyNumber}`;
    const emailText = `Dear ${client.firstName} ${client.lastName},

This is a friendly reminder that your payment of ${payment.amount} for policy ${policy.policyNumber} is due on ${payment.dueDate}.

Please make your payment to avoid any interruption in coverage.

Thank you.`;

    const smsMessage = `Payment reminder: ${payment.amount} due for policy ${policy.policyNumber} on ${payment.dueDate}. Please pay to maintain coverage.`;

    const results = [];

    // Send email
    if (client.email) {
      const emailResult = await this.sendEmail({
        to: client.email,
        subject: emailSubject,
        text: emailText,
      });
      results.push({ type: "email", ...emailResult });
    }

    // Send SMS
    if (client.phoneNumber) {
      const smsResult = await this.sendSMS({
        to: client.phoneNumber,
        message: smsMessage,
      });
      results.push({ type: "sms", ...smsResult });
    }

    return results;
  }

  // Send policy expiry reminder
  async sendPolicyExpiryReminder(client, policy) {
    const emailSubject = `Policy Expiry Reminder - ${policy.policyNumber}`;
    const emailText = `Dear ${client.firstName} ${client.lastName},

Your policy ${policy.policyNumber} is due to expire on ${policy.policyEndDate}.

Please contact us to renew your policy and maintain continuous coverage.

Thank you.`;

    const smsMessage = `Policy ${policy.policyNumber} expires on ${policy.policyEndDate}. Contact us to renew.`;

    const results = [];

    if (client.email) {
      const emailResult = await this.sendEmail({
        to: client.email,
        subject: emailSubject,
        text: emailText,
      });
      results.push({ type: "email", ...emailResult });
    }

    if (client.phoneNumber) {
      const smsResult = await this.sendSMS({
        to: client.phoneNumber,
        message: smsMessage,
      });
      results.push({ type: "sms", ...smsResult });
    }

    return results;
  }

  // Send document by email
  async sendDocumentByEmail(client, document, filePath) {
    const emailSubject = `Document: ${document.documentType} - ${document.originalName}`;
    const emailText = `Dear ${client.firstName} ${client.lastName},

Please find attached your ${document.documentType} document.

If you have any questions, please don't hesitate to contact us.

Thank you.`;

    return await this.sendEmail({
      to: client.email,
      subject: emailSubject,
      text: emailText,
      attachments: [
        {
          filename: document.originalName,
          path: filePath,
        },
      ],
    });
  }
}

module.exports = new NotificationService();
