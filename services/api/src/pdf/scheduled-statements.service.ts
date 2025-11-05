import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountStatementService } from './account-statement.service';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ScheduledStatementsService {
  private readonly logger = new Logger(ScheduledStatementsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private accountStatementService: AccountStatementService,
    private prisma: PrismaService,
  ) {
    // Initialize email transporter
    // TODO: Replace with actual email service credentials
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send daily account statements at 9 PM every day
   * Cron: 0 21 * * * (9 PM daily)
   */
  @Cron('0 21 * * *', {
    name: 'daily-statements',
    timeZone: 'Asia/Kolkata',
  })
  async sendDailyStatements() {
    this.logger.log('Starting daily account statement generation...');

    try {
      const today = new Date();

      // Get all users who had activity today
      const userIds = await this.accountStatementService.getUsersForDailyStatements(today);

      this.logger.log(`Found ${userIds.length} users with activity today`);

      let successCount = 0;
      let failureCount = 0;

      // Process each user
      for (const userId of userIds) {
        try {
          await this.sendStatementToUser(userId, today);
          successCount++;
        } catch (error) {
          this.logger.error(
            `Failed to send statement to user ${userId}:`,
            error
          );
          failureCount++;
        }
      }

      this.logger.log(
        `Daily statements completed. Success: ${successCount}, Failed: ${failureCount}`
      );
    } catch (error) {
      this.logger.error('Error in daily statements job:', error);
    }
  }

  /**
   * Send statement to individual user
   */
  async sendStatementToUser(userId: string, date: Date = new Date()) {
    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Generate PDF statement
    const pdfBuffer = await this.accountStatementService.generateDailyStatement(
      userId,
      date
    );

    // Send email with PDF attachment
    const dateStr = date.toLocaleDateString('en-IN');
    const filename = `SaveInvest_Statement_${dateStr.replace(/\//g, '-')}.pdf`;

    await this.sendStatementEmail(
      user.email,
      user.name,
      dateStr,
      pdfBuffer,
      filename
    );

    this.logger.log(`Statement sent to ${user.email}`);
  }

  /**
   * Send statement email with PDF attachment
   */
  private async sendStatementEmail(
    email: string,
    name: string,
    date: string,
    pdfBuffer: Buffer,
    filename: string
  ) {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"SaveInvest" <noreply@saveinvest.app>',
      to: email,
      subject: `Your Daily Account Statement - ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SaveInvest</h1>
          </div>

          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hi ${name},</h2>

            <p style="color: #666; line-height: 1.6;">
              Here's your daily account statement for <strong>${date}</strong>.
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #4CAF50; margin-top: 0;">📊 Your Daily Summary</h3>
              <p style="color: #666;">
                Your account statement includes:
              </p>
              <ul style="color: #666; line-height: 1.8;">
                <li>Savings wallet balance and activity</li>
                <li>All transactions for the day</li>
                <li>Investments made today</li>
                <li>Daily financial summary</li>
              </ul>
            </div>

            <p style="color: #666; line-height: 1.6;">
              The PDF statement is attached to this email. You can also view your statement
              anytime in the app under <strong>Profile → Statements</strong>.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://saveinvest.app/dashboard"
                 style="background-color: #4CAF50; color: white; padding: 12px 30px;
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Open App
              </a>
            </div>

            <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px;">
              <p style="color: #999; font-size: 12px; line-height: 1.6;">
                <strong>Need help?</strong><br>
                Email: support@saveinvest.app<br>
                Phone: +91-XXXXXXXXXX
              </p>
              <p style="color: #999; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>

          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 SaveInvest. All rights reserved.<br>
              Save Smart, Invest Smarter
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Manual trigger for testing (can be called via API endpoint)
   */
  async triggerDailyStatementForUser(userId: string) {
    this.logger.log(`Manually triggering statement for user ${userId}`);
    await this.sendStatementToUser(userId);
  }

  /**
   * Send monthly statements on 1st of every month at 10 AM
   * Cron: 0 10 1 * * (10 AM on 1st day of month)
   */
  @Cron('0 10 1 * *', {
    name: 'monthly-statements',
    timeZone: 'Asia/Kolkata',
  })
  async sendMonthlyStatements() {
    this.logger.log('Starting monthly account statement generation...');

    try {
      // Get previous month
      const now = new Date();
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const month = now.getMonth() === 0 ? 12 : now.getMonth();

      // Get all active users
      const users = await this.prisma.user.findMany({
        select: { id: true, name: true, email: true },
      });

      this.logger.log(`Sending monthly statements to ${users.length} users`);

      let successCount = 0;
      let failureCount = 0;

      for (const user of users) {
        try {
          // Generate monthly statement
          const pdfBuffer = await this.accountStatementService.generateMonthlyStatement(
            user.id,
            year,
            month
          );

          // Send email
          const filename = `SaveInvest_Monthly_Statement_${year}-${month.toString().padStart(2, '0')}.pdf`;
          const monthName = new Date(year, month - 1).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long'
          });

          await this.sendMonthlyStatementEmail(
            user.email,
            user.name,
            monthName,
            pdfBuffer,
            filename
          );

          successCount++;
        } catch (error) {
          this.logger.error(
            `Failed to send monthly statement to user ${user.id}:`,
            error
          );
          failureCount++;
        }
      }

      this.logger.log(
        `Monthly statements completed. Success: ${successCount}, Failed: ${failureCount}`
      );
    } catch (error) {
      this.logger.error('Error in monthly statements job:', error);
    }
  }

  /**
   * Send monthly statement email
   */
  private async sendMonthlyStatementEmail(
    email: string,
    name: string,
    month: string,
    pdfBuffer: Buffer,
    filename: string
  ) {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"SaveInvest" <noreply@saveinvest.app>',
      to: email,
      subject: `Your Monthly Account Statement - ${month}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SaveInvest</h1>
          </div>

          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hi ${name},</h2>

            <p style="color: #666; line-height: 1.6;">
              Your monthly account statement for <strong>${month}</strong> is ready!
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #4CAF50; margin-top: 0;">📊 Monthly Overview</h3>
              <p style="color: #666;">
                Your comprehensive monthly statement includes:
              </p>
              <ul style="color: #666; line-height: 1.8;">
                <li>Complete transaction history</li>
                <li>All investments made</li>
                <li>Savings progress and trends</li>
                <li>Monthly financial summary</li>
              </ul>
            </div>

            <p style="color: #666; line-height: 1.6;">
              The detailed PDF statement is attached. Keep it for your records!
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://saveinvest.app/dashboard"
                 style="background-color: #4CAF50; color: white; padding: 12px 30px;
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </div>
          </div>

          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 SaveInvest. All rights reserved.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }
}
