// A simple Netlify serverless function
exports.handler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Hello World from Netlify Function!",
        timestamp: new Date().toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred" }),
    };
  }
};
