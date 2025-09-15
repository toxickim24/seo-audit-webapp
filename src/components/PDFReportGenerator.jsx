import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'

// Register fonts for better styling
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2', fontWeight: 'bold' }
  ]
})

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db'
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  date: {
    fontSize: 10,
    color: '#7f8c8d'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#27ae60',
    marginRight: 20
  },
  scoreDetails: {
    flexDirection: 'column'
  },
  scoreLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  categoryCard: {
    width: '48%',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db'
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  categoryScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5
  },
  categoryLabel: {
    fontSize: 10,
    color: '#7f8c8d'
  },
  issuesList: {
    marginTop: 15
  },
  issueItem: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff5f5',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c'
  },
  issueSeverity: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginRight: 10,
    width: 60
  },
  issueContent: {
    flex: 1
  },
  issueMessage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3
  },
  issueRecommendation: {
    fontSize: 10,
    color: '#7f8c8d'
  },
  strengthsList: {
    marginTop: 15
  },
  strengthItem: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f0fff4',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#27ae60'
  },
  strengthIcon: {
    fontSize: 12,
    color: '#27ae60',
    marginRight: 8,
    width: 20
  },
  strengthText: {
    fontSize: 11,
    color: '#2c3e50',
    flex: 1
  },
  technicalDetails: {
    marginTop: 15
  },
  technicalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  technicalItem: {
    width: '48%',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db'
  },
  technicalTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  technicalDetail: {
    fontSize: 10,
    color: '#7f8c8d',
    marginBottom: 3
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#7f8c8d',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 15
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 10,
    color: '#7f8c8d'
  }
})

