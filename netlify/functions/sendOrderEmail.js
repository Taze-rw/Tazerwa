import nodemailer from "nodemailer";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { subject, message } = JSON.parse(event.body);

    if (!subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing data" })
      };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Tazerwa Orders" <${process.env.SMTP_USER}>`,
      to: process.env.ORDER_RECEIVER,
      subject,
      text: message
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
