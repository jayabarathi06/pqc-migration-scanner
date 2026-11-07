"""
ReportLab PDF Generation Module
Generates a comprehensive, publication-quality executive and technical audit report
for Post-Quantum Cryptography migration readiness.
"""
import io
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, HRFlowable
)


def generate_pqc_pdf_report(scan_data: Dict[str, Any]) -> bytes:
    """
    Takes scan JSON output and compiles a structured PDF report.
    Returns the binary content of the generated PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom palette
    NAVY = colors.HexColor("#0F172A")
    SLATE = colors.HexColor("#334155")
    CYAN = colors.HexColor("#0891B2")
    RED_ALERT = colors.HexColor("#DC2626")
    AMBER_ALERT = colors.HexColor("#D97706")
    GREEN_OK = colors.HexColor("#059669")
    LIGHT_BG = colors.HexColor("#F8FAFC")
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Typography styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=NAVY
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=SLATE
    )
    section_h1 = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=NAVY,
        spaceBefore=14,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=SLATE
    )
    bold_body = ParagraphStyle(
        "BoldBody",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=NAVY
    )
    code_snippet_style = ParagraphStyle(
        "CodeSnippet",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#0F172A")
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#64748B")
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("Post-Quantum Cryptography (PQC) Migration Assessment", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("NIST PQC Standards Alignment (FIPS 203, 204, 205) & Quantum Threat Exposure", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=CYAN, spaceBefore=2, spaceAfter=12))

    # 2. Executive Overview Table
    project_name = scan_data.get("project_name", "Uploaded Codebase")
    scanned_at = scan_data.get("scanned_at", "N/A")
    files_scanned = scan_data.get("total_files_scanned", 0)
    total_findings = scan_data.get("total_findings", 0)
    risk_summary = scan_data.get("risk_summary", {})
    score = risk_summary.get("score", 0)
    tier = risk_summary.get("tier", "Unknown")

    score_color = RED_ALERT if score >= 75 else (AMBER_ALERT if score >= 40 else GREEN_OK)

    score_cell = Paragraph(
        f"<font color='{score_color.hexval()}'><b>{score} / 100</b></font><br/>"
        f"<b>{tier}</b>",
        bold_body
    )

    overview_data = [
        [
            Paragraph("<b>Project:</b>", bold_body), Paragraph(str(project_name), body_style),
            Paragraph("<b>Quantum Risk Score:</b>", bold_body), score_cell
        ],
        [
            Paragraph("<b>Assessment Date:</b>", bold_body), Paragraph(str(scanned_at), body_style),
            Paragraph("<b>Total Files Audited:</b>", bold_body), Paragraph(str(files_scanned), body_style)
        ],
        [
            Paragraph("<b>Total Detections:</b>", bold_body), Paragraph(str(total_findings), body_style),
            Paragraph("<b>Methodology:</b>", bold_body), Paragraph("AST & Pattern Static Analysis", body_style)
        ]
    ]

    overview_table = Table(overview_data, colWidths=[95, 175, 120, 150])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 10))

    # 3. Assessment Rationale
    assessment_text = risk_summary.get("assessment", "")
    calc_explanation = risk_summary.get("calculation_explanation", "")
    if assessment_text or calc_explanation:
        story.append(Paragraph("Executive Risk Assessment", section_h1))
        story.append(Paragraph(f"<b>Posture Analysis:</b> {assessment_text}", body_style))
        story.append(Spacer(1, 3))
        story.append(Paragraph(f"<b>Scoring Breakdown:</b> {calc_explanation}", body_style))
        story.append(Spacer(1, 8))

    # 4. Severity & Priority Matrices
    severity_counts = risk_summary.get("severity_breakdown", {})
    priority_counts = risk_summary.get("priority_breakdown", {})

    breakdown_data = [
        [
            Paragraph("<b>High Risk (Shor's Threat):</b>", bold_body), Paragraph(str(severity_counts.get("High", 0)), body_style),
            Paragraph("<b>Priority 1 (P1 - Immediate):</b>", bold_body), Paragraph(str(priority_counts.get("P1", 0)), body_style)
        ],
        [
            Paragraph("<b>Medium Risk (Legacy Ciphers):</b>", bold_body), Paragraph(str(severity_counts.get("Medium", 0)), body_style),
            Paragraph("<b>Priority 2 (P2 - Plan Migration):</b>", bold_body), Paragraph(str(priority_counts.get("P2", 0)), body_style)
        ],
        [
            Paragraph("<b>Low Risk (AES-128 Grover):</b>", bold_body), Paragraph(str(severity_counts.get("Low", 0)), body_style),
            Paragraph("<b>Priority 3 (P3 - Review / Agility):</b>", bold_body), Paragraph(str(priority_counts.get("P3", 0)), body_style)
        ],
        [
            Paragraph("<b>Informational (Resilient/Docs):</b>", bold_body), Paragraph(str(severity_counts.get("Informational", 0)), body_style),
            Paragraph("<b>Total Scanned Candidates:</b>", bold_body), Paragraph(str(total_findings), body_style)
        ]
    ]

    breakdown_table = Table(breakdown_data, colWidths=[140, 130, 140, 130])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('BOX', (0, 0), (-1, -1), 0.8, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(breakdown_table)
    story.append(Spacer(1, 14))

    # 5. Detailed Findings Section
    story.append(Paragraph("Detailed Cryptographic Findings", section_h1))
    findings: List[Dict[str, Any]] = scan_data.get("findings", [])

    if not findings:
        story.append(Paragraph("No cryptographic symbols detected during this scan.", body_style))
    else:
        for idx, finding in enumerate(findings):
            fid = finding.get("id", f"PQC-{idx+1}")
            algo = finding.get("algorithm", "Unknown")
            risk = finding.get("risk", "Informational")
            prio = finding.get("migration_priority", "P3")
            purpose = finding.get("purpose", "unknown")
            file_path = finding.get("file_path", "unknown")
            line_no = finding.get("line", 0)
            confidence = finding.get("confidence", "Medium")
            support = finding.get("support_level", "limited detection")
            snippet = finding.get("evidence_snippet", "")
            risk_exp = finding.get("risk_explanation", "")
            rec = finding.get("recommendation", "")

            # Color tag for finding header
            badge_color = RED_ALERT if risk == "High" else (AMBER_ALERT if risk == "Medium" else (CYAN if risk == "Low" else SLATE))

            finding_header = Paragraph(
                f"<b>[{fid}] {algo}</b> — Risk: <font color='{badge_color.hexval()}'><b>{risk}</b></font> | "
                f"Priority: <b>{prio}</b> | Purpose: <i>{purpose}</i>",
                bold_body
            )
            loc_para = Paragraph(
                f"<b>File:</b> {file_path}:{line_no} &nbsp;|&nbsp; <b>Confidence:</b> {confidence} &nbsp;|&nbsp; <b>Engine:</b> {support}",
                body_style
            )
            snippet_para = Paragraph(snippet.replace(" ", "&nbsp;").replace("\n", "<br/>"), code_snippet_style)
            exp_para = Paragraph(f"<b>Threat Analysis:</b> {risk_exp}", body_style)
            rec_para = Paragraph(f"<b>NIST Guidance:</b> {rec}", body_style)

            finding_card_data = [
                [finding_header],
                [loc_para],
                [snippet_para],
                [exp_para],
                [rec_para]
            ]

            card_table = Table(finding_card_data, colWidths=[540])
            card_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG),
                ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor("#F1F5F9")),
                ('BOX', (0, 0), (-1, -1), 0.8, BORDER_COLOR),
                ('LINEBELOW', (0, 0), (-1, 0), 0.5, BORDER_COLOR),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))

            story.append(KeepTogether([card_table, Spacer(1, 8)]))

    # 6. NIST PQC Standards Reference & Limitations
    story.append(Spacer(1, 10))
    story.append(Paragraph("NIST Post-Quantum Cryptography Migration Reference", section_h1))
    
    standards_data = [
        [
            Paragraph("<b>Standard</b>", bold_body),
            Paragraph("<b>Primary Algorithm</b>", bold_body),
            Paragraph("<b>Target Migration Purpose</b>", bold_body)
        ],
        [
            Paragraph("FIPS 203", bold_body),
            Paragraph("ML-KEM (derived from Kyber)", body_style),
            Paragraph("General Key Establishment (replaces RSA/ECDH; evaluate hybrid X25519+ML-KEM)", body_style)
        ],
        [
            Paragraph("FIPS 204", bold_body),
            Paragraph("ML-DSA (derived from Dilithium)", body_style),
            Paragraph("General Digital Signatures (replaces RSA/ECDSA/DSA)", body_style)
        ],
        [
            Paragraph("FIPS 205", bold_body),
            Paragraph("SLH-DSA (derived from SPHINCS+)", body_style),
            Paragraph("Stateless Hash-based Signatures (firmware, secure boot, non-lattice fallback)", body_style)
        ]
    ]

    standards_table = Table(standards_data, colWidths=[90, 180, 270])
    standards_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.8, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(standards_table)

    # 7. Audit Limitations & Disclaimer
    story.append(Spacer(1, 12))
    story.append(Paragraph("Scan Limitations & Legal Notice", section_h1))
    limitations = risk_summary.get("limitations", [])
    for lim in limitations:
        story.append(Paragraph(f"• {lim}", disclaimer_style))
        story.append(Spacer(1, 2))

    disclaimer = scan_data.get("disclaimer", "")
    if disclaimer:
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"<b>Disclaimer:</b> {disclaimer}", disclaimer_style))

    # Build PDF
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
