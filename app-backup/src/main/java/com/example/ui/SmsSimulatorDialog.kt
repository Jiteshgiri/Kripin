package com.example.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SmsAlert
import com.example.util.SmsParser

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmsSimulatorDialog(
    onDismiss: () -> Unit,
    onParseAndAdd: (SmsAlert) -> Unit
) {
    var customSmsText by remember { mutableStateOf("") }
    var parsedAlert by remember { mutableStateOf<SmsAlert?>(null) }

    val presetSmsList = listOf(
        "Spent Rs 250.00 at Swiggy using HDFC card xx1234 on 28-Jul-2026.",
        "Sent Rs 500.00 to Ramesh via PhonePe UPI Ref 82918.",
        "Credited Rs 35,000.00 to A/c xx7812 towards July Salary.",
        "Your A/c xx9102 is debited by INR 1,200.00 for Uber Rides.",
        "Paid Rs 799.00 to Airtel Broadband via Google Pay."
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Sms,
                        contentDescription = "SMS",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Automated Bank SMS Parser",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                }
            }

            Text(
                text = "Simulate receiving a bank or UPI alert to test zero-friction auto-tracking.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Tap a Sample Bank SMS:",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                presetSmsList.forEach { sms ->
                    Surface(
                        onClick = {
                            customSmsText = sms
                            parsedAlert = SmsParser.parseSms(sms)
                        },
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "💬 \"$sms\"",
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = customSmsText,
                onValueChange = {
                    customSmsText = it
                    parsedAlert = SmsParser.parseSms(it)
                },
                label = { Text("Or Paste Bank / UPI SMS Text") },
                placeholder = { Text("e.g. Debited Rs 350 at Starbucks...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Parsed Result Live Preview
            val alert = parsedAlert
            if (alert != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (alert.isIncome) Color(0xFFE8F8F5) else Color(0xFFFDEDEC)
                    )
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = if (alert.isIncome) "💰 Income Detected" else "💸 Expense Detected",
                                style = MaterialTheme.typography.labelLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (alert.isIncome) Color(0xFF27AE60) else Color(0xFFC0392B)
                                )
                            )
                            Text(
                                text = "₹${alert.amount}",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (alert.isIncome) Color(0xFF27AE60) else Color(0xFFC0392B)
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Merchant: ${alert.merchant}  |  Category: ${alert.category}",
                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                            color = Color.DarkGray
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = {
                                onParseAndAdd(alert)
                                onDismiss()
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (alert.isIncome) Color(0xFF27AE60) else Color(0xFFC0392B)
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = "Confirm")
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Auto-Confirm & Add Entry", color = Color.White)
                        }
                    }
                }
            } else if (customSmsText.isNotBlank()) {
                Text(
                    text = "⚠️ Could not parse amount/merchant from this SMS text. Ensure it contains 'Rs/INR' and 'Debited/Spent/Credited'.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFFE67E22)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
