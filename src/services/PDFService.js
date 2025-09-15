// PDF Service using jsPDF for reliable PDF generation
import jsPDF from 'jspdf'

class PDFService {
  constructor() {
    this.branding = {
      companyName: 'SEO Mojo',
      logo: 'https://via.placeholder.com/150x50/3498db/ffffff?text=SEO+Mojo',
      primaryColor: '#3498db',
      secondaryColor: '#2c3e50'
    }
  }

  async generatePDF(auditData, userInfo) {
    try {
      // Try static import first, then dynamic import as fallback
      let jsPDFClass = jsPDF
      
      if (!jsPDFClass) {
        try {
          const jsPDFModule = await import('jspdf')
          jsPDFClass = jsPDFModule.jsPDF || jsPDFModule.default
        } catch (importError) {
          console.error('Failed to import jsPDF:', importError)
          throw new Error('PDF library not available. Please refresh the page and try again.')
        }
      }
      
      // Create new PDF document
      const doc = new jsPDFClass()
      
      // Add content to PDF
      this.addPDFContent(doc, auditData, userInfo)
      
      // Generate blob
      const pdfBlob = doc.output('blob')
      
      return {
        success: true,
        blob: pdfBlob,
        url: URL.createObjectURL(pdfBlob),
        filename: this.generateFilename(auditData.url, auditData.timestamp)
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      
      // Fallback: Create a simple HTML report that can be printed
      if (error.message.includes('PDF library not available')) {
        return this.generateHTMLFallback(auditData, userInfo)
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  generateHTMLFallback(auditData, userInfo) {
    // Create a simple HTML report as fallback
    const htmlContent = this.generateHTMLReport(auditData, userInfo)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    
    return {
      success: true,
      blob: blob,
      url: URL.createObjectURL(blob),
      filename: `seo-audit-report-${Date.now()}.html`,
      isHTMLFallback: true
    }
  }

  generateHTMLReport(auditData, userInfo) {
    const { onPage, technical, content } = auditData
    const overallScore = Math.round((onPage.score + technical.score + content.score) / 3)
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>SEO Audit Report - ${userInfo.website}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #3498db; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score { font-size: 2em; font-weight: bold; color: #27ae60; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .issue { background: #fff3cd; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .recommendation { background: #d4edda; padding: 10px; margin: 5px 0; border-radius: 3px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 SEO Mojo - Audit Report</h1>
        <p><strong>Website:</strong> ${userInfo.website}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Overall Score:</strong> <span class="score">${overallScore}/100</span></p>
    </div>
    
    <div class="section">
        <h2>📊 On-Page SEO (${onPage.score}/100)</h2>
        <p><strong>Status:</strong> ${onPage.score >= 70 ? 'Good' : onPage.score >= 50 ? 'Needs Improvement' : 'Poor'}</p>
        <h3>Issues Found:</h3>
        ${onPage.issues.map(issue => `<div class="issue">${issue}</div>`).join('')}
        <h3>Recommendations:</h3>
        ${onPage.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
    </div>
    
    <div class="section">
        <h2>⚡ Technical SEO (${technical.score}/100)</h2>
        <p><strong>Status:</strong> ${technical.score >= 70 ? 'Good' : technical.score >= 50 ? 'Needs Improvement' : 'Poor'}</p>
        <h3>Performance Metrics:</h3>
        <p>Page Speed: ${technical.performance?.score || 'N/A'}/100</p>
        <h3>Issues Found:</h3>
        ${technical.issues.map(issue => `<div class="issue">${issue}</div>`).join('')}
        <h3>Recommendations:</h3>
        ${technical.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
    </div>
    
    <div class="section">
        <h2>📝 Content Analysis (${content.score}/100)</h2>
        <p><strong>Status:</strong> ${content.score >= 70 ? 'Good' : content.score >= 50 ? 'Needs Improvement' : 'Poor'}</p>
        <h3>Issues Found:</h3>
        ${content.issues.map(issue => `<div class="issue">${issue}</div>`).join('')}
        <h3>Recommendations:</h3>
        ${content.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
    </div>
    
    <div class="section">
        <h2>📧 Contact Information</h2>
        <p><strong>Name:</strong> ${userInfo.name}</p>
        <p><strong>Email:</strong> ${userInfo.email}</p>
        <p><strong>Company:</strong> ${userInfo.company || 'Not provided'}</p>
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #666;">
        <p>Report generated by SEO Mojo - Professional SEO Audit Tool</p>
        <p>To print this report, use Ctrl+P (Cmd+P on Mac)</p>
    </div>
</body>
</html>`
  }

  addPDFContent(doc, auditData, userInfo) {
    let yPosition = 20
    
    // Title
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('SEO Audit Report', 20, yPosition)
    yPosition += 15
    
    // Subtitle
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Analysis for: ${auditData.url}`, 20, yPosition)
    yPosition += 10
    
    // Date
    doc.text(`Generated on: ${new Date(auditData.timestamp).toLocaleDateString()}`, 20, yPosition)
    yPosition += 20
    
    // Overall Score
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall SEO Score', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(48)
    doc.setTextColor(39, 174, 96) // Green color
    doc.text(`${auditData.overallScore}`, 20, yPosition)
    yPosition += 15
    
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`Grade: ${auditData.summary.grade} - ${auditData.summary.description}`, 20, yPosition)
    yPosition += 20
    
    // Category Scores
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Category Breakdown', 20, yPosition)
    yPosition += 15
    
    const categories = [
      { name: 'On-Page SEO', score: auditData.categories.onPage?.score || 0 },
      { name: 'Technical SEO', score: auditData.categories.technical?.score || 0 },
      { name: 'Performance', score: auditData.categories.performance?.score || 0 },
      { name: 'Content Quality', score: auditData.categories.content?.score || 0 }
    ]
    
    categories.forEach(category => {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`${category.name}: ${category.score}/100`, 30, yPosition)
      yPosition += 8
    })
    
    yPosition += 10
    
    // High Priority Issues
    const highPriorityIssues = [
      ...(auditData.categories.onPage?.issues || []),
      ...(auditData.categories.technical?.issues || []),
      ...(auditData.categories.performance?.issues || []),
      ...(auditData.categories.content?.issues || [])
    ].filter(issue => issue.severity === 'high').slice(0, 5)
    
    if (highPriorityIssues.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('High Priority Issues', 20, yPosition)
      yPosition += 10
      
      highPriorityIssues.forEach((issue, index) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`${index + 1}. ${issue.message}`, 30, yPosition)
        yPosition += 6
        
        doc.setFont('helvetica', 'normal')
        const splitRecommendation = doc.splitTextToSize(issue.recommendation, 150)
        doc.text(splitRecommendation, 35, yPosition)
        yPosition += splitRecommendation.length * 4 + 5
      })
    }
    
    // Footer
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Generated by SEO Mojo - Professional SEO Audit Tool', 20, 280)
  }

  generateFilename(url, timestamp) {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      const date = new Date(timestamp).toISOString().split('T')[0]
      return `SEO-Audit-${domain}-${date}.pdf`
    } catch {
      const date = new Date(timestamp).toISOString().split('T')[0]
      return `SEO-Audit-${date}.pdf`
    }
  }

  downloadPDF(blob, filename) {
    try {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error) {
      console.error('PDF download error:', error)
      return { success: false, error: error.message }
    }
  }

  async emailPDF(auditData, userInfo, emailService) {
    try {
      // Generate PDF
      const pdfResult = await this.generatePDF(auditData, userInfo)
      
      if (!pdfResult.success) {
        throw new Error(pdfResult.error)
      }

      // Prepare email data
      const emailData = {
        to: userInfo.email,
        subject: `SEO Audit Report for ${auditData.url}`,
        html: this.generateEmailHTML(auditData, userInfo),
        attachments: [
          {
            filename: pdfResult.filename,
            content: pdfResult.blob,
            contentType: 'application/pdf'
          }
        ]
      }

      // Send email (this would integrate with your email service)
      const emailResult = await emailService.sendEmail(emailData)
      
      return {
        success: emailResult.success,
        message: emailResult.success 
          ? 'PDF report sent successfully!' 
          : 'Failed to send email: ' + emailResult.error
      }
    } catch (error) {
      console.error('Email PDF error:', error)
      return {
        success: false,
        message: 'Failed to send PDF report: ' + error.message
      }
    }
  }

  generateEmailHTML(auditData, userInfo) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SEO Audit Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #3498db, #2c3e50); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .score { font-size: 48px; font-weight: bold; color: #27ae60; text-align: center; margin: 20px 0; }
          .category { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3498db; }
          .issue { background: #fff5f5; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #e74c3c; }
          .strength { background: #f0fff4; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #27ae60; }
          .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔍 SEO Audit Report</h1>
          <p>Comprehensive analysis for ${auditData.url}</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userInfo.name}!</h2>
          <p>Thank you for using SEO Mojo! Your comprehensive SEO audit report is ready and attached to this email.</p>
          
          <div class="score">
            ${auditData.overallScore}/100
          </div>
          
          <h3>📊 Overall Grade: ${auditData.summary.grade}</h3>
          <p>${auditData.summary.description}</p>
          
          <div class="category">
            <h4>📈 Category Breakdown</h4>
            <p><strong>On-Page SEO:</strong> ${auditData.categories.onPage?.score || 0}/100</p>
            <p><strong>Technical SEO:</strong> ${auditData.categories.technical?.score || 0}/100</p>
            <p><strong>Performance:</strong> ${auditData.categories.performance?.score || 0}/100</p>
            <p><strong>Content Quality:</strong> ${auditData.categories.content?.score || 0}/100</p>
          </div>
          
          <h3>🚨 Priority Issues Found</h3>
          <p>${auditData.summary.priorityIssues} high priority issues • ${auditData.summary.totalIssues} total issues</p>
          
          <h3>✅ Key Strengths</h3>
          ${auditData.categories.onPage?.strengths?.slice(0, 5).map(strength => 
            `<div class="strength">✓ ${strength}</div>`
          ).join('')}
          
          <p><strong>📎 Attached:</strong> Complete PDF report with detailed analysis, recommendations, and technical insights.</p>
          
          <p>Need help implementing these recommendations? Our SEO experts are here to help!</p>
        </div>
        
        <div class="footer">
          <p>Generated by SEO Mojo - Professional SEO Audit Tool</p>
          <p>Visit us at <a href="#" style="color: #3498db;">seomojo.com</a></p>
        </div>
      </body>
      </html>
    `
  }

  // Mock email service for demo purposes
  async sendEmailMock(emailData) {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real implementation, this would integrate with:
    // - SendGrid, Mailgun, AWS SES, etc.
    console.log('Mock email sent:', {
      to: emailData.to,
      subject: emailData.subject,
      hasAttachment: emailData.attachments?.length > 0
    })
    
    return { success: true }
  }
}

export default PDFService
