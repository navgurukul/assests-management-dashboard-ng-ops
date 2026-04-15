export async function downloadNOC(userData = {}) {
  const html2pdf = (await import('html2pdf.js')).default;

  const generatedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const userName = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'N/A';
  const userEmail = userData.email || 'N/A';
  const userPhone = userData.phone || 'N/A';
  const userRole = userData.role || 'N/A';
  const userDepartment = userData.department || 'N/A';
  const userLocation = userData.location || 'N/A';

  const element = document.createElement('div');
  element.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 48px; max-width: 640px; margin: 0 auto; color: #111;">
      <h1 style="text-align: center; font-size: 22px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px;">
        NO OBJECTION CERTIFICATE
      </h1>
      <p style="text-align: center; font-size: 13px; color: #555; margin-bottom: 32px;">(NOC)</p>

      <hr style="border: none; border-top: 2px solid #16a34a; margin-bottom: 28px;" />

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <tbody>
          <tr>
            <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #374151; width: 36%;">Name</td>
            <td style="padding: 6px 0; color: #111;">${userName}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #374151;">Email</td>
            <td style="padding: 6px 0; color: #111;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #374151;">Phone</td>
            <td style="padding: 6px 0; color: #111;">${userPhone}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #374151;">Role</td>
            <td style="padding: 6px 0; color: #111;">${userRole}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #374151;">Department</td>
            <td style="padding: 6px 0; color: #111;">${userDepartment}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #374151;">Location</td>
            <td style="padding: 6px 0; color: #111;">${userLocation}</td>
          </tr>
        </tbody>
      </table>

      <p style="font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
        This is to certify that all assigned devices have been successfully submitted
        and accepted by the campus. No further dues or liabilities are pending against
        the concerned user with respect to any IT assets.
      </p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #15803d;">
          &#10003;&nbsp; Status: NOC GRANTED
        </p>
        <p style="margin: 6px 0 0; font-size: 13px; color: #166534;">
          All your devices are submitted and accepted.
        </p>
      </div>

      <p style="font-size: 13px; color: #555; margin-bottom: 4px;">Generated on: <strong>${generatedOn}</strong></p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 28px;" />
      <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 12px;">
        This is a system-generated document and does not require a physical signature.
      </p>
    </div>
  `;

  html2pdf()
    .set({
      margin: 0,
      filename: 'NOC.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(element)
    .save();
}
