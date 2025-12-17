import nodemailer from "nodemailer";

export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "Tazerwa Orders <tazerwa@gmail.com>",
      to: data.email,
      subject: "Your Tazerwa Order Summary",
      html: `
        <h2>Thank you for your order</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <h3>Order Items:</h3>
        <ul>
          ${data.items.map(item =>
            `<li>${item.name} x ${item.quantity} — ${item.price} RWF</li>`
          ).join("")}
        </ul>
        <h3>Total: ${data.total} RWF</h3>
      `
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
