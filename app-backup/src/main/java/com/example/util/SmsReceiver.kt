package com.example.util

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

class SmsReceiver(
    private val onSmsReceived: ((String) -> Unit)? = null
) : BroadcastReceiver() {

    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (message in messages) {
                val body = message.messageBody ?: continue
                onSmsReceived?.invoke(body)
            }
        }
    }
}
