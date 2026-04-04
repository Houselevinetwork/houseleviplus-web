package com.houselevi.plus.ui.screens.travel

import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.houselevi.plus.data.models.CustomTripRequest
import com.houselevi.plus.data.models.InquiryRequest
import com.houselevi.plus.ui.theme.*
import com.houselevi.plus.viewmodel.InquiryViewModel

@Composable
fun InquiryFormScreen(
    packageSlug: String,
    packageTitle: String,
    onBack: () -> Unit,
    vm: InquiryViewModel = viewModel(),
) {
    val state by vm.state.collectAsState()
    val isCustom = packageSlug == "custom"

    var firstName   by remember { mutableStateOf("") }
    var lastName    by remember { mutableStateOf("") }
    var email       by remember { mutableStateOf("") }
    var phone       by remember { mutableStateOf("") }
    var message     by remember { mutableStateOf("") }
    var travelDate  by remember { mutableStateOf("") }
    var groupSize   by remember { mutableStateOf("1") }
    var destination by remember { mutableStateOf("") }
    var budget      by remember { mutableStateOf("") }

    // Reset state when screen first opens
    LaunchedEffect(Unit) { vm.reset() }

    Column(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {

        // â”€â”€ Top bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, "Back", tint = HLTextPrimary)
            }
            Spacer(Modifier.width(8.dp))
            Text(
                if (isCustom) "Plan a Custom Trip" else "Book: $packageTitle",
                style   = HLTypography.titleLarge,
                maxLines = 1,
            )
        }

        // â”€â”€ Success state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (state.isSuccess) {
            Column(
                modifier            = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text("âœ…", fontSize = 64.sp)
                Spacer(Modifier.height(16.dp))
                Text("Inquiry submitted!", style = HLTypography.headlineMedium.copy(color = HLGreen))
                Spacer(Modifier.height(8.dp))
                Text(
                    "We'll get back to you within 24 hours.",
                    style = HLTypography.bodyMedium.copy(color = HLTextMuted),
                )
                Spacer(Modifier.height(24.dp))
                Button(onClick = onBack) { Text("Go back") }
            }

            // â”€â”€ Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp),
            ) {
                HLField("First name *", firstName)   { firstName  = it }
                HLField("Last name *", lastName)     { lastName   = it }
                HLField("Email *", email)             { email      = it }
                HLField("Phone / WhatsApp", phone)   { phone      = it }
                HLField("Preferred travel date", travelDate) { travelDate = it }
                HLField("Group size", groupSize)     { groupSize  = it }

                if (isCustom) {
                    HLField("Destination(s) of interest", destination) { destination = it }
                    HLField("Approximate budget (e.g. USD 3,000)", budget) { budget = it }
                }

                HLField("Message / special requests", message, lines = 4) { message = it }

                state.error?.let { err ->
                    Spacer(Modifier.height(8.dp))
                    Text(err, style = HLTypography.bodyMedium.copy(color = HLRed))
                }

                Spacer(Modifier.height(20.dp))

                Button(
                    onClick = {
                        if (firstName.isBlank() || lastName.isBlank() || email.isBlank()) return@Button
                        if (isCustom) {
                            vm.submitCustomTrip(CustomTripRequest(
                                firstName   = firstName,
                                lastName    = lastName,
                                email       = email,
                                phone       = phone,
                                destination = destination,
                                travelDate  = travelDate,
                                budget      = budget,
                                groupSize   = groupSize.toIntOrNull() ?: 1,
                                message     = message,
                            ))
                        } else {
                            vm.submitInquiry(InquiryRequest(
                                packageSlug  = packageSlug,
                                packageTitle = packageTitle,
                                firstName    = firstName,
                                lastName     = lastName,
                                email        = email,
                                phone        = phone,
                                travelDate   = travelDate,
                                groupSize    = groupSize.toIntOrNull() ?: 1,
                                message      = message,
                            ))
                        }
                    },
                    enabled  = !state.isLoading,   // â† was isSubmitting
                    modifier = Modifier.fillMaxWidth().height(54.dp),
                    shape    = RoundedCornerShape(4.dp),
                    colors   = ButtonDefaults.buttonColors(containerColor = HLBlueGlow),
                ) {
                    if (state.isLoading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                    } else {
                        Text(
                            if (isCustom) "Submit Custom Request" else "Submit Inquiry",
                            style = HLTypography.labelLarge,
                        )
                    }
                }

                Spacer(Modifier.height(40.dp))
            }
        }
    }
}

@Composable
private fun HLField(
    label: String,
    value: String,
    lines: Int = 1,
    onChange: (String) -> Unit,
) {
    Spacer(Modifier.height(12.dp))
    OutlinedTextField(
        value         = value,
        onValueChange = onChange,
        label         = { Text(label) },
        modifier      = Modifier.fillMaxWidth(),
        singleLine    = lines == 1,
        minLines      = lines,
        maxLines      = lines,
        colors        = OutlinedTextFieldDefaults.colors(focusedBorderColor = HLBlueGlow),
    )
}
