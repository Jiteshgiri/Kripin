package com.example.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.CategoryOption
import com.example.data.Expense

@Composable
fun AnalyticsScreen(
    expenses: List<Expense>,
    monthlyBudget: Double,
    csvData: String
) {
    val context = LocalContext.current
    val expenseList = remember(expenses) { expenses.filter { !it.isIncome } }
    val totalExpenseSpent = remember(expenseList) { expenseList.sumOf { it.amount } }

    val categoryBreakdown = remember(expenseList) {
        expenseList.groupBy { it.category }
            .mapValues { entry -> entry.value.sumOf { it.amount } }
            .entries.sortedByDescending { it.value }
    }

    val topCategory = categoryBreakdown.firstOrNull()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.PieChart,
                        contentDescription = "Analytics",
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Monthly Spending Analytics",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    )
                }

                Button(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newPlainText("Expenses_Report", csvData)
                        clipboard.setPrimaryClip(clip)
                        Toast.makeText(context, "CSV Report copied to clipboard!", Toast.LENGTH_SHORT).show()
                    },
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(imageVector = Icons.Default.Download, contentDescription = "Export", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Export CSV", fontSize = 12.sp)
                }
            }
        }

        // Top Category Summary
        if (topCategory != null && totalExpenseSpent > 0) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "💡 Top Spending Category",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        val percent = ((topCategory.value / totalExpenseSpent) * 100).toInt()
                        Text(
                            text = "${topCategory.key}: ₹${topCategory.value.toInt()} ($percent% of total)",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        )
                    }
                }
            }
        }

        item {
            Text(
                text = "Category Breakdown",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
            )
        }

        if (categoryBreakdown.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No expenses recorded yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            items(categoryBreakdown) { entry ->
                val categoryName = entry.key
                val spent = entry.value
                val percentage = if (totalExpenseSpent > 0) (spent / totalExpenseSpent) else 0.0

                val categoryOpt = CategoryOption.values().find { it.displayName == categoryName }
                    ?: CategoryOption.OTHER

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = categoryOpt.iconEmoji, fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = categoryName,
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                                )
                            }
                            Text(
                                text = "₹${spent.toInt()} (${(percentage * 100).toInt()}%)",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Color(categoryOpt.colorHex)
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Visual progress bar
                        LinearProgressIndicator(
                            progress = { percentage.toFloat().coerceIn(0f, 1f) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = Color(categoryOpt.colorHex),
                            trackColor = MaterialTheme.colorScheme.surface
                        )
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(32.dp)) }
    }
}
