import logo from "../assets/images/Kripin.png";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserProfile } from '../types';

export interface PdfTransactionItem {
  dateStr: string;
  title: string;
  type: 'Income' | 'Expense';
  amount: number;
  runningBalance: number;
  category?: string;
}

export interface CategorySummaryItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface BudgetSummaryPdfItem {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  status: string;
}

export function buildMonthlyPdfDoc(
  monthLabel: string,
  totalIncome: number,
  totalExpense: number,
  netBalance: number,
  transactions: PdfTransactionItem[],
  customCategorySummary?: CategorySummaryItem[],
  userProfile?: UserProfile,
  budgetSummary?: BudgetSummaryPdfItem[]
): jsPDF {
  const doc = new jsPDF();

const pageWidth = doc.internal.pageSize.getWidth() || 210;
const pageHeight = doc.internal.pageSize.getHeight() || 297;

// Outer Border
doc.setDrawColor(51, 65, 85);
doc.setLineWidth(1);
doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 3, 3, "S");

// Inner Border
doc.setDrawColor(148, 163, 184);
doc.setLineWidth(0.3);
doc.roundedRect(11, 11, pageWidth - 22, pageHeight - 22, 2, 2, "S");

// 1. HEADER SECTION
doc.setFontSize(20);
// ================= HEADER =================

// Logo
doc.addImage(logo, "PNG", 14, 16, 16, 16);

// App Name
doc.setFont("helvetica", "bold");
doc.setFontSize(24);

// "Kri" - Green
doc.setTextColor(22, 163, 74);
doc.text("Kri", 35, 24);

// "pin" - Red (bilkul Kri ke baad)
const kriWidth = doc.getTextWidth("Kri");

doc.setTextColor(220, 38, 38);
doc.text("pin", 35 + kriWidth, 24);

// User Details
doc.setFont("helvetica", "bold");
doc.setFontSize(9);
doc.setTextColor(51, 65, 85);

const userName = userProfile?.name || "";
const userMobile = userProfile?.mobile || "";
const userId = userProfile?.userId || "";

doc.text(`User Name : ${userName}`, pageWidth - 24, 16, {
  align: "right",
});

doc.text(`Mobile : ${userMobile}`, pageWidth - 16, 21, {
  align: "right",
});

doc.text(`User ID : ${userId}`, pageWidth - 19, 27, {
  align: "right",
});

// Divider
doc.setDrawColor(210);
doc.line(14, 40, pageWidth - 14, 40);

// Month
doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(30, 41, 59);

doc.text(`${monthLabel} Statement`, pageWidth / 2, 48, {
  align: "center",
});

doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(120);

doc.text("Monthly Expense Report", pageWidth / 2, 54, {
  align: "center",
});

