import nodemailer from "nodemailer";

export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Parse the incoming request body
    const { orderId, cartItems, totalAmount, customerInfo, deliveryInfo } = JSON.parse(event.body);

    // Validate required fields
    if (!orderId || !cartItems || !totalAmount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required order data: orderId, cartItems, or totalAmount" })
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

    // Add customer info if provided
    if (customerInfo) {
      emailMessage += `📋 CUSTOMER INFORMATION:\n`;
      emailMessage += `Name: ${customerInfo.name}\n`;
      emailMessage += `Phone: ${customerInfo.phone}\n`;
      if (customerInfo.email) {
        emailMessage += `Email: ${customerInfo.email}\n`;
      }
      emailMessage += `\n`;
    }

    // Add delivery info if provided
    if (deliveryInfo) {
      emailMessage += `🚚 DELIVERY INFORMATION:\n`;
      emailMessage += `Method: ${deliveryInfo.method}\n`;
      emailMessage += `Address: ${deliveryInfo.address}\n`;
      if (deliveryInfo.notes) {
        emailMessage += `Notes: ${deliveryInfo.notes}\n`;
      }
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Send email
    await transporter.sendMail({
      from: `"Tazerwa Orders" <${process.env.SMTP_USER}>`,
      to: process.env.ORDER_RECEIVER,
      subject: `🛒 New Order ${orderId} - RWF ${totalAmount.grandTotal.toLocaleString()}`,
      text: emailMessage
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: "Order email sent successfully" 
      })
    };

  } catch (error) {
    console.error("EMAIL ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to send email",
        details: error.message 
      })
    };
  }
}