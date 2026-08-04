package com.example.util

import com.example.data.SmsAlert
import java.util.regex.Pattern

object SmsParser {

    private val AMOUNT_PATTERN = Pattern.compile(
        "(?:RS|RS\\.|INR|₹)\\s*([0-9,]+(?:\\.[0-9]{1,2})?)",
        Pattern.CASE_INSENSITIVE
    )

    private val CREDIT_KEYWORDS = listOf("credited", "received", "deposit", "added", "refund", "salary", "allowance")
    private val DEBIT_KEYWORDS = listOf("spent", "debited", "paid", "sent", "transferred", "withdrawn", "purchase")

    fun parseSms(messageText: String): SmsAlert? {
        val lowerText = messageText.lowercase()

        // Check if message is a transaction SMS
        val isTransaction = CREDIT_KEYWORDS.any { lowerText.contains(it) } ||
                DEBIT_KEYWORDS.any { lowerText.contains(it) }

        if (!isTransaction) return null

        // Extract amount
        val matcher = AMOUNT_PATTERN.matcher(messageText)
        if (!matcher.find()) return null

        val amountStr = matcher.group(1)?.replace(",", "") ?: return null
        val amount = amountStr.toDoubleOrNull() ?: return null

        // Determine type
        val isIncome = CREDIT_KEYWORDS.any { lowerText.contains(it) } &&
                !lowerText.contains("debited")

        // Extract merchant/recipient
        val merchant = extractMerchant(messageText)

        // Auto-categorize
        val category = autoCategorize(merchant, lowerText)

        return SmsAlert(
            rawText = messageText,
            amount = amount,
            merchant = merchant,
            isIncome = isIncome,
            category = category
        )
    }

    private fun extractMerchant(text: String): String {
        val lower = text.lowercase()

        // Pattern 1: at [Merchant] or to [Merchant] or on [Merchant] or towards [Merchant] or for [Merchant]
        val patterns = listOf(
            Regex("(?:at|to|on|towards|for)\\s+([A-Za-z0-9\\s\\.&'-]{2,20})", RegexOption.IGNORE_CASE),
            Regex("vpa\\s+([A-Za-z0-9\\.&'-]{2,20})", RegexOption.IGNORE_CASE),
            Regex("info:\\s*([A-Za-z0-9\\s]{2,20})", RegexOption.IGNORE_CASE)
        )

        for (pattern in patterns) {
            val match = pattern.find(text)
            if (match != null && match.groupValues.size > 1) {
                var candidate = match.groupValues[1].trim()
                // Cleanup words like "using", "on", "via", "ref", "avbl", "bal", "bank"
                val stopWords = listOf("using", "via", "ref", "avbl", "bal", "bank", "card", "account", "a/c", "upi", "val", "dt")
                for (sw in stopWords) {
                    if (candidate.lowercase().contains(" $sw")) {
                        candidate = candidate.substring(0, candidate.lowercase().indexOf(" $sw")).trim()
                    }
                }
                if (candidate.length >= 2) return candidate.capitalizeWords()
            }
        }

        return if (lower.contains("swiggy")) "Swiggy"
        else if (lower.contains("zomato")) "Zomato"
        else if (lower.contains("uber")) "Uber"
        else if (lower.contains("ola")) "Ola"
        else if (lower.contains("amazon")) "Amazon"
        else if (lower.contains("flipkart")) "Flipkart"
        else if (lower.contains("phonepe")) "PhonePe Transfer"
        else if (lower.contains("gpay") || lower.contains("google pay")) "Google Pay"
        else if (lower.contains("paytm")) "Paytm"
        else "Bank Transaction"
    }

    private fun autoCategorize(merchant: String, fullTextLower: String): String {
        val combined = "${merchant.lowercase()} $fullTextLower"

        return when {
            combined.contains("swiggy") || combined.contains("zomato") || combined.contains("starbucks") ||
                    combined.contains("mcdonald") || combined.contains("kfc") || combined.contains("restaurant") ||
                    combined.contains("food") || combined.contains("cafe") || combined.contains("dining") -> "Food & Dining"

            combined.contains("uber") || combined.contains("ola") || combined.contains("rapido") ||
                    combined.contains("metro") || combined.contains("irctc") || combined.contains("fuel") ||
                    combined.contains("petrol") || combined.contains("cab") || combined.contains("travel") -> "Travel & Commute"

            combined.contains("amazon") || combined.contains("flipkart") || combined.contains("myntra") ||
                    combined.contains("zara") || combined.contains("mall") || combined.contains("shopping") -> "Shopping"

            combined.contains("rent") || combined.contains("broker") || combined.contains("pg") ||
                    combined.contains("hostel") -> "Rent & Stay"

            combined.contains("airtel") || combined.contains("jio") || combined.contains("bill") ||
                    combined.contains("electricity") || combined.contains("wifi") || combined.contains("water") ||
                    combined.contains("gas") || combined.contains("recharge") -> "Bills & Utilities"

            combined.contains("salary") || combined.contains("pocket money") || combined.contains("allowance") ||
                    combined.contains("stipend") || combined.contains("freelance") -> "Salary / Allowance"

            combined.contains("movie") || combined.contains("netflix") || combined.contains("spotify") ||
                    combined.contains("bookmyshow") || combined.contains("gaming") -> "Entertainment"

            else -> "Other"
        }
    }

    private fun String.capitalizeWords(): String {
        return split(" ").joinToString(" ") { word ->
            word.lowercase().replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
        }
    }
}