// Divider
doc.line(14, 56, pageWidth - 14, 56);

  // Right Side Branding
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // Slate 500

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const exportDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });


  

  // 2. SUMMARY CARDS (3 side-by-side cards with clean borders)
  const cardY = 68;
  const cardWidth = 57;
  const cardHeight = 22;
  const gap = 5.5;

  // Card 1: Total Income
  doc.setFillColor(240, 253, 244); // Light Green
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL INCOME', 18, cardY + 7);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text(`+Rs. ${totalIncome.toLocaleString('en-IN')}`, 18, cardY + 16);

  // Card 2: Total Expense
  const card2X = 14 + cardWidth + gap;
  doc.setFillColor(254, 242, 242); // Light Red
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('TOTAL EXPENSE', card2X + 4, cardY + 7);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`-Rs. ${totalExpense.toLocaleString('en-IN')}`, card2X + 4, cardY + 16);

  // Card 3: Net Balance
  const card3X = card2X + cardWidth + gap;
  doc.setFillColor(248, 250, 252); // Light Slate
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('NET BALANCE', card3X + 4, cardY + 7);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${netBalance.toLocaleString('en-IN')}`, card3X + 4, cardY + 16);

  // 3. ZEBRA-STRIPED TRANSACTION TABLE WITH GRID BORDER
  const tableTitleY = cardY + cardHeight + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('TRANSACTION HISTORY', 14, tableTitleY);

  const tableRows = transactions.map((t) => [
    t.dateStr,
    t.title,
    t.type,
    `${t.type === 'Income' ? '+' : '-'}Rs. ${t.amount.toLocaleString('en-IN')}`,
    `Rs. ${t.runningBalance.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: tableTitleY + 3,
    head: [['Date', 'Description', 'Type', 'Amount (Rs.)', 'Running Balance (Rs.)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      lineWidth: 0.2,
      lineColor: [203, 213, 225],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light zebra striping
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineWidth: 0.2, // Boxed cell borders
      lineColor: [203, 213, 225], // Slate 300
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22 },
      3: { cellWidth: 34, halign: 'right' },
      4: { cellWidth: 38, halign: 'right' },
    },
    didParseCell: (data) => {
      // Color-code Type & Amount columns (Green for Income, Red for Expense)
      if (data.section === 'body') {
        const rowData = data.row.raw as string[];
        const isIncome = rowData[2] === 'Income';

        if (data.column.index === 2) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = isIncome ? [22, 163, 74] : [220, 38, 38];
        } else if (data.column.index === 3) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = isIncome ? [22, 163, 74] : [220, 38, 38];
        }
      }
    },
  });

  // 4. CATEGORY SUMMARY MINI-TABLE
  let categorySummary: CategorySummaryItem[] = customCategorySummary || [];

  if (!customCategorySummary || customCategorySummary.length === 0) {
    // Auto-calculate from transactions if not provided
    const catMap: { [cat: string]: number } = {};
    transactions.forEach((t) => {
      if (t.type === 'Expense') {
        const cat = t.category || 'General';
        catMap[cat] = (catMap[cat] || 0) + t.amount;
      }
    });

    const totalExp = Object.values(catMap).reduce((sum, v) => sum + v, 0);

    categorySummary = Object.entries(catMap)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  if (categorySummary.length > 0) {
    const lastY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 120;
    const pageHeight = doc.internal.pageSize.getHeight() || 297;

    // Check if enough space remaining on page, else add page
    let catStartY = lastY + 10;
    if (catStartY + 45 > pageHeight - 20) {
      doc.addPage();
      catStartY = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('CATEGORY SPENDING SUMMARY', 14, catStartY);

    const catRows = categorySummary.map((c) => [
      c.category,
      `Rs. ${c.amount.toLocaleString('en-IN')}`,
      `${c.percentage}%`,
    ]);

    autoTable(doc, {
      startY: catStartY + 3,
      head: [['Category', 'Total Spend (Rs.)', '% of Expense']],
      body: catRows,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85], // Slate 700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        lineWidth: 0.2,
        lineColor: [203, 213, 225],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        lineWidth: 0.2,
        lineColor: [203, 213, 225],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 45, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
      },
    });
  }

  // 4B. MONTHLY BUDGET SUMMARY TABLE
  if (budgetSummary && budgetSummary.length > 0) {
    const lastY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 160;
    const pageHeight = doc.internal.pageSize.getHeight() || 297;

    let bgtStartY = lastY + 10;
    if (bgtStartY + 50 > pageHeight - 20) {
      doc.addPage();
      bgtStartY = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('MONTHLY BUDGET VS SPENDING SUMMARY', 14, bgtStartY);

    const bgtRows = budgetSummary.map((b) => [
      b.category,
      `Rs. ${b.budget.toLocaleString('en-IN')}`,
      `Rs. ${b.spent.toLocaleString('en-IN')}`,
      `Rs. ${b.remaining.toLocaleString('en-IN')}`,
      b.status,
    ]);

    autoTable(doc, {
      startY: bgtStartY + 3,
      head: [['Category', 'Budget (Rs.)', 'Spent (Rs.)', 'Remaining (Rs.)', 'Status']],
      body: bgtRows,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129], // Emerald 600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        lineWidth: 0.2,
        lineColor: [203, 213, 225],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        lineWidth: 0.2,
        lineColor: [203, 213, 225],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 32, halign: 'right' },
        2: { cellWidth: 32, halign: 'right' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 28, halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const val = String(data.cell.raw);
          data.cell.styles.fontStyle = 'bold';
          if (val === 'Exceeded' || val === 'Critical') {
            data.cell.styles.textColor = [220, 38, 38]; // Red
          } else if (val === 'Warning') {
            data.cell.styles.textColor = [217, 119, 6]; // Amber
          } else {
            data.cell.styles.textColor = [22, 163, 74]; // Green
          }
        }
      },
    });
  }

  // 5. FOOTER & WATERMARK ON ALL PAGES
  const totalPages = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Page Border

    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(1);
    doc.roundedRect(
      8,
      8,
      pageWidth - 16,
      pageHeight - 16,
      3,
      3,
      "S"
    );

// Inner Border
doc.setDrawColor(148, 163, 184);
doc.setLineWidth(0.3);
doc.roundedRect(
  11,
  11,
  pageWidth - 22,
  pageHeight - 22,
  2,
  2,
  "S"
);

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

     // Footer text
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);

    doc.text(
      "Generated by Kripin | JTech Labs",
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" }
    );

    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 12,
      { align: "right" }
    );

  } // End of for loop

  return doc;
} // End of buildMonthlyPdfDoc

export function generateMonthlyPdf(
  monthLabel: string,
  totalIncome: number,
  totalExpense: number,
  netBalance: number,
  transactions: PdfTransactionItem[],
  customCategorySummary?: CategorySummaryItem[],
  userProfile?: UserProfile,
  budgetSummary?: BudgetSummaryPdfItem[]
) {
  const doc = buildMonthlyPdfDoc(
  monthLabel,
  totalIncome,
  totalExpense,
  netBalance,
  transactions,
  customCategorySummary,
  userProfile,
  budgetSummary
);

  doc.save(`Kripin_Report_${monthLabel.replace(/[\s,]+/g, "_")}.pdf`);
}
