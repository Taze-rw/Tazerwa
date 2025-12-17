// TEST VERSION - Use this temporarily to verify your order flow works
// This bypasses email sending and just logs the order

export async function handler(event) {
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
        body: JSON.stringify({ 
          error: "Missing required order data",
          received: { orderId: !!orderId, cartItems: !!cartItems, totalAmount: !!totalAmount }
        })
      };
    }

    // Build order summary for logging
    const orderSummary = {
      orderId,
      timestamp: new Date().toISOString(),
      items: cartItems,
      totals: totalAmount,
      customer: customerInfo,
      delivery: deliveryInfo
    };

    // Log to Netlify console (you can view this in Netlify Functions logs)
    console.log("=".repeat(50));
    console.log("NEW ORDER RECEIVED");
    console.log("=".repeat(50));
    console.log(JSON.stringify(orderSummary, null, 2));
    console.log("=".repeat(50));

    // Simulate successful email send
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: "Order received successfully (TEST MODE - no email sent)",
        orderId: orderId,
        testMode: true
      })
    };

  } catch (error) {
    console.error("ERROR:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to process order",
        details: error.message
      })
    };
  }
}