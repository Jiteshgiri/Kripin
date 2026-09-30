package com.example.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY dateTimestamp DESC")
    fun getAllExpenses(): Flow<List<Expense>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: Expense): Long

    @Delete
    suspend fun deleteExpense(expense: Expense)

    @Query("DELETE FROM expenses")
    suspend fun clearAllExpenses()

    @Query("SELECT * FROM recurring_bills ORDER BY dueDayOfMonth ASC")
    fun getAllRecurringBills(): Flow<List<RecurringBill>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecurringBill(bill: RecurringBill): Long

    @Update
    suspend fun updateRecurringBill(bill: RecurringBill)

    @Delete
    suspend fun deleteRecurringBill(bill: RecurringBill)
}
