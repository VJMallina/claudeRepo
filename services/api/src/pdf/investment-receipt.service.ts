import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService, InvestmentReceiptData } from './pdf.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class InvestmentReceiptService {
  private readonly logger = new Logger(InvestmentReceiptService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {
    // Initialize email transporter
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
   * Generate and send investment receipt after investment is made
   */
  async generateAndSendReceipt(investmentId: string): Promise<void> {
    try {
      this.logger.log(`Generating receipt for investment ${investmentId}`);

      // Fetch investment details with related data
      const investment = await this.prisma.investment.findUnique({
        where: { id: investmentId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              mobile: true,
            },
          },
          product: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      });

      if (!investment) {
        throw new Error(`Investment ${investmentId} not found`);
      }

      // Get current savings wallet balance
      const savingsWallet = await this.prisma.savingsWallet.findUnique({
        where: { userId: investment.userId },
      });

      if (!savingsWallet) {
        throw new Error(`Savings wallet not found for user ${investment.userId}`);
      }

      // Prepare receipt data
      const receiptData: InvestmentReceiptData = {
        user: {
          name: investment.user.name,
          email: investment.user.email,
          mobile: investment.user.mobile,
        },
        investment: {
          id: investment.id,
          productName: investment.product.name,
          category: investment.product.category,
          amountInvested: investment.amountInvested,
          units: investment.units,
          nav: investment.nav,
          purchaseDate: investment.purchaseDate,
        },
        savingsWalletBalance: savingsWallet.balance,
        transactionId: investment.id, // Using investment ID as transaction ID
      };

      // Generate PDF
      const pdfBuffer = await this.pdfService.generateInvestmentReceipt(receiptData);

      // Send email with PDF
      await this.sendReceiptEmail(
        investment.user.email,
        investment.user.name,
        investment.product.name,
        investment.amountInvested,
        pdfBuffer,
        investment.id
      );

      // Also send push notification
      await this.sendInvestmentNotification(investment.userId, investment);

      this.logger.log(`Receipt sent successfully for investment ${investmentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate receipt for investment ${investmentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send receipt email with PDF attachment
   */
  private async sendReceiptEmail(
    email: string,
    name: string,
    productName: string,
    amount: number,
    pdfBuffer: Buffer,
    investmentId: string
  ) {
    const filename = `SaveInvest_Investment_Receipt_${investmentId}.pdf`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"SaveInvest" <noreply@saveinvest.app>',
      to: email,
      subject: `Investment Confirmation - ₹${amount.toLocaleString('en-IN')} in ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">SaveInvest</h1>
            <p style="color: white; margin: 5px 0; opacity: 0.9;">Save Smart, Invest Smarter</p>
          </div>

          <!-- Success Banner -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      padding: 30px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 10px;">✓</div>
            <h2 style="color: white; margin: 0; font-size: 24px;">Investment Successful!</h2>
          </div>

          <!-- Content -->
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h3 style="color: #333;">Hi ${name},</h3>

            <p style="color: #666; line-height: 1.6; font-size: 15px;">
              Congratulations! Your investment has been processed successfully. 🎉
            </p>

            <!-- Investment Summary Box -->
            <div style="background-color: white; padding: 25px; border-radius: 12px;
                        margin: 25px 0; border-left: 4px solid #4CAF50;">
              <h3 style="color: #4CAF50; margin-top: 0; font-size: 18px;">
                💰 Investment Summary
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #f0f0f0;">
                    Product
                  </td>
                  <td style="padding: 10px 0; color: #333; font-weight: 600; text-align: right;
                             border-bottom: 1px solid #f0f0f0;">
                    ${productName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #f0f0f0;">
                    Amount Invested
                  </td>
                  <td style="padding: 10px 0; color: #333; font-weight: 600; text-align: right;
                             border-bottom: 1px solid #f0f0f0; font-size: 18px; color: #4CAF50;">
                    ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;">
                    Status
                  </td>
                  <td style="padding: 10px 0; text-align: right;">
                    <span style="background-color: #4CAF50; color: white; padding: 4px 12px;
                                 border-radius: 12px; font-size: 12px; font-weight: 600;">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Info Box -->
            <div style="background-color: #FFF3CD; padding: 15px; border-radius: 8px;
                        border-left: 4px solid #FFC107; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>📋 What's Next?</strong><br>
                • Units will be credited to your account within 24-48 hours<br>
                • Your investment receipt is attached as a PDF<br>
                • You can track your investment anytime in the app
              </p>
            </div>

            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              Your detailed investment receipt with all transaction details is attached to this email.
              Keep it safe for your records.
            </p>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://saveinvest.app/investments"
                 style="background-color: #4CAF50; color: white; padding: 15px 40px;
                        text-decoration: none; border-radius: 8px; display: inline-block;
                        font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);">
                View My Portfolio
              </a>
            </div>

            <!-- Important Information -->
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #333; margin-top: 0; font-size: 14px;">
                ⚠️ Important Information
              </h4>
              <ul style="color: #666; font-size: 13px; line-height: 1.8; margin: 10px 0;
                         padding-left: 20px;">
                <li>All investments are subject to market risks</li>
                <li>Please read all scheme-related documents carefully</li>
                <li>Past performance is not indicative of future results</li>
                <li>You can redeem your investment anytime from the app</li>
              </ul>
            </div>

            <!-- Support Section -->
            <div style="border-top: 2px solid #e0e0e0; margin-top: 30px; padding-top: 20px;">
              <h4 style="color: #333; font-size: 15px;">Need Help?</h4>
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 10px 0;">
                📧 Email: <a href="mailto:support@saveinvest.app"
                             style="color: #4CAF50;">support@saveinvest.app</a><br>
                📞 Phone: +91-XXXXXXXXXX<br>
                🕐 Support Hours: 9 AM - 6 PM (Mon-Sat)
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 15px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #333; padding: 25px; text-align: center;">
            <p style="color: #999; font-size: 13px; margin: 0; line-height: 1.6;">
              © 2025 SaveInvest. All rights reserved.<br>
              Helping you save and invest smarter, one transaction at a time.
            </p>
            <div style="margin-top: 15px;">
              <a href="https://saveinvest.app" style="color: #4CAF50; text-decoration: none;
                                                      margin: 0 10px; font-size: 12px;">
                Website
              </a>
              <a href="https://saveinvest.app/privacy" style="color: #4CAF50; text-decoration: none;
                                                              margin: 0 10px; font-size: 12px;">
                Privacy Policy
              </a>
              <a href="https://saveinvest.app/terms" style="color: #4CAF50; text-decoration: none;
                                                            margin: 0 10px; font-size: 12px;">
                Terms
              </a>
            </div>
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
    this.logger.log(`Receipt email sent to ${email}`);
  }

  /**
   * Send push notification about investment
   */
  private async sendInvestmentNotification(userId: string, investment: any) {
    try {
      // Create notification record
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'INVESTMENT',
          title: 'Investment Successful! 🎉',
          message: `₹${investment.amountInvested.toLocaleString('en-IN')} invested in ${investment.product.name}. Receipt sent to your email.`,
          data: {
            investmentId: investment.id,
            productName: investment.product.name,
            amount: investment.amountInvested,
          },
        },
      });

      this.logger.log(`Notification created for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to create notification:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Regenerate receipt for an existing investment (manual trigger)
   */
  async regenerateReceipt(investmentId: string): Promise<Buffer> {
    const investment = await this.prisma.investment.findUnique({
      where: { id: investmentId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            mobile: true,
          },
        },
        product: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    if (!investment) {
      throw new Error(`Investment ${investmentId} not found`);
    }

    const savingsWallet = await this.prisma.savingsWallet.findUnique({
      where: { userId: investment.userId },
    });

    if (!savingsWallet) {
      throw new Error(`Savings wallet not found for user ${investment.userId}`);
    }

    const receiptData: InvestmentReceiptData = {
      user: {
        name: investment.user.name,
        email: investment.user.email,
        mobile: investment.user.mobile,
      },
      investment: {
        id: investment.id,
        productName: investment.product.name,
        category: investment.product.category,
        amountInvested: investment.amountInvested,
        units: investment.units,
        nav: investment.nav,
        purchaseDate: investment.purchaseDate,
      },
      savingsWalletBalance: savingsWallet.balance,
      transactionId: investment.id,
    };

    return this.pdfService.generateInvestmentReceipt(receiptData);
  }
}
