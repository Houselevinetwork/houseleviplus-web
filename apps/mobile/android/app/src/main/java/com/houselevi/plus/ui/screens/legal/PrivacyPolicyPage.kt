package com.houselevi.plus.ui.screens.legal

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Privacy Policy page with white background for clarity.
 * Content is editable — replace the text below with your actual privacy policy.
 */
@Composable
fun PrivacyPolicyPage(onBack: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White),
    ) {
        // Back arrow — top left
        IconButton(
            onClick = onBack,
            modifier = Modifier
                .align(Alignment.TopStart)
                .statusBarsPadding()
                .padding(8.dp),
        ) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back",
                tint = Color.Black,
            )
        }

        // Scrollable content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(top = 60.dp, bottom = 40.dp),
        ) {
            // Title
            Text(
                text = "Privacy Policy",
                color = Color.Black,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(20.dp))

            // ─────────────────────────────────────────────────────────────
            // EDITABLE CONTENT — Replace with your actual legal text
            // ─────────────────────────────────────────────────────────────

            PolicySection(
                title = "1. Introduction",
                content = """
House Levi+ ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our mobile application (the "Service").

Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service.
                """.trimIndent(),
            )

            PolicySection(
                title = "2. Information We Collect",
                content = """
We may collect information about you in a variety of ways. The information we may collect on the Site includes:

Personal Data:
• Email address
• Phone number
• Name
• Account credentials
• Payment and billing information
• Profile information you provide

Automatically Collected Information:
• Device information (device type, operating system)
• Usage data (pages visited, time spent, features used)
• Location data (if permitted)
• Log files and analytics data

Cookies and Tracking Technologies:
• We use cookies and similar tracking technologies to track activity on our Service and hold certain information.
                """.trimIndent(),
            )

            PolicySection(
                title = "3. Use of Your Information",
                content = """
Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:

• Create and manage your account
• Process your transactions and send related information
• Email you regarding your account or order
• Fulfill and manage purchases, orders, payments, and other transactions related to the Service
• Generate a personal profile about you
• Increase the efficiency and operation of the Service
• Monitor and analyze usage and trends to improve your experience
• Perform other business activities as needed
                """.trimIndent(),
            )

            PolicySection(
                title = "4. Disclosure of Your Information",
                content = """
We may share information we have collected about you in certain situations:

By Law or to Protect Rights:
• If required by law, we may disclose your information when required by any applicable law, rule, or regulation

Third-Party Service Providers:
• We may share your information with third parties that perform services for us, including payment processors, analytics providers, and marketing partners

Business Transfers:
• We may share or transfer your information in connection with a merger, sale, bankruptcy, or other business transaction

Your Consent:
• We may disclose your information with your consent for any other purpose
                """.trimIndent(),
            )

            PolicySection(
                title = "5. Security of Your Information",
                content = """
We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                """.trimIndent(),
            )

            PolicySection(
                title = "6. Contact Us Regarding Privacy",
                content = """
If you have questions or comments about this Privacy Policy, please contact us at:

House Levi+
Email: privacy@houseleviplus.com
Phone: +254 (0) XXX XXX XXX
Address: [Your Address], Kenya

We will respond to all privacy inquiries within 30 days of receipt.
                """.trimIndent(),
            )

            PolicySection(
                title = "7. Changes to This Privacy Policy",
                content = """
We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, and other factors. We will notify you of any material changes by updating the "Last Updated" date of this Privacy Policy. Your continued use of the Service following the posting of revised Privacy Policy means you accept and agree to the changes.
                """.trimIndent(),
            )

            PolicySection(
                title = "8. Your Rights",
                content = """
Depending on your location, you may have certain rights regarding your personal information, including:

• The right to access your personal information
• The right to correct inaccurate data
• The right to request deletion of your data
• The right to opt-out of certain data uses
• The right to data portability

To exercise any of these rights, please contact us using the information provided in Section 6.
                """.trimIndent(),
            )

            PolicySection(
                title = "9. Children's Privacy",
                content = """
House Levi+ does not knowingly collect personal information from children under the age of 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information and terminate the child's account. If you believe a child under 13 has provided us with personal information, please contact us immediately.
                """.trimIndent(),
            )

            Text(
                text = "Last updated: March 2026",
                color = Color(0xFF666666),
                fontSize = 12.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 20.dp),
            )
        }
    }
}

@Composable
private fun PolicySection(title: String, content: String) {
    Text(
        text = title,
        color = Color.Black,
        fontSize = 16.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.fillMaxWidth(),
    )
    Spacer(Modifier.height(8.dp))
    Text(
        text = content,
        color = Color(0xFF333333),
        fontSize = 14.sp,
        lineHeight = 22.sp,
        modifier = Modifier.fillMaxWidth(),
    )
    Spacer(Modifier.height(20.dp))
}