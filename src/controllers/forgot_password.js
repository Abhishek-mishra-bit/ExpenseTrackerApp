const Sib = require("sib-api-v3-sdk");
require("dotenv").config();
const path = require("path");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    const id = uuidv4();
    const forgotPasswordRequest = new ForgotPasswordRequest({
      _id: id,
      userId: user._id,
      isActive: true,
    });
    await forgotPasswordRequest.save();

    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
    const tranEmailApi = new Sib.TransactionalEmailsApi();

    const sender = { email: 'noreply@expensetracker.com', name: 'Expense Tracker' };
    const receivers = [{ email }];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Reset Your Password',
      htmlContent: `<h1>Password Reset Request</h1>
                    <p>Click the link below to reset your password.</p>
                    <a href="http://localhost:3000/password/reset-password/${id}">Reset Password</a>
                    <p>This link is valid for 1 hour.</p>`,
    });

    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

exports.resetPasswordPage = async (req, res) => {
  try {
    const { id } = req.params;
    const passwordRequest = await ForgotPasswordRequest.findById(id);

    if (passwordRequest && passwordRequest.isActive) {
        res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
        </head>
        <body>
            <h1>Reset Your Password</h1>
            <form action="/password/update-password/${id}" method="POST">
                <label for="password">New Password:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Update Password</button>
            </form>
        </body>
        </html>
      `);
    } else {
      res.status(400).send('<h1>Invalid or expired password reset link.</h1>');
    }
  } catch (err) {
    console.error('Reset Password Page Error:', err);
    res.status(500).send('<h1>Error loading reset password page.</h1>');
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const passwordRequest = await ForgotPasswordRequest.findById(id);

    if (!passwordRequest || !passwordRequest.isActive) {
      return res.status(400).json({ message: 'Invalid or expired password reset link.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.findByIdAndUpdate(passwordRequest.userId, {
      password: hashedPassword,
    });

    passwordRequest.isActive = false;
    await passwordRequest.save();

    res.status(200).json({ message: 'Password has been updated successfully.' });
  } catch (err) {
    console.error('Update Password Error:', err);
    res.status(500).json({ message: 'Something went wrong while updating the password.' });
  }
};
