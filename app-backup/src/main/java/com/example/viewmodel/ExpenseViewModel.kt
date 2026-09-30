package com.example.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import com.example.util.SmsParser
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Calendar

class ExpenseViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getDatabase(application).expenseDao()

    val expenses: StateFlow<List<Expense>> = dao.getAllExpenses()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val recurringBills: StateFlow<List<RecurringBill>> = dao.getAllRecurringBills()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _budgetConfig = MutableStateFlow(BudgetConfig(monthlyBudget = 15000.0, monthlyIncome = 25000.0))
    val budgetConfig: StateFlow<BudgetConfig> = _budgetConfig.asStateFlow()

    private val _unconfirmedSmsAlerts = MutableStateFlow<List<SmsAlert>>(emptyList())
    val unconfirmedSmsAlerts: StateFlow<List<SmsAlert>> = _unconfirmedSmsAlerts.asStateFlow()

    init {
        viewModelScope.launch {
            expenses.collect { list ->
                if (list.isEmpty()) {
                    seedDefaultData()
                }
            }
        }
    }

    private fun seedDefaultData() {
        viewModelScope.launch {
            // Seed initial transactions for instant rich dashboard demo
            val now = System.currentTimeMillis()
            val dayMs = 86400000L

            dao.insertExpense(
                Expense(
                    title = "Monthly Salary Credited",
                    amount = 25000.0,
                    category = "Salary / Allowance",
                    dateTimestamp = now - (5 * dayMs),
                    isIncome = true,
                    merchant = "Employer",
                    paymentMode = "Bank Direct Credit"
                )
            )
            dao.insertExpense(
                Expense(
                    title = "Swiggy Food Order",
                    amount = 350.0,
                    category = "Food & Dining",
                    dateTimestamp = now - (1 * dayMs),
                    isIncome = false,
                    merchant = "Swiggy",
                    paymentMode = "UPI"
                )
            )
            dao.insertExpense(
                Expense(
                    title = "Uber Ride to Office",
                    amount = 220.0,
                    category = "Travel & Commute",
                    dateTimestamp = now - (2 * dayMs),
                    isIncome = false,
                    merchant = "Uber",
                    paymentMode = "Google Pay"
                )
            )
            dao.insertExpense(
                Expense(
                    title = "Amazon Books & Tech",
                    amount = 1450.0,
                    category = "Shopping",
                    dateTimestamp = now - (3 * dayMs),
                    isIncome = false,
                    merchant = "Amazon",
                    paymentMode = "Credit Card"
                )
            )

            // Seed recurring bills
            dao.insertRecurringBill(
                RecurringBill(title = "House Rent & Maintenance", amount = 6500.0, category = "Rent & Stay", dueDayOfMonth = 1, isPaidThisMonth = true)
            )
            dao.insertRecurringBill(
                RecurringBill(title = "WiFi Broadband Bill", amount = 799.0, category = "Bills & Utilities", dueDayOfMonth = 5, isPaidThisMonth = false)
            )
            dao.insertRecurringBill(
                RecurringBill(title = "Netflix & Spotify Subscriptions", amount = 649.0, category = "Entertainment", dueDayOfMonth = 12, isPaidThisMonth = false)
            )
        }
    }

    fun addExpense(
        title: String,
        amount: Double,
        category: String,
        isIncome: Boolean = false,
        merchant: String = "",
        paymentMode: String = "UPI / Card",
        isAutoDebited: Boolean = false
    ) {
        viewModelScope.launch {
            val expense = Expense(
                title = title.ifBlank { if (isIncome) "Income" else category },
                amount = amount,
                category = category,
                isIncome = isIncome,
                merchant = merchant,
                paymentMode = paymentMode,
                isAutoDebited = isAutoDebited
            )
            dao.insertExpense(expense)
        }
    }

    fun deleteExpense(expense: Expense) {
        viewModelScope.launch {
            dao.deleteExpense(expense)
        }
    }

    fun updateBudget(newIncome: Double, newBudget: Double) {
        _budgetConfig.value = BudgetConfig(monthlyBudget = newBudget, monthlyIncome = newIncome)
    }

    fun processSmsText(smsText: String) {
        val alert = SmsParser.parseSms(smsText)
        if (alert != null) {
            _unconfirmedSmsAlerts.update { current -> listOf(alert) + current }
        }
    }

    fun confirmSmsAlert(alert: SmsAlert, finalCategory: String) {
        addExpense(
            title = if (alert.merchant.isNotBlank()) alert.merchant else alert.category,
            amount = alert.amount,
            category = finalCategory,
            isIncome = alert.isIncome,
            merchant = alert.merchant,
            paymentMode = "Parsed Bank SMS"
        )
        dismissSmsAlert(alert)
    }

    fun dismissSmsAlert(alert: SmsAlert) {
        _unconfirmedSmsAlerts.update { current -> current.filter { it.id != alert.id } }
    }

    fun toggleBillPaid(bill: RecurringBill) {
        viewModelScope.launch {
            val updated = bill.copy(isPaidThisMonth = !bill.isPaidThisMonth)
            dao.updateRecurringBill(updated)

            if (updated.isPaidThisMonth) {
                // Auto-create expense
                addExpense(
                    title = "Auto-Debit: ${bill.title}",
                    amount = bill.amount,
                    category = bill.category,
                    isIncome = false,
                    merchant = bill.title,
                    paymentMode = "Auto Debit",
                    isAutoDebited = true
                )
            }
        }
    }

    fun addRecurringBill(title: String, amount: Double, category: String, dueDay: Int) {
        viewModelScope.launch {
            dao.insertRecurringBill(
                RecurringBill(title = title, amount = amount, category = category, dueDayOfMonth = dueDay)
            )
        }
    }

    fun deleteRecurringBill(bill: RecurringBill) {
        viewModelScope.launch {
            dao.deleteRecurringBill(bill)
        }
    }

    // Calculations
    fun getRemainingDaysInMonth(): Int {
        val calendar = Calendar.getInstance()
        val totalDays = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
        val currentDay = calendar.get(Calendar.DAY_OF_MONTH)
        return (totalDays - currentDay + 1).coerceAtLeast(1)
    }

    fun getCsvExport(): String {
        val currentExpenses = expenses.value
        val sb = StringBuilder()
        sb.append("ID,Date,Title,Amount,Category,Type,Merchant,PaymentMode\n")
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm", java.util.Locale.getDefault())

        for (e in currentExpenses) {
            val dateStr = sdf.format(java.util.Date(e.dateTimestamp))
            val typeStr = if (e.isIncome) "INCOME" else "EXPENSE"
            sb.append("${e.id},\"${dateStr}\",\"${e.title}\",${e.amount},\"${e.category}\",${typeStr},\"${e.merchant}\",\"${e.paymentMode}\"\n")
        }
        return sb.toString()
    }
}
