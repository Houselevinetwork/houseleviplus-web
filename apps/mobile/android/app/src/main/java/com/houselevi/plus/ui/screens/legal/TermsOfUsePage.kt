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
 * Terms of Use page with white background for clarity.
 * Content is editable — replace the text below with your actual legal terms.
 */
@Composable
fun TermsOfUsePage(onBack: () -> Unit) {
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
                text = "Terms of Use",
                color = Color.Black,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(20.dp))

            // ─────────────────────────────────────────────────────────────
            // EDITABLE CONTENT — Replace with your actual legal text
            // ─────────────────────────────────────────────────────────────

            TermSection(
                title = "1. Acceptance of Terms",
                content = """
By accessing and using House Levi+ ("the Service"), you agree to be bound by these Terms of Use. If you do not agree to any part of these terms, please discontinue use of the Service immediately.

House Levi+ reserves the right to modify these terms at any time. Continued use of the Service following such modifications constitutes your acceptance of the updated Terms of Use.
                """.trimIndent(),
            )

            TermSection(
                title = "2. User Accounts",
                content = """
To access certain features of the Service, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information as necessary to maintain accuracy.

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify House Levi+ immediately of any unauthorized use of your account.
                """.trimIndent(),
            )

            TermSection(
                title = "3. Intellectual Property Rights",
                content = """
All content available through the Service, including but not limited to text, graphics, logos, images, audio clips, video clips, digital downloads, and data compilations, is the property of House Levi+ or its content suppliers and is protected by international copyright laws.

You may not reproduce, distribute, transmit, display, or perform any content from the Service without the prior written permission of House Levi+.
                """.trimIndent(),
            )

            TermSection(
                title = "4. User Conduct",
                content = """
You agree not to use the Service to:
• Violate any laws or regulations
• Infringe upon the intellectual property rights of others
• Transmit viruses, malware, or any code of destructive nature
• Engage in any form of harassment, abuse, or threatening behaviour
• Spam or send unsolicited communications
• Attempt to gain unauthorized access to the Service or its systems

House Levi+ reserves the right to terminate accounts that violate these terms.
                """.trimIndent(),
            )

            TermSection(
                title = "5. Limitation of Liability",
                content = """
To the fullest extent permitted by law, House Levi+ and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service, even if House Levi+ has been advised of the possibility of such damages.
                """.trimIndent(),
            )

            TermSection(
                title = "6. Disclaimer of Warranties",
                content = """
The Service is provided on an "AS IS" and "AS AVAILABLE" basis. House Levi+ makes no warranties, expressed or implied, regarding the Service, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                """.trimIndent(),
            )

            TermSection(
                title = "7. Indemnification",
                content = """
You agree to indemnify, defend, and hold harmless House Levi+ and its officers, directors, employees, and agents from any and all claims, damages, losses, and expenses arising from your use of the Service or violation of these Terms of Use.
                """.trimIndent(),
            )

            TermSection(
                title = "8. Governing Law",
                content = """
These Terms of Use shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law principles. Any legal action or proceeding arising under these terms shall be brought exclusively in the courts located in Kenya.
                """.trimIndent(),
            )

            TermSection(
                title = "9. Contact Us",
                content = """
If you have any questions about these Terms of Use, please contact us at:

House Levi+
Email: support@houselevip lus.com
Phone: +254 (0) XXX XXX XXX

Last updated: March 2026
                """.trimIndent(),
            )
        }
    }
}

@Composable
private fun TermSection(title: String, content: String) {
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