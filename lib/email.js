import nodemailer from "nodemailer";

export async function sendContactEmail({ name, email, message }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("No EMAIL_USER or EMAIL_PASS provided. Skipping email alert.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">New Message from Welth Contact Form</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return false;
  }
}

export async function sendBudgetAlertEmail({ to, subject, category, spent, budget, percentage, insights }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("No EMAIL_USER or EMAIL_PASS provided. Skipping email alert.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <div style="background-color: #000000; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #111111; padding: 40px; border: 1px solid #222222; border-radius: 16px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #222222; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 20px;">🚨</span>
          </div>
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Budget Alert</h1>
          <p style="color: #A1A1AA; font-size: 15px; margin-top: 8px; margin-bottom: 0;">${category}</p>
        </div>
        
        <p style="color: #E4E4E7; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          You have reached <span style="color: #EF4444; font-weight: 600;">${percentage.toFixed(0)}%</span> of your monthly budget for this category.
        </p>
        
        <table style="width: 100%; background-color: #000000; border: 1px solid #222222; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-collapse: collapse;">
          <tr>
            <td style="color: #A1A1AA; font-size: 14px; font-weight: 500; padding-bottom: 16px; border-bottom: 1px solid #222222;">Amount Spent</td>
            <td style="color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: right; padding-bottom: 16px; border-bottom: 1px solid #222222;">$${spent.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA; font-size: 14px; font-weight: 500; padding-top: 16px;">Total Budget</td>
            <td style="color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: right; padding-top: 16px;">$${budget.toFixed(2)}</td>
          </tr>
        </table>

        <div style="background-color: #18181B; padding: 24px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">Welth Insights</h3>
          <p style="color: #A1A1AA; font-size: 14px; line-height: 1.5; margin: 0;">
            ${insights || 'To stay on track, consider pausing non-essential spending in this category until next month. Review your recent transactions to see where you can cut back.'}
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #FFFFFF; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: -0.2px;">Review Dashboard</a>
        </div>
        
        <p style="color: #52525B; font-size: 12px; text-align: center; margin-top: 40px; margin-bottom: 0;">
          Sent automatically by Welth App.
        </p>
      </div>
    </div>
  `;

  try {
    const data = await transporter.sendMail({
      from: `"Welth Alerts" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Budget alert email sent:", data.messageId);
    return data;
  } catch (error) {
    console.error("Failed to send budget alert email:", error);
  }
}

export async function sendUnusualSpendEmail({ to, subject, category, amount, average, insights }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("No EMAIL_USER or EMAIL_PASS provided. Skipping email alert.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <div style="background-color: #000000; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #111111; padding: 40px; border: 1px solid #222222; border-radius: 16px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #222222; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 20px;">⚠️</span>
          </div>
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Unusual Spend</h1>
          <p style="color: #A1A1AA; font-size: 15px; margin-top: 8px; margin-bottom: 0;">${category}</p>
        </div>
        
        <p style="color: #E4E4E7; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          We noticed an unusually large transaction that is significantly higher than your average.
        </p>
        
        <table style="width: 100%; background-color: #000000; border: 1px solid #222222; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-collapse: collapse;">
          <tr>
            <td style="color: #A1A1AA; font-size: 14px; font-weight: 500; padding-bottom: 16px; border-bottom: 1px solid #222222;">Amount Spent</td>
            <td style="color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: right; padding-bottom: 16px; border-bottom: 1px solid #222222;">$${amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA; font-size: 14px; font-weight: 500; padding-top: 16px;">Average Spend</td>
            <td style="color: #FFFFFF; font-size: 15px; font-weight: 600; text-align: right; padding-top: 16px;">$${average.toFixed(2)}</td>
          </tr>
        </table>

        <div style="background-color: #18181B; padding: 24px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">Welth Insights</h3>
          <p style="color: #A1A1AA; font-size: 14px; line-height: 1.5; margin: 0;">
            ${insights || 'Unexpected large charges could be a sign of unauthorized access or a forgotten subscription renewal. If you don\'t recognize this transaction, investigate immediately.'}
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #FFFFFF; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: -0.2px;">Review Accounts</a>
        </div>
        
        <p style="color: #52525B; font-size: 12px; text-align: center; margin-top: 40px; margin-bottom: 0;">
          Sent automatically by Welth App.
        </p>
      </div>
    </div>
  `;

  try {
    const data = await transporter.sendMail({
      from: `"Welth Alerts" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Unusual spend alert email sent:", data.messageId);
    return data;
  } catch (error) {
    console.error("Failed to send unusual spend alert email:", error);
  }
}

export async function sendLowBalanceEmail({ to, subject, accountName, projectedBalance, threshold, insights }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("No EMAIL_USER or EMAIL_PASS provided. Skipping email alert.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <div style="background-color: #000000; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #111111; padding: 40px; border: 1px solid #222222; border-radius: 16px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #220000; border: 1px solid #440000; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 20px;">📉</span>
          </div>
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Low Balance</h1>
          <p style="color: #A1A1AA; font-size: 15px; margin-top: 8px; margin-bottom: 0;">${accountName}</p>
        </div>
        
        <p style="color: #E4E4E7; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          Based on upcoming recurring expenses, your balance is projected to drop below <span style="color: #FFFFFF; font-weight: 600;">$${threshold.toFixed(2)}</span> within 7 days.
        </p>
        
        <table style="width: 100%; background-color: #000000; border: 1px solid #222222; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-collapse: collapse;">
          <tr>
            <td style="color: #A1A1AA; font-size: 14px; font-weight: 500; padding-top: 5px; padding-bottom: 5px;">Projected Balance</td>
            <td style="color: #EF4444; font-size: 15px; font-weight: 600; text-align: right; padding-top: 5px; padding-bottom: 5px;">$${projectedBalance.toFixed(2)}</td>
          </tr>
        </table>

        <div style="background-color: #18181B; padding: 24px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">Welth Insights</h3>
          <p style="color: #A1A1AA; font-size: 14px; line-height: 1.5; margin: 0;">
            ${insights || 'Avoid expensive overdraft fees. Log in to quickly transfer funds into this account or pause any upcoming scheduled payments.'}
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #FFFFFF; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: -0.2px;">Transfer Funds</a>
        </div>
        
        <p style="color: #52525B; font-size: 12px; text-align: center; margin-top: 40px; margin-bottom: 0;">
          Sent automatically by Welth App.
        </p>
      </div>
    </div>
  `;

  try {
    const data = await transporter.sendMail({
      from: `"Welth Alerts" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Low balance alert email sent:", data.messageId);
    return data;
  } catch (error) {
    console.error("Failed to send low balance alert email:", error);
  }
}

export async function sendMonthlyReportEmail({ to, name, monthName, totalIncome, totalExpense, categoryBreakdown, insights }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("No EMAIL_USER or EMAIL_PASS provided. Skipping email alert.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  const netBalance = totalIncome - totalExpense;
  const isPositive = netBalance >= 0;

  // Generate HTML rows for the category breakdown
  let categoryHtml = "";
  for (const [cat, amt] of Object.entries(categoryBreakdown)) {
    categoryHtml += `
      <tr>
        <td style="color: #A1A1AA; font-size: 14px; font-weight: 500; padding: 12px 0; border-bottom: 1px solid #222222; text-transform: capitalize;">${cat.toLowerCase()}</td>
        <td style="color: #FFFFFF; font-size: 14px; font-weight: 600; text-align: right; padding: 12px 0; border-bottom: 1px solid #222222;">$${amt.toFixed(2)}</td>
      </tr>
    `;
  }

  const html = `
    <div style="background-color: #000000; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #111111; padding: 40px; border: 1px solid #222222; border-radius: 16px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Monthly Financial Report</h1>
        </div>
        
        <p style="color: #E4E4E7; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Hello ${name},<br/><br/>
          Here's your financial summary for <strong>${monthName}</strong>:
        </p>
        
        <div style="background-color: #000000; border: 1px solid #222222; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span style="color: #A1A1AA; font-size: 14px; font-weight: 500;">Total Income</span>
            <span style="color: #34D399; font-size: 15px; font-weight: 600;">+$${totalIncome.toFixed(2)}</span>
          </div>
          <div style="height: 1px; background-color: #222222; margin-bottom: 16px;"></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span style="color: #A1A1AA; font-size: 14px; font-weight: 500;">Total Expenses</span>
            <span style="color: #EF4444; font-size: 15px; font-weight: 600;">-$${totalExpense.toFixed(2)}</span>
          </div>
          <div style="height: 1px; background-color: #222222; margin-bottom: 16px;"></div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #FFFFFF; font-size: 16px; font-weight: 700;">Net Balance</span>
            <span style="color: ${isPositive ? '#34D399' : '#EF4444'}; font-size: 16px; font-weight: 700;">${isPositive ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 32px;">
          <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin-bottom: 16px;">Expenses by Category</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${categoryHtml}
          </table>
        </div>

        <div style="background-color: #18181B; padding: 24px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Welth Insights</h3>
          <ul style="color: #A1A1AA; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            ${insights}
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #FFFFFF; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: -0.2px;">View Dashboard</a>
        </div>
        
        <p style="color: #52525B; font-size: 12px; text-align: center; margin-top: 40px; margin-bottom: 0;">
          Sent automatically by Welth App at the end of every month.
        </p>
      </div>
    </div>
  `;

  try {
    const data = await transporter.sendMail({
      from: `"Welth Reports" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Your ${monthName} Financial Report 📊`,
      html: html,
    });
    console.log("Monthly report email sent:", data.messageId);
    return data;
  } catch (error) {
    console.error("Failed to send monthly report email:", error);
  }
}

export async function sendExpenseRatioEmail({ to, subject, income, expense, percentage, insights }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("No EMAIL_USER or EMAIL_PASS provided. Skipping email alert.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <div style="background-color: #000000; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #111111; padding: 40px; border: 1px solid #222222; border-radius: 16px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #222200; border: 1px solid #444400; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 20px;">⚠️</span>
          </div>
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Income vs Expense Alert</h1>
        </div>
        
        <p style="color: #E4E4E7; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          You have reached <span style="color: #EAB308; font-weight: 600;">${percentage.toFixed(1)}%</span> of your total monthly income.
        </p>
        
        <table style="width: 100%; background-color: #000000; border: 1px solid #222222; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-collapse: collapse;">
          <tr>
            <td style="color: #A1A1AA; font-size: 14px; font-weight: 500; padding-bottom: 16px; border-bottom: 1px solid #222222;">Total Monthly Expenses</td>
            <td style="color: #EF4444; font-size: 15px; font-weight: 600; text-align: right; padding-bottom: 16px; border-bottom: 1px solid #222222;">$${expense.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA; font-size: 14px; font-weight: 500; padding-top: 16px;">Total Monthly Income</td>
            <td style="color: #34D399; font-size: 15px; font-weight: 600; text-align: right; padding-top: 16px;">$${income.toFixed(2)}</td>
          </tr>
        </table>

        <div style="background-color: #18181B; padding: 24px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">Welth Insights</h3>
          <p style="color: #A1A1AA; font-size: 14px; line-height: 1.5; margin: 0;">
            ${insights || 'Consider slowing down your spending to ensure you don\'t exceed your income for the month.'}
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #FFFFFF; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: -0.2px;">Review Dashboard</a>
        </div>
        
        <p style="color: #52525B; font-size: 12px; text-align: center; margin-top: 40px; margin-bottom: 0;">
          Sent automatically by Welth App.
        </p>
      </div>
    </div>
  `;

  try {
    const data = await transporter.sendMail({
      from: `"Welth Alerts" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Income vs Expense alert email sent:", data.messageId);
    return data;
  } catch (error) {
    console.error("Failed to send Income vs Expense alert email:", error);
  }
}
