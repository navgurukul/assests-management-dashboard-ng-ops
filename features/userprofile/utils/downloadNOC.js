import { apiGet } from '@/app/utils/apiService';

export async function downloadNOC(userData = {}, assetMovements = []) {
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

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to fetch asset details including serial number
  const fetchAssetDetails = async (assetId) => {
    try {
      const response = await apiGet(`/assets/${assetId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching asset details for ${assetId}:`, error);
      // Don't throw, just return null to show N/A in the NOC
      if (error.code === 401) {
        console.warn('Authentication error while fetching asset details. Serial number will show as N/A.');
      } else if (error.code === 404) {
        console.warn(`Asset ${assetId} not found. Serial number will show as N/A.`);
      } else {
        console.warn(`Failed to fetch asset ${assetId}. Serial number will show as N/A.`);
      }
    }
    return null;
  };

  // Group movements by device and extract allocation/return dates.
  const deviceMap = {};
  assetMovements.forEach((movement) => {
    const tag = movement.newAssetTag || movement.previousAssetTag;
    if (!tag) return;

    // Group by assetId — it's stable across tag renames, unlike assetTag itself.
    const key = movement.assetId || tag;
    if (!deviceMap[key]) {
      deviceMap[key] = { assetTag: tag, assetId: movement.assetId, allocatedAt: null, returnedAt: null, isReturned: false, notes: [], lastMovedAt: null, serialNumber: null, assetType: null };
    }

    // Always display the tag from the most recent movement, so a renamed/returned
    if (!deviceMap[key].lastMovedAt || new Date(movement.movedAt) > new Date(deviceMap[key].lastMovedAt)) {
      deviceMap[key].assetTag = tag;
      deviceMap[key].lastMovedAt = movement.movedAt;
    }

    if (movement.notes && !deviceMap[key].notes.includes(movement.notes)) {
      deviceMap[key].notes.push(movement.notes);
    }
    if (movement.movementType === 'ALLOCATION') {
      const movedAt = new Date(movement.movedAt).getTime();
      if (!deviceMap[key].allocatedAt || movedAt < new Date(deviceMap[key].allocatedAt).getTime()) {
        deviceMap[key].allocatedAt = movement.movedAt;
      }
    }
    if (movement.movementType === 'RETURN ACCEPTED') {
      const movedAt = new Date(movement.movedAt).getTime();
      if (!deviceMap[key].returnedAt || movedAt > new Date(deviceMap[key].returnedAt).getTime()) {
        deviceMap[key].returnedAt = movement.movedAt;
      }
      deviceMap[key].isReturned = true;
    }
  });

  // Fetch serial numbers for all assets (parallel, with a per-asset timeout
  const deviceArray = Object.values(deviceMap);

  const fetchWithTimeout = (device) => {
    return Promise.race([
      (async () => {
        if (device.assetId) {
          const assetDetails = await fetchAssetDetails(device.assetId);
          if (assetDetails) {
            if (assetDetails.serialNumber) {
              device.serialNumber = assetDetails.serialNumber;
            }
            if (assetDetails.assetType?.name) {
              device.assetType = assetDetails.assetType.name;
            }
          }
        }
        return device;
      })(),
      // Timeout after 10 seconds per asset
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      ),
    ]).catch((error) => {
      console.warn(`Failed to fetch serial number for asset ${device.assetId}:`, error.message);
      return device; // Return device without serial number
    });
  };

  const assetDetailsPromises = deviceArray.map(fetchWithTimeout);
  const devices = await Promise.all(assetDetailsPromises);

  const deviceRowsHtml = devices.map((device, index) => {
    const rowBg = index % 2 === 0 ? '' : 'background: #f9fafb;';
    const statusLabel = device.isReturned ? 'Returned' : 'Pending';
    const statusColor = device.isReturned ? '#15803d' : '#b45309';
    const statusBg = device.isReturned ? '#f0fdf4' : '#fffbeb';
    const notesText = device.notes.length > 0 ? device.notes.join(', ') : 'N/A';
    const serialNumber = device.serialNumber || 'N/A';
    const assetTypeText = device.assetType || 'N/A';

    return `
      <tr style="${rowBg} page-break-inside: avoid; break-inside: avoid;">
        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 12px; font-weight: 600;">${device.assetTag}</td>
        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 12px;">${assetTypeText}</td>
        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 12px; font-weight: 500;">${serialNumber}</td>
        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 12px;">${formatDate(device.allocatedAt)}</td>
        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 12px;">${formatDate(device.returnedAt)}</td>
        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 12px; text-align: center;">
          <span style="background: ${statusBg}; color: ${statusColor}; font-weight: 600; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
            ${statusLabel}
          </span>
        </td>
        <td style="padding: 8px 10px; border: 1px solid #e5e7eb; font-size: 12px; max-width: 150px; word-wrap: break-word;">${notesText}</td>
      </tr>
    `;
  }).join('');

  const deviceSectionHtml = devices.length > 0 ? `
    <h2 style="font-size: 15px; font-weight: 700; color: #111; margin-bottom: 12px; margin-top: 28px;">
      Device History
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Device</th>
          <th style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Asset Type</th>
          <th style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Serial Number</th>
          <th style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Allocated On</th>
          <th style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Returned On</th>
          <th style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Status</th>
          <th style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Notes</th>
        </tr>
      </thead>
      <tbody>
        ${deviceRowsHtml}
      </tbody>
    </table>
  ` : '';

  const element = document.createElement('div');
  element.innerHTML = `
    <div style="position: relative; overflow: hidden; font-family: Arial, sans-serif; padding: 8px; max-width: 640px; margin: 0 auto; color: #111; z-index: 1;">
      <!-- Watermark layer -->
      <div style="
        position: absolute; 
        top: -50%; 
        left: -50%; 
        width: 200%; 
        height: 200%; 
        background-image: url('/images/1400w_x2400h__q_90_c_Navgurukul.webp'); 
        background-repeat: repeat; 
        background-size: 300px; 
        opacity: 0.08; 
        transform: rotate(-30deg); 
        z-index: -1; 
        pointer-events: none;
      "></div>
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

      ${deviceSectionHtml}

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; page-break-inside: avoid;">
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
      margin: [5, 8, 5, 8],  
      filename: 'NOC.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    })
    .from(element)
    .save();
}