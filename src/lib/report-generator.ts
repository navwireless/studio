
// src/lib/report-generator.ts
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, VerticalAlign, BorderStyle, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import type { AnalysisResult } from '@/types';

function createSectionTitle(text: string): Paragraph {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { after: 200, before: 300 },
  });
}

function createStyledParagraph(text: string, options?: any): Paragraph {
  return new Paragraph({
    children: [new TextRun(text)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200 },
    ...options,
  });
}

function createLinkDetailTable(analysisResult: AnalysisResult): Table {
  const { pointA, pointB, distanceKm, losPossible, clearanceThresholdUsed, minClearance } = analysisResult;
  const pointAName = pointA.name || "Site A";
  const pointBName = pointB.name || "Site B";

  const data = [
    { label: "Site A Name", value: pointAName },
    { label: "Site A Latitude", value: pointA.lat.toFixed(6) },
    { label: "Site A Longitude", value: pointA.lng.toFixed(6) },
    { label: "Site A Tower Height (m)", value: pointA.towerHeight.toString() },
    { label: "Site B Name", value: pointBName },
    { label: "Site B Latitude", value: pointB.lat.toFixed(6) },
    { label: "Site B Longitude", value: pointB.lng.toFixed(6) },
    { label: "Site B Tower Height (m)", value: pointB.towerHeight.toString() },
    { label: "Aerial Distance", value: distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)}km` },
    { label: "Required Fresnel Height (m)", value: clearanceThresholdUsed.toString() },
    { label: "Min. Actual Clearance (m)", value: minClearance?.toFixed(1) ?? 'N/A' },
    { label: "LOS Feasible?", value: losPossible ? "Yes" : "No" },
  ];

  const rows = data.map(item => new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: item.label, bold: true })], spacing: {before: 80, after: 80} })],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" }, left: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" }, right: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" } },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun(item.value)], spacing: {before: 80, after: 80} })],
        columnSpan: 2, // To make the table two columns effectively for label-value pairs
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" }, left: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" }, right: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" } },
      }),
    ],
  }));

  return new Table({
    rows: rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [4000, 5500], // Adjusted for two effective columns
  });
}


function createSummaryTable(analysisResults: AnalysisResult[]): Table {
  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "No.", bold: true })] })], verticalAlign: VerticalAlign.CENTER }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Link Description", bold: true })] })], verticalAlign: VerticalAlign.CENTER }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Aerial Distance", bold: true })] })], verticalAlign: VerticalAlign.CENTER }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "LOS Feasible?", bold: true })] })], verticalAlign: VerticalAlign.CENTER }),
    ],
  });

  const dataRows = analysisResults.map((result, index) => {
    const pointAName = result.pointA.name || "Site A";
    const pointBName = result.pointB.name || "Site B";
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(String(index + 1))] , verticalAlign: VerticalAlign.CENTER}),
        new TableCell({ children: [new Paragraph(`${pointAName} to ${pointBName}`)], verticalAlign: VerticalAlign.CENTER }),
        new TableCell({ children: [new Paragraph(result.distanceKm < 1 ? `${(result.distanceKm * 1000).toFixed(0)}m` : `${result.distanceKm.toFixed(1)}km`)] , verticalAlign: VerticalAlign.CENTER}),
        new TableCell({ children: [new Paragraph(result.losPossible ? "Yes" : "No")] , verticalAlign: VerticalAlign.CENTER}),
      ],
    });
  });

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [500, 4500, 2000, 2000],
  });
}


export async function generateReportDocx(analysisResults: AnalysisResult[]): Promise<void> {
  if (!analysisResults || analysisResults.length === 0) {
    throw new Error("No analysis results provided for report generation.");
  }

  const sections: any[] = [];

  if (analysisResults.length > 1) {
    sections.push({
      properties: {},
      children: [
        new Paragraph({
          text: "LOS Survey Report Summary",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        createSummaryTable(analysisResults),
        new Paragraph({ children: [new PageBreak()] }), // Page break after summary
      ],
    });
  }

  analysisResults.forEach((analysisResult, index) => {
    const { pointA, pointB, distanceKm, losPossible, clearanceThresholdUsed } = analysisResult;
    const pointAName = pointA.name || "Point A";
    const pointBName = pointB.name || "Point B";

    const remarksText = `As per desktop survey, LOS is ${losPossible ? "Possible" : "Not Possible"} from "${pointAName}" to "${pointBName}". Aerial distance between two sites is ${distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)}km`}. We have considered tower height as ${pointA.towerHeight}m for ${pointAName} and ${pointB.towerHeight}m for ${pointBName} and Fresnel height (clearance threshold) as ${clearanceThresholdUsed}m for this survey. Physical survey is recommended for further analysis of the site.`;
    
    const children = [
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
      createSectionTitle("Link Details:"),
      createLinkDetailTable(analysisResult),
      createSectionTitle("Remarks:"),
      createStyledParagraph(remarksText),
      createSectionTitle("Attachments:"),
      createStyledParagraph("[Map Snapshot Placeholder]", { italics: true, alignment: AlignmentType.CENTER }),
      createStyledParagraph("Map snapshot showing link path.", { style: "Caption", alignment: AlignmentType.CENTER }),
      createStyledParagraph("\n[Elevation Profile Snapshot Placeholder]", { italics: true, alignment: AlignmentType.CENTER, spacing: { before: 200 } }),
      createStyledParagraph("Elevation profile chart.", { style: "Caption", alignment: AlignmentType.CENTER }),
    ];

    if (index < analysisResults.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    
    sections.push({
        properties: {},
        children: children
    });
  });


  const doc = new Document({
    sections: sections,
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
    const reportNameBase = analysisResults.length > 1 ? "Multi_Link_LOS_Report" : `LOS_Report_${analysisResults[0].pointA.name || 'SiteA'}_to_${analysisResults[0].pointB.name || 'SiteB'}`;
    saveAs(blob, `${reportNameBase}.docx`);
  } catch (error) {
    console.error("Error generating DOCX blob:", error);
    throw new Error("Failed to generate report document.");
  }
}
