const sib = require("sib-api-v3-sdk");

exports.resetPasswordUtil = async (uuid, name, email) => {
  try {
    const client = sib.ApiClient.instance;
    apiKey = client.authentications["api-key"];

    apiKey.apiKey = process.env.PASSWORD_RESET_API_KEY;
    const transEmailApi = new sib.TransactionalEmailsApi();

    const sender = {
      email: "harshavardhan9143@gmail.com",
    };

    const receiver = [
      {
        email,
      },
    ];

    const trans = await transEmailApi.sendTransacEmail({
      sender,
      to: receiver,
      subject: "password reset link",
      textContent: "Click on the link to reset your password",
      htmlContent: `<h2>Hello ${name},</h2>
        <p>Click the button below to reset your password:</p>
        <a href="http://localhost:4000/auth/password-reset?uuid=${uuid}" 
           style="display:inline-block;padding:10px 15px;background:#007bff;color:white;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>`,
    });

    return trans;
  } catch (error) {
    console.log("error while resetting password>>>>>", error.message);
    return false;
  }
};
