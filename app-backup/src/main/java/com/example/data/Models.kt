package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "expenses")
data class Expense(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val amount: Double,
    val category: String, // e.g., "Food", "Rent", "Travel", "Shopping", "Bills", "Income", "Other"
    val dateTimestamp: Long = System.currentTimeMillis(),
    val isIncome: Boolean = false,
    val merchant: String = "",
    val paymentMode: String = "UPI / Card",
    val isAutoDebited: Boolean = false
)

@Entity(tableName = "recurring_bills")
data class RecurringBill(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val amount: Double,
    val category: String,
    val dueDayOfMonth: Int, // e.g., 1st, 5th, 10th
    val isAutoPay: Boolean = true,
    val isPaidThisMonth: Boolean = false
)

data class BudgetConfig(
    val monthlyBudget: Double = 15000.0,
    val monthlyIncome: Double = 25000.0,
    val monthName: String = "Current Month"
)

data class SmsAlert(
    val id: String = java.util.UUID.randomUUID().toString(),
    val rawText: String,
    val amount: Double,
    val merchant: String,
    val isIncome: Boolean,
    val category: String,
    val timestamp: Long = System.currentTimeMillis()
)

enum class CategoryOption(val displayName: String, val iconEmoji: String, val colorHex: Long) {
    FOOD("Food & Dining", "🍔", 0xFFFF6B6B),
    RENT("Rent & Stay", "🏠", 0xFF4D96FF),
    TRAVEL("Travel & Commute", "🚗", 0xFFFFB26B),
    SHOPPING("Shopping", "🛍️", 0xFF9B51E0),
    BILLS("Bills & Utilities", "💡", 0xFF6BCB77),
    INCOME("Salary / Allowance", "💰", 0xFF2ECC71),
    ENTERTAINMENT("Entertainment", "🍿", 0xFFFF70A6),
    OTHER("Other", "📦", 0xFF95A5A6)
}
