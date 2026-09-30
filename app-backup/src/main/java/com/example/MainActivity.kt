package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.*
import com.example.ui.theme.MyApplicationTheme
import com.example.viewmodel.ExpenseViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                ExpenseTrackerApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExpenseTrackerApp(viewModel: ExpenseViewModel = viewModel()) {
    val expenses by viewModel.expenses.collectAsState()
    val recurringBills by viewModel.recurringBills.collectAsState()
    val budgetConfig by viewModel.budgetConfig.collectAsState()
    val unconfirmedSmsAlerts by viewModel.unconfirmedSmsAlerts.collectAsState()

    var selectedTab by remember { mutableStateOf(0) } // 0: Home, 1: Analytics, 2: Auto-Debits
    var showQuickAdd by remember { mutableStateOf(false) }
    var showSmsSimulator by remember { mutableStateOf(false) }
    var showBudgetSettings by remember { mutableStateOf(false) }

    val remainingDays = viewModel.getRemainingDaysInMonth()
    val csvData = viewModel.getCsvExport()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Smart Budget Tracker",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 18.sp
                            )
                        )
                        Text(
                            text = "Zero Friction • Student & Working Pro",
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { showSmsSimulator = true }) {
                        Icon(
                            imageVector = Icons.Default.Sms,
                            contentDescription = "Test SMS",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                    IconButton(onClick = { showBudgetSettings = true }) {
                        Icon(
                            imageVector = Icons.Default.Tune,
                            contentDescription = "Settings"
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(imageVector = Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(imageVector = Icons.Default.PieChart, contentDescription = "Analytics") },
                    label = { Text("Analytics") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(imageVector = Icons.Default.Repeat, contentDescription = "Auto-Debits") },
                    label = { Text("Auto-Debits") }
                )
            }
        },
        floatingActionButton = {
            LargeFloatingActionButton(
                onClick = { showQuickAdd = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Quick Add Entry",
                    modifier = Modifier.size(32.dp)
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                0 -> HomeScreen(
                    expenses = expenses,
                    budgetConfig = budgetConfig,
                    unconfirmedSmsAlerts = unconfirmedSmsAlerts,
                    remainingDays = remainingDays,
                    onOpenQuickAdd = { showQuickAdd = true },
                    onOpenSmsSimulator = { showSmsSimulator = true },
                    onOpenBudgetSettings = { showBudgetSettings = true },
                    onConfirmSmsAlert = { alert, cat -> viewModel.confirmSmsAlert(alert, cat) },
                    onDismissSmsAlert = { alert -> viewModel.dismissSmsAlert(alert) },
                    onDeleteExpense = { exp -> viewModel.deleteExpense(exp) }
                )

                1 -> AnalyticsScreen(
                    expenses = expenses,
                    monthlyBudget = budgetConfig.monthlyBudget,
                    csvData = csvData
                )

                2 -> RecurringBillsScreen(
                    bills = recurringBills,
                    onTogglePaid = { bill -> viewModel.toggleBillPaid(bill) },
                    onAddBill = { title, amt, cat, day -> viewModel.addRecurringBill(title, amt, cat, day) },
                    onDeleteBill = { bill -> viewModel.deleteRecurringBill(bill) }
                )
            }
        }
    }

    if (showQuickAdd) {
        QuickAddDialog(
            onDismiss = { showQuickAdd = false },
            onSave = { amount, title, category, isIncome ->
                viewModel.addExpense(
                    title = title,
                    amount = amount,
                    category = category,
                    isIncome = isIncome,
                    merchant = title
                )
            }
        )
    }

    if (showSmsSimulator) {
        SmsSimulatorDialog(
            onDismiss = { showSmsSimulator = false },
            onParseAndAdd = { alert ->
                viewModel.confirmSmsAlert(alert, alert.category)
            }
        )
    }

    if (showBudgetSettings) {
        BudgetSettingsDialog(
            currentConfig = budgetConfig,
            onDismiss = { showBudgetSettings = false },
            onSave = { income, budget ->
                viewModel.updateBudget(income, budget)
            }
        )
    }
}
