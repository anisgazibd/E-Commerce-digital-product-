export default async function handler(req, res) {

// শুধুমাত্র POST request গ্রহণ করবে
if (req.method !== "POST") {

    return res.status(405).json({
        success: false,
        message: "Method Not Allowed"
    });

}


try {

    const {
        name,
        email,
        phone,
        method,
        senderPhone,
        trxId,
        productTitle,
        totalAmount
    } = req.body || {};


    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (
        !name ||
        !email ||
        !phone ||
        !method ||
        !senderPhone ||
        !trxId ||
        !productTitle ||
        totalAmount === undefined
    ) {

        return res.status(400).json({
            success: false,
            message: "সব প্রয়োজনীয় তথ্য দিন।"
        });

    }


    const amount = Number(totalAmount);


    if (!Number.isFinite(amount) || amount <= 0) {

        return res.status(400).json({
            success: false,
            message: "Invalid amount."
        });

    }


    // =========================================
    // ENVIRONMENT VARIABLES
    // =========================================

    const BOT_TOKEN =
        process.env.TELEGRAM_BOT_TOKEN;

    const CHAT_ID =
        process.env.TELEGRAM_CHAT_ID;


    if (!BOT_TOKEN || !CHAT_ID) {

        console.error(
            "Telegram environment variables are missing."
        );

        return res.status(500).json({
            success: false,
            message: "Server configuration error."
        });

    }


    // =========================================
    // ORDER ID
    // =========================================

    const orderId =
        "ORD-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();


    // =========================================
    // ORDER DATE
    // =========================================

    const orderDate =
        new Date().toISOString();


    // =========================================
    // TELEGRAM MESSAGE
    // =========================================

    const message = `

🛒 নতুন ডিজিটাল অর্ডার

━━━━━━━━━━━━━━━━━━

🆔 Order ID:
${orderId}

📦 Product:
${productTitle}

💰 Amount:
৳${amount}

👤 Customer:
${name}

📧 Email:
${email}

📞 Phone:
${phone}

💳 Payment Method:
${method}

📱 Sender Number:
${senderPhone}

🔑 TrxID:
${trxId}

🕒 Time:
${orderDate}

━━━━━━━━━━━━━━━━━━
`;

    // =========================================
    // TELEGRAM API
    // =========================================

    const telegramResponse = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message
            })
        }
    );


    const telegramData =
        await telegramResponse.json();


    if (!telegramResponse.ok ||
        !telegramData.ok) {

        console.error(
            "Telegram error:",
            telegramData
        );

        return res.status(502).json({
            success: false,
            message:
                "Order notification failed."
        });

    }


    // =========================================
    // RESPONSE
    // =========================================

    return res.status(200).json({

        success: true,

        message:
            "Order submitted successfully.",

        orderId: orderId,

        order: {
            name,
            email,
            phone,
            method,
            senderPhone,
            trxId,
            productTitle,
            totalAmount: amount,
            date: orderDate
        }

    });


} catch (error) {

    console.error(
        "Order API Error:",
        error
    );


    return res.status(500).json({

        success: false,

        message:
            "Server error. Please try again."

    });

}

}
