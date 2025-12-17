import nodemailer from "nodemailer";

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { orderId, cartItems, totalAmount, customerInfo, deliveryInfo } = JSON.parse(event.body);

    if (!orderId || !cartItems || !totalAmount) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required data" })
      };
    }

    // Build email content
    let emailMessage = `🛒 NEW TAZERWA ORDER\n\n`;
    emailMessage += `Order ID: ${orderId}\n`;
    emailMessage += `Date: ${new Date().toLocaleString()}\n\n`;
    emailMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    emailMessage += `ORDER ITEMS:\n`;
    emailMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    cartItems.forEach(item => {
      emailMessage += `• ${item.name} × ${item.quantity} = RWF ${item.total.toLocaleString()}\n`;
    });

    emailMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    emailMessage += `Subtotal: RWF ${totalAmount.subtotal.toLocaleString()}\n`;
    emailMessage += `Delivery: RWF ${totalAmount.deliveryFee.toLocaleString()}\n`;
    emailMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    emailMessage += `GRAND TOTAL: RWF ${totalAmount.grandTotal.toLocaleString()}\n`;
    emailMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (customerInfo) {
      emailMessage += `📋 CUSTOMER:\n`;
      emailMessage += `Name: ${customerInfo.name}\n`;
      emailMessage += `Phone: ${customerInfo.phone}\n`;
      if (customerInfo.email) emailMessage += `Email: ${customerInfo.email}\n`;
      emailMessage += `\n`;
    }

    if (deliveryInfo) {
      emailMessage += `🚚 DELIVERY:\n`;
      emailMessage += `Method: ${deliveryInfo.method}\n`;
      emailMessage += `Address: ${deliveryInfo.address}\n`;
      if (deliveryInfo.notes) emailMessage += `Notes: ${deliveryInfo.notes}\n`;
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
      subject: `🛒 Order ${orderId} - RWF ${totalAmount.grandTotal.toLocaleString()}`,
      text: emailMessage
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Email sent" })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to send email", details: error.message })
    };
  }
};