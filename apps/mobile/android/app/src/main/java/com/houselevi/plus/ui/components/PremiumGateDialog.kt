package com.houselevi.plus.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.houselevi.plus.ui.theme.*

@Composable
fun PremiumGateDialog(contentTitle: String, onSubscribe: () -> Unit, onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        Column(modifier = Modifier.fillMaxWidth().background(HLSurface, RoundedCornerShape(12.dp)).padding(28.dp),
               horizontalAlignment = Alignment.CenterHorizontally) {
            Text("crown", fontSize = 40.sp)
            Spacer(Modifier.height(12.dp))
            Text("Premium Content", style = HLTypography.headlineMedium, textAlign = TextAlign.Center)
            Spacer(Modifier.height(8.dp))
            Text("\"$contentTitle\" requires an HL+ Premium subscription.",
                 style = HLTypography.bodyMedium.copy(textAlign = TextAlign.Center))
            Spacer(Modifier.height(24.dp))
            Button(onClick = onSubscribe, modifier = Modifier.fillMaxWidth().height(48.dp),
                   shape = RoundedCornerShape(4.dp),
                   colors = ButtonDefaults.buttonColors(containerColor = HLGold)) {
                Text("Subscribe  HL+ Premium",
                     style = HLTypography.labelLarge.copy(color = Color.Black, letterSpacing = 1.sp))
            }
            Spacer(Modifier.height(8.dp))
            TextButton(onClick = onDismiss, modifier = Modifier.fillMaxWidth()) {
                Text("Not now", style = HLTypography.bodyMedium.copy(color = HLTextMuted))
            }
        }
    }
}