// PDF Report Component
const SEOReportPDF = ({ auditData, userInfo }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return '#27ae60'
    if (score >= 80) return '#f39c12'
    if (score >= 70) return '#e67e22'
    if (score >= 60) return '#e74c3c'
    return '#c0392b'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#e74c3c'
      case 'medium': return '#f39c12'
      case 'low': return '#3498db'
      default: return '#7f8c8d'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const allIssues = [
    ...(auditData.categories.onPage?.issues || []),
    ...(auditData.categories.technical?.issues || []),
    ...(auditData.categories.performance?.issues || []),
    ...(auditData.categories.content?.issues || [])
  ]

  const highPriorityIssues = allIssues.filter(issue => issue.severity === 'high')
  const mediumPriorityIssues = allIssues.filter(issue => issue.severity === 'medium')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>SEO Mojo</Text>
          <Text style={styles.date}>{formatDate(auditData.timestamp)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>SEO Audit Report</Text>
        <Text style={styles.subtitle}>
          Comprehensive analysis for {auditData.url}
        </Text>

        {/* Overall Score */}
        <View style={styles.scoreSection}>
          <Text style={[styles.overallScore, { color: getScoreColor(auditData.overallScore) }]}>
            {auditData.overallScore}
          </Text>
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreLabel}>Overall SEO Score</Text>
            <Text style={styles.scoreValue}>
              Grade: {auditData.summary.grade} - {auditData.summary.description}
            </Text>
            <Text style={styles.scoreLabel}>
              {auditData.summary.priorityIssues} High Priority Issues • {auditData.summary.totalIssues} Total Issues
            </Text>
          </View>
        </View>

        {/* Category Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.categoryGrid}>
            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>On-Page SEO</Text>
              <Text style={[styles.categoryScore, { color: getScoreColor(auditData.categories.onPage?.score || 0) }]}>
                {auditData.categories.onPage?.score || 0}
              </Text>
              <Text style={styles.categoryLabel}>out of 100</Text>
            </View>
            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Technical SEO</Text>
              <Text style={[styles.categoryScore, { color: getScoreColor(auditData.categories.technical?.score || 0) }]}>
                {auditData.categories.technical?.score || 0}
              </Text>
              <Text style={styles.categoryLabel}>out of 100</Text>
            </View>
            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Performance</Text>
              <Text style={[styles.categoryScore, { color: getScoreColor(auditData.categories.performance?.score || 0) }]}>
                {auditData.categories.performance?.score || 0}
              </Text>
              <Text style={styles.categoryLabel}>out of 100</Text>
            </View>
            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Content Quality</Text>
              <Text style={[styles.categoryScore, { color: getScoreColor(auditData.categories.content?.score || 0) }]}>
                {auditData.categories.content?.score || 0}
              </Text>
              <Text style={styles.categoryLabel}>out of 100</Text>
            </View>
          </View>
        </View>

        {/* High Priority Issues */}
        {highPriorityIssues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 High Priority Issues</Text>
            <View style={styles.issuesList}>
              {highPriorityIssues.slice(0, 5).map((issue, index) => (
                <View key={index} style={styles.issueItem}>
                  <Text style={styles.issueSeverity}>HIGH</Text>
                  <View style={styles.issueContent}>
                    <Text style={styles.issueMessage}>{issue.message}</Text>
                    <Text style={styles.issueRecommendation}>{issue.recommendation}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Technical Details */}
        {auditData.categories.technical?.details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Analysis Details</Text>
            <View style={styles.technicalDetails}>
              <View style={styles.technicalGrid}>
                <View style={styles.technicalItem}>
                  <Text style={styles.technicalTitle}>🔒 HTTPS & Security</Text>
                  <Text style={styles.technicalDetail}>
                    HTTPS: {auditData.categories.technical.details.https?.enabled ? '✅ Enabled' : '❌ Not Enabled'}
                  </Text>
                  <Text style={styles.technicalDetail}>
                    Protocol: {auditData.categories.technical.details.https?.details?.protocol || 'Unknown'}
                  </Text>
                  <Text style={styles.technicalDetail}>
                    HSTS: {auditData.categories.technical.details.security?.hsts ? '✅ Enabled' : '❌ Not Enabled'}
                  </Text>
                </View>

                <View style={styles.technicalItem}>
                  <Text style={styles.technicalTitle}>🤖 Robots.txt</Text>
                  <Text style={styles.technicalDetail}>
                    Present: {auditData.categories.technical.details.robots?.present ? '✅ Yes' : '❌ No'}
                  </Text>
                  <Text style={styles.technicalDetail}>
                    Accessible: {auditData.categories.technical.details.robots?.accessible ? '✅ Yes' : '❌ No'}
                  </Text>
                  <Text style={styles.technicalDetail}>
                    User Agents: {auditData.categories.technical.details.robots?.details?.rules?.userAgents?.length || 0}
                  </Text>
                </View>

                <View style={styles.technicalItem}>
                  <Text style={styles.technicalTitle}>🗺️ XML Sitemap</Text>
                  <Text style={styles.technicalDetail}>
                    Present: {auditData.categories.technical.details.sitemap?.present ? '✅ Yes' : '❌ No'}
                  </Text>
                  <Text style={styles.technicalDetail}>
                    URLs: {auditData.categories.technical.details.sitemap?.details?.urls || 0}
                  </Text>
                  <Text style={styles.technicalDetail}>
                    Valid XML: {auditData.categories.technical.details.sitemap?.details?.valid ? '✅ Yes' : '❌ No'}
                  </Text>
                </View>

                <View style={styles.technicalItem}>
                  <Text style={styles.technicalTitle}>🚀 Performance</Text>
                  <Text style={styles.technicalDetail}>
                    Score: {auditData.categories.technical.details.performance?.score || 0}/100
                  </Text>
                  <Text style={styles.technicalDetail}>
                    LCP: {auditData.categories.technical.details.performance?.coreWebVitals?.lcp?.toFixed(2) || 0}s
                  </Text>
                  <Text style={styles.technicalDetail}>
                    FID: {auditData.categories.technical.details.performance?.coreWebVitals?.fid || 0}ms
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Key Strengths</Text>
          <View style={styles.strengthsList}>
            {auditData.categories.onPage?.strengths?.slice(0, 8).map((strength, index) => (
              <View key={index} style={styles.strengthItem}>
                <Text style={styles.strengthIcon}>✓</Text>
                <Text style={styles.strengthText}>{strength}</Text>
              </View>
            ))}
            {auditData.categories.technical?.strengths?.slice(0, 4).map((strength, index) => (
              <View key={`tech-${index}`} style={styles.strengthItem}>
                <Text style={styles.strengthIcon}>✓</Text>
                <Text style={styles.strengthText}>{strength}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by SEO Mojo - Professional SEO Audit Tool
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} />
      </Page>
    </Document>
  )
}

export default SEOReportPDF
