import nodemailer from "nodemailer";

export async function handler(event) {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { orderId, cartItems, totalAmount } = JSON.parse(event.body);

  if (!orderId || !cartItems || !totalAmount) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing order data" })
    };
  }

  // send email here

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };

  try {
    const { subject, message } = JSON.parse(event.body);

    if (!subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing subject or message" })
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
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
      body: JSON.stringify({ error: "Email failed" })
    };
  }
}
