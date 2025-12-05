import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#333',
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#0A0E27' }}>
        Privacy Policy
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        <strong>Effective Date:</strong> December 4, 2025<br />
        <strong>Last Updated:</strong> December 4, 2025
      </p>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <p style={{ margin: 0 }}>
          <strong>Beechwood</strong> ("we," "our," or "us") operates the i65Sports mobile application. 
          This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our app.
        </p>
      </div>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        1. Information We Collect
      </h2>

      <h3 style={{ fontSize: '18px', marginTop: '25px', marginBottom: '10px' }}>
        1.1 Information You Provide
      </h3>
      <ul style={{ marginLeft: '20px' }}>
        <li><strong>Account Information:</strong> Email address, username, profile information</li>
        <li><strong>Content:</strong> Videos (Hot Takes), comments, reactions, messages</li>
        <li><strong>Profile Data:</strong> Bio, avatar, preferences</li>
        <li><strong>Communications:</strong> Messages you send through our direct messaging feature</li>
      </ul>

      <h3 style={{ fontSize: '18px', marginTop: '25px', marginBottom: '10px' }}>
        1.2 Automatically Collected Information
      </h3>
      <ul style={{ marginLeft: '20px' }}>
        <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
        <li><strong>Usage Data:</strong> App interactions, features used, time spent, viewing history</li>
        <li><strong>Location Data:</strong> Approximate location (when you grant permission) to suggest nearby venues</li>
        <li><strong>Camera & Microphone:</strong> Access only when you record Hot Takes (with your permission)</li>
        <li><strong>Log Data:</strong> IP address, crash reports, performance data</li>
      </ul>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        2. How We Use Your Information
      </h2>
      <ul style={{ marginLeft: '20px' }}>
        <li>Provide and maintain the i65Sports service</li>
        <li>Authenticate your account and verify your identity (via Clerk)</li>
        <li>Store and deliver your video content (via Cloudflare R2)</li>
        <li>Enable social features (reactions, comments, messages, collections)</li>
        <li>Suggest nearby sporting venues based on your location</li>
        <li>Improve app performance and user experience</li>
        <li>Send notifications about activity on your content</li>
        <li>Detect and prevent fraud, spam, and abuse</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        3. Information Sharing and Disclosure
      </h2>

      <h3 style={{ fontSize: '18px', marginTop: '25px', marginBottom: '10px' }}>
        3.1 Public Content
      </h3>
      <p>
        Content you post as "Public" (Hot Takes, comments, reactions) is visible to all users and may be 
        shared outside the app. Content marked "Private" is only visible to you.
      </p>

      <h3 style={{ fontSize: '18px', marginTop: '25px', marginBottom: '10px' }}>
        3.2 Service Providers
      </h3>
      <p>We share information with trusted third-party services:</p>
      <ul style={{ marginLeft: '20px' }}>
        <li><strong>Clerk:</strong> Authentication and user management</li>
        <li><strong>Cloudflare R2:</strong> Video and image storage</li>
        <li><strong>Vercel:</strong> Application hosting and delivery</li>
        <li><strong>Socket.io:</strong> Real-time messaging infrastructure</li>
      </ul>

      <h3 style={{ fontSize: '18px', marginTop: '25px', marginBottom: '10px' }}>
        3.3 Legal Requirements
      </h3>
      <p>
        We may disclose your information if required by law, court order, or to protect our rights, 
        your safety, or the safety of others.
      </p>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        4. Data Retention
      </h2>
      <p>
        We retain your information for as long as your account is active or as needed to provide services. 
        You can delete your account at any time, which will remove your personal information within 30 days. 
        Public content you've posted may be retained for legal compliance and service integrity.
      </p>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        5. Your Rights and Choices
      </h2>
      <ul style={{ marginLeft: '20px' }}>
        <li><strong>Access:</strong> You can view your account information in the app</li>
        <li><strong>Edit:</strong> Update your profile, bio, and settings anytime</li>
        <li><strong>Delete:</strong> Delete individual Hot Takes, drafts, or your entire account</li>
        <li><strong>Location:</strong> Disable location services in your device settings</li>
        <li><strong>Notifications:</strong> Manage notification preferences in app settings</li>
        <li><strong>Data Export:</strong> Request a copy of your data by contacting us</li>
      </ul>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        6. Data Security
      </h2>
      <p>
        We implement industry-standard security measures to protect your information, including:
      </p>
      <ul style={{ marginLeft: '20px' }}>
        <li>Encrypted data transmission (HTTPS/TLS)</li>
        <li>Secure authentication via Clerk</li>
        <li>Regular security audits and monitoring</li>
        <li>Access controls and authorization checks</li>
      </ul>
      <p>
        However, no method of transmission over the internet is 100% secure. We cannot guarantee 
        absolute security of your information.
      </p>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        7. Children's Privacy
      </h2>
      <p>
        i65Sports is not intended for users under 13 years of age. We do not knowingly collect 
        personal information from children under 13. If you are a parent or guardian and believe 
        your child has provided us with personal information, please contact us immediately.
      </p>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        8. International Users
      </h2>
      <p>
        Your information may be transferred to and processed in the United States or other countries 
        where our service providers operate. By using i65Sports, you consent to the transfer of your 
        information to countries outside your country of residence.
      </p>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        9. Changes to This Privacy Policy
      </h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes 
        by posting the new policy in the app and updating the "Last Updated" date. Your continued 
        use of i65Sports after changes constitutes acceptance of the updated policy.
      </p>

      <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '15px', color: '#0A0E27' }}>
        10. Contact Us
      </h2>
      <p>
        If you have questions about this Privacy Policy or our data practices, please contact us:
      </p>
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <p style={{ margin: '0 0 10px 0' }}><strong>Beechwood</strong></p>
        <p style={{ margin: '0 0 10px 0' }}>Nashville, TN</p>
        <p style={{ margin: '0 0 10px 0' }}>
          Email: <a href="mailto:jt.aws.cloud@protonmail.com" style={{ color: '#0066cc' }}>
            jt.aws.cloud@protonmail.com
          </a>
        </p>
        <p style={{ margin: 0 }}>App: i65Sports</p>
      </div>

      <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center', color: '#999' }}>
        <p>© 2025 Beechwood. All rights reserved.</p>
      </div>
    </div>
  );
}

