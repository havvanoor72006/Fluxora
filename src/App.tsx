import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import type { User } from '@supabase/supabase-js';
import { useState } from 'react'
import './App.css'

type Transaction = {
  id: string | number;
  name: string
  category: string
  date: string
  amount: number
  type: 'Income' | 'Expense'
}

const initialTransactions: Transaction[] = [
  { id: 1, name: 'Monthly Salary', category: 'Salary', date: 'Oct 28, 2026', amount: 35000, type: 'Income' },
  { id: 2, name: 'Grocery Shopping', category: 'Food', date: 'Oct 27, 2026', amount: 1250, type: 'Expense' },
  { id: 3, name: 'Internet Bill', category: 'Bills', date: 'Oct 26, 2026', amount: 799, type: 'Expense' },
  { id: 4, name: 'Freelance Project', category: 'Freelance', date: 'Oct 25, 2026', amount: 6500, type: 'Income' },
  { id: 5, name: 'Coffee & Snacks', category: 'Food', date: 'Oct 24, 2026', amount: 350, type: 'Expense' },
]

function App() {
const [user, setUser] = useState<User | null>(null);
const [checkingAuth, setCheckingAuth] = useState(true);

useEffect(() => {
  if (!user) return;

  async function loadTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load transactions:', error.message);
      return;
    }

    const savedTransactions: Transaction[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      date: new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      amount: Number(item.amount),
      type: item.type as 'Income' | 'Expense',
    }));

    setTransactions(savedTransactions);
  }

  loadTransactions();
}, [user]);

const [transactions, setTransactions] = useState(initialTransactions)
const [showForm, setShowForm] = useState(false)
const [name, setName] = useState('')
const [amount, setAmount] = useState('')
const [type, setType] = useState<'Income' | 'Expense'>('Expense')
const [category, setCategory] = useState('Other')
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null);
    setCheckingAuth(false);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    }
  );

  return () => listener.subscription.unsubscribe();
}, []);

if (checkingAuth) return <p>Loading Fluxora...</p>;
if (!user) return <Auth />;

  const income = transactions
    .filter((item) => item.type === 'Income')
    .reduce((total, item) => total + item.amount, 0)

  const expenses = transactions
    .filter((item) => item.type === 'Expense')
    .reduce((total, item) => total + item.amount, 0)

  const balance = income - expenses

  
async function addTransaction(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!name.trim() || Number(amount) <= 0 || !user) return;

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      name: name.trim(),
      category,
      date: new Date().toISOString().split('T')[0],
      amount: Number(amount),
      type,
    })
    .select()
    .single();

  if (error) {
    alert('Could not save transaction: ' + error.message);
    return;
  }

  const newTransaction: Transaction = {
    id: data.id,
    name: data.name,
    category: data.category,
    date: new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    amount: Number(data.amount),
    type: data.type as 'Income' | 'Expense',
  };

  setTransactions((current) => [newTransaction, ...current]);
  setName('');
  setAmount('');
  setCategory('Other');
  setType('Expense');
  setShowForm(false);
}

 
async function deleteTransaction(id: string | number) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Could not delete transaction: ' + error.message);
    return;
  }

  setTransactions((current) =>
    current.filter((item) => item.id !== id)
  );
}


  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon">F</span>
          <span>fluxora<span className="brand-dot">.</span></span>
        </a>

        <p className="nav-label">WORKSPACE</p>
        <button className="nav-item active">
          <span>▦</span> Overview
        </button>
        <button className="nav-item" onClick={() => setShowForm(true)}>
          <span>↕</span> Transactions
        </button>
        <button className="nav-item" onClick={() => alert('Budgets coming soon!')}>
          <span>◷</span> Budgets
        </button>
        <button className="nav-item" onClick={() => alert('Reports coming soon!')}>
          <span>▥</span> Reports
        </button>

        <div className="sidebar-bottom">
          <div className="profile-avatar">H</div>
          <div className="profile-info">
            <strong>My Workspace</strong>
            <span>Personal account</span>
          </div>
          <span className="profile-menu">···</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>Overview</h1>
          </div>
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            <span>＋</span> Add transaction
          </button>
        </header>

        <section className="welcome">
          <div>
            <p className="welcome-label">YOUR FINANCIAL SNAPSHOT</p>
            <h2>Make your money <span>work smarter.</span></h2>
            <p className="welcome-copy">
              Track your spending, manage your income, and stay in control.
            </p>
          </div>
          <div className="welcome-decoration">₹</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card balance-card">
            <div className="stat-heading">
              <span>Total balance</span>
              <span className="stat-icon">₹</span>
            </div>
            <h2>{formatMoney(balance)}</h2>
            <p className="stat-note">Income minus expenses</p>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Total income</span>
              <span className="stat-icon income-icon">↗</span>
            </div>
            <h2>{formatMoney(income)}</h2>
            <p className="stat-note positive">Money received</p>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Total expenses</span>
              <span className="stat-icon expense-icon">↘</span>
            </div>
            <h2>{formatMoney(expenses)}</h2>
            <p className="stat-note">Money spent</p>
          </article>
        </section>

        {showForm && (
          <section className="form-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">NEW ENTRY</p>
                <h2>Add a transaction</h2>
              </div>
              <button className="close-button" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={addTransaction} className="transaction-form">
              <label>
                Transaction name
                <input value={name} onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Monthly salary" required />
              </label>

              <label>
                Amount (₹)
                <input type="number" min="1" step="0.01" value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount" required />
              </label>

              <label>
                Type
                <select value={type} onChange={(event) => setType(event.target.value as 'Income' | 'Expense')}>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </label>

              <label>
                Category
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option>Other</option>
                  <option>Food</option>
                  <option>Salary</option>
                  <option>Shopping</option>
                  <option>Bills</option>
                  <option>Transport</option>
                  <option>Freelance</option>
                  <option>Education</option>
                </select>
              </label>

              <button className="primary-button form-submit" type="submit">
                Save transaction
              </button>
            </form>
          </section>
        )}

        <section className="transactions-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR ACTIVITY</p>
              <h2>Recent transactions</h2>
            </div>
            <span className="transaction-count">{transactions.length} entries</span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>TRANSACTION</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="transaction-name">
                        <span className={`transaction-symbol ${item.type.toLowerCase()}`}>
                          {item.type === 'Income' ? '↙' : '↗'}
                        </span>
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td><span className="category-tag">{item.category}</span></td>
                    <td className="date-cell">{item.date}</td>
                    <td className={item.type === 'Income' ? 'amount-income' : 'amount-expense'}>
                      {item.type === 'Income' ? '+' : '−'}{formatMoney(item.amount)}
                    </td>
                    <td>
                      <button className="delete-button" onClick={() => deleteTransaction(item.id)}
                        aria-label={`Delete ${item.name}`} title="Delete transaction">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <p className="empty-state">No transactions yet. Add your first one above!</p>
          )}
        </section>

        <footer className="footer">
          <span>© 2026 Fluxora</span>
          <span>Clarity for every rupee.</span>
        </footer>
      </main>
    </div>
  )
}

export default App
