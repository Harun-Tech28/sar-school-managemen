import { supabase } from '@/lib/supabase';
import { generateReceiptHTML } from './receiptTemplate';
import { Payment } from '@/types';

export const generateAndStoreReceipt = async (
  payment: Payment,
  studentId: string
): Promise<string> => {
  try {
    // Fetch student details (avoid nested relationship selects to prevent schema-cache errors)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`first_name, last_name, class_id`)
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    // Fetch class name separately
    let className = 'N/A';
    if (student.class_id) {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('name')
        .eq('id', student.class_id)
        .single();
      if (!classError && classData) className = classData.name;
    }

    // Generate receipt HTML
    const receiptHTML = generateReceiptHTML({
      payment,
      studentName: `${student.first_name} ${student.last_name}`,
      className
    });

    // Convert HTML to PDF using jsPDF and html2canvas
    const pdf = await import('jspdf');
    const html2canvas = await import('html2canvas');
    
    // Create a temporary div to render the receipt
    const container = document.createElement('div');
    container.innerHTML = receiptHTML;
    document.body.appendChild(container);

    // Convert to PDF
    const canvas = await html2canvas.default(container);
    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const doc = new pdf.default('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const ratio = canvas.width / canvas.height;
    const imgWidth = pageWidth;
    const imgHeight = imgWidth / ratio;

    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Convert PDF to blob
    const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });

    // Upload to Supabase Storage
    const fileName = `receipts/${payment.payment_reference}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('school-docs')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('school-docs')
      .getPublicUrl(fileName);

    // Update payment record with receipt URL
    const { error: updateError } = await supabase
      .from('payments')
      .update({ receipt_url: publicUrlData.publicUrl })
      .eq('id', payment.id);

    if (updateError) throw updateError;

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};