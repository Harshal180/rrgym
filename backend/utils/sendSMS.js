const axios = require("axios");

const sendSMS = async (mobile, message) => {
    try {
        await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route: "q",
                message: message + " RR_Gym",
                language: "english",
                numbers: mobile,
            },
            {
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("SMS sent to:", mobile);
    } catch (error) {
        console.error("SMS error:", error.response?.data || error.message);
    }
};

module.exports = sendSMS;
