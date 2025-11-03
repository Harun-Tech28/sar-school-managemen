import { Payment } from '@/types';

interface ReceiptTemplateProps {
  payment: Payment;
  studentName: string;
  className: string;
}

export const generateReceiptHTML = ({
  payment,
  studentName,
  className
}: ReceiptTemplateProps): string => {
  const date = new Date(payment.payment_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Payment Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
        }
        .receipt {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          color: #1a56db;
          margin: 0;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .details {
          margin: 20px 0;
          border-top: 2px solid #eee;
          border-bottom: 2px solid #eee;
          padding: 20px 0;
        }
        .details div {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
        }
        .details .label {
          color: #666;
        }
        .details .value {
          font-weight: bold;
          text-align: right;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 14px;
          font-weight: bold;
        }
        .status.completed {
          background: #def7ec;
          color: #03543f;
        }
        .status.pending {
          background: #fef3c7;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>School Name</h1>
          <p>123 School Street, City</p>
          <p>Tel: +123 456 7890</p>
          <p>Email: info@school.com</p>
        </div>

        <h2>Payment Receipt</h2>
        
        <div class="details">
          <div>
            <span class="label">Receipt Number:</span>
            <span class="value">${payment.payment_reference}</span>
          </div>
          <div>
            <span class="label">Date:</span>
            <span class="value">${date}</span>
          </div>
          <div>
            <span class="label">Student Name:</span>
            <span class="value">${studentName}</span>
          </div>
          <div>
            <span class="label">Class:</span>
            <span class="value">${className}</span>
          </div>
          <div>
            <span class="label">Payment Method:</span>
            <span class="value">${payment.payment_method}</span>
          </div>
          <div>
            <span class="label">Amount Paid:</span>
            <span class="value">GH₵ ${payment.amount.toFixed(2)}</span>
          </div>
          <div>
            <span class="label">Status:</span>
            <span class="value">
              <span class="status ${payment.status.toLowerCase()}">
                ${payment.status.toUpperCase()}
              </span>
            </span>
          </div>
          ${payment.term ? `
            <div>
              <span class="label">Term:</span>
              <span class="value">${payment.term.term_name}</span>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>Thank you for your payment. This receipt was generated electronically and is valid without a signature.</p>
          <p>For any queries, please contact the school administration.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};