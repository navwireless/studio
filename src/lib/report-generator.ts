
// src/lib/report-generator.ts
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, VerticalAlign, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import type { AnalysisResult, AnalysisFormValues } from '@/types';

export async function generateReportDocx(analysisResult: AnalysisResult, formData: AnalysisFormValues): Promise<void> {
  const { pointA, pointB, distanceKm, losPossible, clearanceThresholdUsed, minClearance } = analysisResult;
  
  const pointAName = formData.pointA.name || "Point A";
  const pointBName = formData.pointB.name || "Point B";

  const tableData = [
    ["Parameter", "Point A", "Point B"],
    ["Site Name", pointAName, pointBName],
    ["Latitude", pointA.lat.toFixed(6), pointB.lat.toFixed(6)],
    ["Longitude", pointA.lng.toFixed(6), pointB.lng.toFixed(6)],
    ["Tower Height (m)", pointA.towerHeight.toString(), pointB.towerHeight.toString()],
    ["Aerial Distance (km/m)", distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)}km`, ""],
    ["Fresnel Height Considered (m)", clearanceThresholdUsed.toString(), ""],
    ["Min. Actual Clearance (m)", minClearance?.toFixed(1) ?? 'N/A', ""],
    ["LOS Feasible?", losPossible ? "Yes" : "No", ""],
  ];

  const tableRows = tableData.map((rowData, rowIndex) => {
    return new TableRow({
      children: rowData.map((cellData, cellIndex) => {
        return new TableCell({
          children: [new Paragraph({ 
            children: [new TextRun({ text: cellData, bold: rowIndex === 0 || cellIndex === 0 })],
            spacing: { after: 80, before: 80 }, 
          })],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
          },
        });
      }),
    });
  });

  const table = new Table({
    rows: tableRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    columnWidths: [3500, 3000, 3000], // Relative widths
  });

  const remarksText = `As per desktop survey, LOS is ${losPossible ? "Possible" : "Not Possible"} from "${pointAName}" to "${pointBName}". Aerial distance between two sites is ${distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)}km`}. We have considered tower height as ${pointA.towerHeight}m for ${pointAName} and ${pointB.towerHeight}m for ${pointBName} and Fresnel height (clearance threshold) as ${clearanceThresholdUsed}m for this survey. Physical survey is recommended for further analysis of the site.`;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `LOS Survey Report: ${pointAName} to ${pointBName}`,
              bold: true,
              size: 32, // 16pt
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
        new Paragraph({ text: "Link Details:", heading: HeadingLevel.HEADING_2, spacing: { after: 150, before: 200 } }),
        table,
        new Paragraph({ text: "Remarks:", heading: HeadingLevel.HEADING_2, spacing: { after: 150, before: 300 } }),
        new Paragraph({
          children: [new TextRun(remarksText)],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "\n\n[Map Snapshot Placeholder]", italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({ text: "Map snapshot showing link path.", alignment: AlignmentType.CENTER, style: "Caption"}),

        new Paragraph({
          children: [new TextRun({ text: "\n\n[Elevation Profile Snapshot Placeholder]", italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100, before: 200 },
        }),
        new Paragraph({ text: "Elevation profile chart.", alignment: AlignmentType.CENTER, style: "Caption"}),
      ],
    }],
    styles: {
      paragraphStyles: [
        {
          id: "Caption",
          name: "Caption",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 18, // 9pt
            italics: true,
            color: "808080" // Grey
          },
           paragraph: {
             spacing: {after: 200}
           }
        }
      ]
    }
  });

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `LOS_Report_${pointAName}_to_${pointBName}.docx`);
  } catch (error) {
    console.error("Error generating DOCX blob:", error);
    throw new Error("Failed to generate report document.");
  }
}
