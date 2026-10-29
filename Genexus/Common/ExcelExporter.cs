using ClosedXML.Excel;
using ClosedXML.Excel.Drawings;

namespace Itrion.Api.Common;

public static class ExcelExporter {
    public static async Task<byte[]> ExportAsync<T>(
        IList<T> data,
        string sheetName,
        string title,
        string[] headers,
        string[] documentMetadata,
        Func<T, object[]> mapRow,
        byte[]? logoBytes = null,
        Action<T, IXLRow>? styleRow = null) {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add(sheetName);

        var currentRow = 1;
        var numColumns = Math.Max(headers.Length, 4);

        int headerRowCount = Math.Max(3, documentMetadata.Length);
        var logoRange = ws.Range(1, 1, headerRowCount, 2);
        logoRange.Merge();

        for (int r = 1; r <= headerRowCount; r++) {
            ws.Row(r).Height = Math.Max(ws.Row(r).Height, 22.0);
        }

        // --- TITULO ---
        ws.Cell(currentRow, 3).Value = title;
        ws.Cell(currentRow, 3).Style.Font.Bold = true;
        ws.Cell(currentRow, 3).Style.Font.FontSize = 14;
        ws.Cell(currentRow, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Cell(currentRow, 3).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        ws.Range(currentRow, 3, currentRow + documentMetadata.Length - 1, numColumns - 1).Merge();

        // Document Metadata
        foreach(var metadata in documentMetadata) {
            ws.Cell(currentRow, numColumns).Value = metadata;
            currentRow++;
        }

        // Aseguramos que la tabla empiece después del bloque del encabezado
        currentRow = Math.Max(currentRow, headerRowCount + 1);

        // --- FECHA DE GENERACION ---
        ws.Cell(1, numColumns + 1).Value = $"Generado el {AppTimeZone.NowInArgentina:dd/MM/yyyy HH:mm}";
        ws.Cell(1, numColumns + 1).Style.Font.Italic = true;
        ws.Cell(1, numColumns + 1).Style.Font.FontColor = XLColor.Gray;
        
        // --- CABECERA DE COLUMNAS ---
        for (int i = 0; i < headers.Length; i++) {
            var cell = ws.Cell(currentRow, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#2C3E50");
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }
        currentRow++;

        // --- DATOS ---
        foreach (var item in data) {
            var values = mapRow(item);
            for (int i = 0; i < values.Length; i++)
                ws.Cell(currentRow, i + 1).Value = XLCellValue.FromObject(values[i]);

            // filas alternadas
            if (currentRow % 2 == 0)
                ws.Range(currentRow, 1, currentRow, headers.Length)
                    .Style.Fill.BackgroundColor = XLColor.FromHtml("#F2F2F2");

            ws.Range(currentRow, 1, currentRow, headers.Length)
                .Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            styleRow?.Invoke(item, ws.Row(currentRow));

            currentRow++;
        }

        ws.Columns().AdjustToContents();
        // agregamos un padding a las columnas ya que AdjustToContents hace el ancho justo
        double padding = 2.0;
        foreach (var column in ws.Columns(1, numColumns)) {
            column.Width += padding;
        }

        // --- LOGO: se inserta a su tamaño nativo (ADR 0001: este MVP no resuelve logos) ---
        if (logoBytes is not null && logoBytes.Length > 0) {
            ws.Column(1).Width = Math.Max(ws.Column(1).Width, 14.0);
            ws.Column(2).Width = Math.Max(ws.Column(2).Width, 14.0);

            using var imageStream = new MemoryStream(logoBytes);
            var picture = ws.AddPicture(imageStream, XLPictureFormat.Png);
            picture.MoveTo(ws.Cell(1, 1));
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
