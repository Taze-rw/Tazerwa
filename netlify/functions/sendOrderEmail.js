import nodemailer from "nodemailer";

export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Tazerwa Orders" <${process.env.EMAIL_USER}>`,
      to: "tazerwa@gmail.com",
      subject: "New Order Received",
      html: `
        <h2>New Order</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
