import nodemailer from "nodemailer";

export const sendEmailToUser = async (email: string, newToken: string) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials are missing in environment variables");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password/${newToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      text: `Reset your password using this link: ${resetLink}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.response);

    return {
      success: true,
      message: "Email sent successfully",
    };

  } catch (error: any) {
    console.error("❌ Error sending email:", error.message);

    if (error.response) {
      console.error("SMTP Response:", error.response);
    }

    return {
      success: false,
      message: error.message,
    };
  }
};