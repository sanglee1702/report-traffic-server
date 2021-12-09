import excelJS from 'exceljs';

const exportExcel = async (
  columns: Partial<excelJS.Column>[],
  data: any[],
): Promise<excelJS.Buffer | null> => {
  const workbook = new excelJS.Workbook(); // Create a new workbook
  const worksheet = workbook.addWorksheet('My Account'); // New Worksheet
  // Column for data in excel. key must match data key
  worksheet.columns = columns;

  // Looping through User data
  data.forEach((user) => {
    worksheet.addRow(user); // Add data in worksheet
  });
  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, size: 14 };
  });

  try {
    let res = await workbook.xlsx.writeBuffer();

    return res;
  } catch (err) {
    return null;
  }
};

export default exportExcel;
