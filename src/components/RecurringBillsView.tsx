import React, { useState } from 'react';
import { Repeat, Plus, CheckCircle2, Circle, Trash2, Calendar, Info } from 'lucide-react';
import { RecurringBill, CATEGORIES } from '../types';

interface RecurringBillsViewProps {
  bills: RecurringBill[];
  onTogglePaid: (bill: RecurringBill) => void;
  onAddBill: (title: string, amount: number, category: string, dueDay: number) => void;
  onDeleteBill: (id: string) => void;
  isDarkMode?: boolean;
}

export const RecurringBillsView: React.FC<RecurringBillsViewProps> = ({
  bills,
  onTogglePaid,
  onAddBill,
  onDeleteBill,
  isDarkMode = true,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [category, setCategory] = useState(CATEGORIES[1].displayName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    const parsedDay = parseInt(dueDay, 10) || 1;
    if (title.trim() && !isNaN(parsedAmt) && parsedAmt > 0) {
      onAddBill(title.trim(), parsedAmt, category, parsedDay);
      setTitle('');
      setAmount('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-emerald-500" />
          <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Fixed Auto-Debits & Bills
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Bill
        </button>
      </div>

      <div className={`rounded-2xl p-3 border text-xs flex items-start gap-2 ${
        isDarkMode
          ? 'bg-slate-900/60 border-slate-800 text-slate-400'
          : 'bg-white border-slate-200 text-slate-600 shadow-xs'
      }`}>
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <span>
          Tapping 'Mark Paid' auto-deducts the recurring expense from your monthly budget and logs the entry in your recent activity.
        </span>
      </div>

      {bills.length === 0 ? (
        <div className={`text-center py-12 border rounded-2xl ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">No recurring bills added yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className={`border rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors shadow-xs ${
                bill.isPaidThisMonth
                  ? isDarkMode
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-emerald-50/70 border-emerald-200'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bill.title}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    Due: {bill.dueDayOfMonth}th
                  </span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ₹{bill.amount.toLocaleString()} • {bill.category}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTogglePaid(bill)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    bill.isPaidThisMonth
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                      : isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {bill.isPaidThisMonth ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Paid ✓
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-slate-400" />
                      Mark Paid
                    </>
                  )}
                </button>

                <button
                  onClick={() => onDeleteBill(bill.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="Delete Bill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md border rounded-2xl p-5 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-3">Add Recurring Monthly Bill</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Bill Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. House Rent, WiFi Broadband, Netflix"
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs outline-none ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Monthly Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 6500"
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs outline-none ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                    }`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.displayName}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
