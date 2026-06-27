const fs = require('fs');
const nodemailer = require('nodemailer');

const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2].replace(/"/g, '').trim();
  }
});

async function testEmail() {
  console.log("SMTP_USER:", envVars['SMTP_USER']);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: envVars['SMTP_USER'],
      pass: envVars['SMTP_PASSWORD'],
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Dexze Portal Test" <${envVars['SMTP_USER']}>`,
      to: envVars['SMTP_USER'], // Send to self
      subject: "Test Email from Dexze Portal",
      text: "This is a test email to verify Nodemailer configuration.",
    });
    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

testEmail();
