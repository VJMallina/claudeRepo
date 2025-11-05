import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';
import { join } from 'path';

export interface AccountSummaryData {
  user: {
    name: string;
    email: string;
    mobile: string;
  };
  date: Date;
  savingsWallet: {
    balance: number;
    totalSaved: number;
    totalWithdrawn: number;
    totalInvested: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    createdAt: Date;
    autoSaveAmount?: number;
  }>;
  investments: Array<{
    id: string;
    productName: string;
    amountInvested: number;
    units: number;
    nav: number;
    purchaseDate: Date;
  }>;
  summary: {
    totalTransactions: number;
    totalSpent: number;
    totalSaved: number;
    totalInvested: number;
  };
}

export interface InvestmentReceiptData {
  user: {
    name: string;
    email: string;
    mobile: string;
  };
  investment: {
    id: string;
    productName: string;
    category: string;
    amountInvested: number;
    units: number;
    nav: number;
    purchaseDate: Date;
  };
  savingsWalletBalance: number;
  transactionId: string;
}

@Injectable()
export class PdfService {
  private readonly uploadsDir = join(process.cwd(), 'uploads', 'statements');

  async ensureUploadsDir() {
    try {
      await mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Generate daily account statement PDF
   */
  async generateAccountStatement(data: AccountSummaryData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .fillColor('#4CAF50')
        .text('SaveInvest', { align: 'center' })
        .fontSize(16)
        .fillColor('#333')
        .text('Daily Account Statement', { align: 'center' })
        .moveDown();

      // Date
      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Statement Date: ${data.date.toLocaleDateString('en-IN')}`, {
          align: 'right',
        })
        .moveDown();

      // User Information
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('Account Holder Information', { underline: true })
        .fontSize(10)
        .text(`Name: ${data.user.name}`)
        .text(`Email: ${data.user.email}`)
        .text(`Mobile: ${data.user.mobile}`)
        .moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      // Savings Wallet Summary
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('Savings Wallet Summary', { underline: true })
        .fontSize(10)
        .moveDown(0.5);

      this.addTableRow(doc, [
        'Current Balance',
        `₹${data.savingsWallet.balance.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);
      this.addTableRow(doc, [
        'Total Saved (Lifetime)',
        `₹${data.savingsWallet.totalSaved.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);
      this.addTableRow(doc, [
        'Total Withdrawn',
        `₹${data.savingsWallet.totalWithdrawn.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);
      this.addTableRow(doc, [
        'Total Invested',
        `₹${data.savingsWallet.totalInvested.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);

      doc.moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      // Daily Summary
      doc
        .fontSize(12)
        .fillColor('#333')
        .text("Today's Activity", { underline: true })
        .fontSize(10)
        .moveDown(0.5);

      this.addTableRow(doc, [
        'Total Transactions',
        data.summary.totalTransactions.toString(),
      ]);
      this.addTableRow(doc, [
        'Total Spent',
        `₹${data.summary.totalSpent.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);
      this.addTableRow(doc, [
        'Total Saved Today',
        `₹${data.summary.totalSaved.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);
      this.addTableRow(doc, [
        'Total Invested Today',
        `₹${data.summary.totalInvested.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);

      doc.moveDown();

      // Transactions Section
      if (data.transactions.length > 0) {
        doc
          .fontSize(12)
          .fillColor('#333')
          .text('Transaction Details', { underline: true })
          .fontSize(9)
          .moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        doc
          .font('Helvetica-Bold')
          .text('Time', 50, tableTop, { width: 60 })
          .text('Type', 110, tableTop, { width: 70 })
          .text('Description', 180, tableTop, { width: 120 })
          .text('Amount', 300, tableTop, { width: 80, align: 'right' })
          .text('Auto-Save', 380, tableTop, { width: 70, align: 'right' })
          .text('Status', 450, tableTop, { width: 100 });

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        // Table rows
        doc.font('Helvetica');
        data.transactions.forEach((txn, index) => {
          if (doc.y > 700) {
            // Add new page if needed
            doc.addPage();
            doc.y = 50;
          }

          const rowY = doc.y + 5;
          doc
            .fontSize(8)
            .text(
              new Date(txn.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              50,
              rowY,
              { width: 60 }
            )
            .text(txn.type, 110, rowY, { width: 70 })
            .text(txn.description || '-', 180, rowY, { width: 120 })
            .text(`₹${txn.amount.toLocaleString('en-IN')}`, 300, rowY, {
              width: 80,
              align: 'right',
            })
            .text(
              txn.autoSaveAmount
                ? `₹${txn.autoSaveAmount.toLocaleString('en-IN')}`
                : '-',
              380,
              rowY,
              { width: 70, align: 'right' }
            )
            .text(txn.status, 450, rowY, { width: 100 });

          doc.moveDown();
          if (index < data.transactions.length - 1) {
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
          }
        });

        doc.moveDown();
      }

      // Investments Section
      if (data.investments.length > 0) {
        if (doc.y > 650) {
          doc.addPage();
        }

        doc
          .fontSize(12)
          .fillColor('#333')
          .text('Investments Made Today', { underline: true })
          .fontSize(9)
          .moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        doc
          .font('Helvetica-Bold')
          .text('Time', 50, tableTop, { width: 60 })
          .text('Product', 110, tableTop, { width: 150 })
          .text('Amount', 260, tableTop, { width: 80, align: 'right' })
          .text('Units', 340, tableTop, { width: 60, align: 'right' })
          .text('NAV', 400, tableTop, { width: 70, align: 'right' })
          .text('Value', 470, tableTop, { width: 80, align: 'right' });

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        // Table rows
        doc.font('Helvetica');
        data.investments.forEach((inv, index) => {
          const rowY = doc.y + 5;
          const currentValue = inv.units * inv.nav;

          doc
            .fontSize(8)
            .text(
              new Date(inv.purchaseDate).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              50,
              rowY,
              { width: 60 }
            )
            .text(inv.productName, 110, rowY, { width: 150 })
            .text(`₹${inv.amountInvested.toLocaleString('en-IN')}`, 260, rowY, {
              width: 80,
              align: 'right',
            })
            .text(inv.units.toFixed(3), 340, rowY, {
              width: 60,
              align: 'right',
            })
            .text(`₹${inv.nav.toFixed(2)}`, 400, rowY, {
              width: 70,
              align: 'right',
            })
            .text(`₹${currentValue.toLocaleString('en-IN')}`, 470, rowY, {
              width: 80,
              align: 'right',
            });

          doc.moveDown();
          if (index < data.investments.length - 1) {
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
          }
        });
      }

      // Footer
      doc
        .moveDown(2)
        .fontSize(8)
        .fillColor('#999')
        .text(
          'This is a system-generated statement. For queries, contact support@saveinvest.app',
          { align: 'center' }
        )
        .text(
          `Generated on ${new Date().toLocaleString('en-IN')}`,
          { align: 'center' }
        );

      doc.end();
    });
  }

  /**
   * Generate investment confirmation receipt PDF
   */
  async generateInvestmentReceipt(
    data: InvestmentReceiptData
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with logo
      doc
        .fontSize(24)
        .fillColor('#4CAF50')
        .text('SaveInvest', { align: 'center' })
        .moveDown(0.5);

      // Title
      doc
        .fontSize(18)
        .fillColor('#333')
        .text('Investment Confirmation', { align: 'center' })
        .moveDown(0.5);

      // Receipt ID
      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Receipt No: ${data.transactionId}`, { align: 'center' })
        .text(
          `Date: ${new Date(data.investment.purchaseDate).toLocaleString('en-IN')}`,
          { align: 'center' }
        )
        .moveDown(2);

      // Success icon (using text)
      doc
        .fontSize(40)
        .fillColor('#4CAF50')
        .text('✓', { align: 'center' })
        .moveDown();

      doc
        .fontSize(14)
        .fillColor('#333')
        .text('Investment Successful!', { align: 'center' })
        .moveDown(2);

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      // Customer Information
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('Investor Details', { underline: true })
        .fontSize(10)
        .fillColor('#666')
        .moveDown(0.5);

      this.addTableRow(doc, ['Name', data.user.name]);
      this.addTableRow(doc, ['Email', data.user.email]);
      this.addTableRow(doc, ['Mobile', data.user.mobile]);

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      // Investment Details
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('Investment Details', { underline: true })
        .fontSize(10)
        .fillColor('#666')
        .moveDown(0.5);

      this.addTableRow(doc, ['Product Name', data.investment.productName]);
      this.addTableRow(doc, ['Category', data.investment.category]);
      this.addTableRow(doc, [
        'Amount Invested',
        `₹${data.investment.amountInvested.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);
      this.addTableRow(doc, [
        'NAV (Net Asset Value)',
        `₹${data.investment.nav.toFixed(4)}`,
      ]);
      this.addTableRow(doc, [
        'Units Allocated',
        data.investment.units.toFixed(4),
      ]);
      this.addTableRow(doc, [
        'Current Value',
        `₹${(data.investment.units * data.investment.nav).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      ]);

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      // Payment Information
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('Payment Information', { underline: true })
        .fontSize(10)
        .fillColor('#666')
        .moveDown(0.5);

      this.addTableRow(doc, ['Payment Source', 'Savings Wallet']);
      this.addTableRow(doc, [
        'Remaining Wallet Balance',
        `₹${data.savingsWalletBalance.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
      ]);
      this.addTableRow(doc, ['Transaction ID', data.transactionId]);
      this.addTableRow(doc, ['Payment Status', 'Completed']);

      doc.moveDown(2);

      // Important Notes
      doc
        .fontSize(11)
        .fillColor('#333')
        .text('Important Information', { underline: true })
        .fontSize(9)
        .fillColor('#666')
        .moveDown(0.5);

      doc
        .list(
          [
            'This investment is subject to market risks. Please read all scheme-related documents carefully.',
            'The NAV is subject to change based on market conditions.',
            'Units will be credited to your account within 24-48 hours.',
            'You can redeem your investment anytime from the app.',
            'For queries, contact support@saveinvest.app or call +91-XXXXXXXXXX',
          ],
          { bulletRadius: 2, textIndent: 15 }
        );

      doc.moveDown(2);

      // Footer
      doc
        .fontSize(8)
        .fillColor('#999')
        .text(
          'This is a computer-generated receipt and does not require a signature.',
          { align: 'center' }
        )
        .moveDown(0.5)
        .text('SaveInvest - Save Smart, Invest Smarter', { align: 'center' })
        .text('www.saveinvest.app | support@saveinvest.app', {
          align: 'center',
        });

      doc.end();
    });
  }

  /**
   * Save PDF to file
   */
  async savePdfToFile(
    buffer: Buffer,
    filename: string
  ): Promise<string> {
    await this.ensureUploadsDir();
    const filepath = join(this.uploadsDir, filename);

    return new Promise((resolve, reject) => {
      const stream = createWriteStream(filepath);
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
      stream.write(buffer);
      stream.end();
    });
  }

  /**
   * Helper method to add table rows
   */
  private addTableRow(doc: PDFKit.PDFDocument, [label, value]: [string, string]) {
    const y = doc.y;
    doc
      .fontSize(10)
      .fillColor('#666')
      .text(label, 50, y, { width: 250 })
      .fillColor('#333')
      .text(value, 300, y, { width: 250, align: 'right' });
    doc.moveDown(0.7);
  }
}
