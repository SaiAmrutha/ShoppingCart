const express = require("express");
const stripe = require("stripe")(
  "sk_test_51QS14QRxv517xGDu1MZUJ6NW8kZzYHdpqeWj1VvS5ucLviQDgss4WdVD9KWqfa9YY2AARcdbxA0jQexEP40LcHx100TPQwmSK8"
);
// ! CORS (Cross-Origin Resource Sharing)
// ? If the backend and frontend run on different ports (5500 for the frontend and 3000 for the backend), you might encounter CORS (Cross-Origin Resource Sharing) issues.
// ! So to prevent that we are enabling CORS in Backend
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json()); //parsing JSON bodies

// ! route for creating checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    // creating line items for stripe checkout
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // stripe's checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://127.0.0.1:5500/success.html",
      cancel_url: "http://127.0.0.1:5500/cancel.html",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("backend server running at http://127.0.0.1:3000");
});
