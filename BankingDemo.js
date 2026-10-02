(function () {
    const STORAGE_KEY = "manishbank-demo-data-v1";
    const initialData = {
        customers: [
            { id: "CUS-1001", name: "Manish Kumar", email: "manish@example.test", phone: "+91 98765 43210", kyc: "Verified", createdAt: new Date().toISOString() },
            { id: "CUS-1002", name: "Rahul Sharma", email: "rahul@example.test", phone: "+91 98765 43211", kyc: "Verified", createdAt: new Date().toISOString() },
            { id: "CUS-1003", name: "Priya Singh", email: "priya@example.test", phone: "+91 98765 43212", kyc: "In review", createdAt: new Date().toISOString() },
            { id: "CUS-1004", name: "Amit Verma", email: "amit@example.test", phone: "+91 98765 43213", kyc: "Pending", createdAt: new Date().toISOString() }
        ],
        accounts: [
            { id: "ACC-4589", customerId: "CUS-1001", type: "Savings", balance: 124580.5, status: "Active" },
            { id: "ACC-2124", customerId: "CUS-1001", type: "Savings", balance: 65430, status: "Active" },
            { id: "ACC-8841", customerId: "CUS-1001", type: "Investment", balance: 215900, status: "Active" },
            { id: "ACC-1002", customerId: "CUS-1002", type: "Savings", balance: 45000, status: "Active" },
            { id: "ACC-1003", customerId: "CUS-1003", type: "Current", balance: 72000, status: "Active" },
            { id: "ACC-1004", customerId: "CUS-1004", type: "Savings", balance: 18500, status: "Active" }
        ],
        transactions: [
            { id: "TXN-1001", type: "Deposit", accountId: "ACC-4589", amount: 45000, description: "Salary credit", direction: "credit", status: "Completed", createdAt: new Date().toISOString() },
            { id: "TXN-1002", type: "Withdrawal", accountId: "ACC-4589", amount: 2499, description: "Shopping", direction: "debit", status: "Completed", createdAt: new Date().toISOString() },
            { id: "TXN-1003", type: "Withdrawal", accountId: "ACC-4589", amount: 850, description: "Restaurant", direction: "debit", status: "Completed", createdAt: new Date().toISOString() },
            { id: "TXN-1004", type: "Transfer", accountId: "ACC-4589", amount: 5000, description: "Transfer to Rahul Sharma", direction: "debit", status: "Completed", createdAt: new Date().toISOString() },
            { id: "TXN-1005", type: "Withdrawal", accountId: "ACC-2124", amount: 1240, description: "Grocery store", direction: "debit", status: "Completed", createdAt: new Date().toISOString() }
        ],
        loans: [],
        deposits: [],
        beneficiaries: [],
        profile: { name: "Manish Kumar", email: "manish@example.test" },
        notifications: [{
            id: "NTF-1001",
            message: "Welcome to the ManishBank interactive demo.",
            createdAt: new Date().toISOString(),
            read: false
        }],
        transferLimit: 100000
    };

    let data = loadData();
    let lastReceiptId = "";

    function loadData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                return structuredClone(initialData);
            }
            const parsed = JSON.parse(saved);
            return { ...structuredClone(initialData), ...parsed };
        } catch (error) {
            console.warn("Could not load demo records; using fresh demo data.", error);
            return structuredClone(initialData);
        }
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("Could not save demo records to this browser.", error);
            throw new Error("Could not save demo data in this browser. Free up browser storage and try again.");
        }
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
        }[character]));
    }

    function money(amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    }

    function newId(prefix, collection) {
        const last = collection.reduce((max, item) => {
            const number = Number(String(item.id).match(/\d+$/)?.[0]) || 0;
            return Math.max(max, number);
        }, 1000);
        return `${prefix}-${last + 1}`;
    }

    function nowLabel(value = new Date().toISOString()) {
        return new Date(value).toLocaleString([], {
            year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
        });
    }

    function notice(message) {
        data.notifications.unshift({
            id: newId("NTF", data.notifications),
            message,
            createdAt: new Date().toISOString(),
            read: false
        });
        saveData();
        renderNotifications();
    }

    function customerOptions(selected = "") {
        return data.customers.map(customer =>
            `<option value="${escapeHtml(customer.id)}"${customer.id === selected ? " selected" : ""}>${escapeHtml(customer.name)} (${escapeHtml(customer.id)})</option>`
        ).join("");
    }

    function accountOptions(selected = "") {
        return data.accounts.filter(account => account.status === "Active").map(account => {
            const owner = data.customers.find(customer => customer.id === account.customerId);
            const label = `${owner?.name || account.customerId} — ${account.type} ${account.id} · ${money(account.balance)}`;
            return `<option value="${escapeHtml(account.id)}"${account.id === selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
        }).join("");
    }

    function customerChoices() {
        return data.customers.map(customer => ({
            value: customer.id,
            label: `${customer.name} (${customer.id})`
        }));
    }

    function activeAccountChoices() {
        return data.accounts.filter(account => account.status === "Active").map(account => {
            const owner = data.customers.find(customer => customer.id === account.customerId);
            return {
                value: account.id,
                label: `${owner?.name || account.customerId} · ${account.type} · ${account.id}`
            };
        });
    }

    function workspaceForm(title, body, submitLabel, formId) {
        return `<form class="demo-form" id="${formId}"><h3>${title}</h3>${body}<button type="submit" class="primary-btn">${submitLabel}</button></form>`;
    }

    function field(label, name, type = "text", options = {}) {
        const id = `${name}-${Math.random().toString(36).slice(2, 8)}`;
        const required = options.required === false ? "" : " required";
        if (options.options) {
            return `<label for="${id}">${label}</label><select id="${id}" name="${name}"${required}>${options.options.map(option => {
                const value = typeof option === "object" ? option.value : option;
                const labelText = typeof option === "object" ? option.label : option;
                return `<option value="${escapeHtml(value)}">${escapeHtml(labelText)}</option>`;
            }).join("")}</select>`;
        }
        const min = options.min !== undefined ? ` min="${options.min}"` : "";
        const step = options.step ? ` step="${options.step}"` : "";
        const placeholder = options.placeholder ? ` placeholder="${escapeHtml(options.placeholder)}"` : "";
        return `<label for="${id}">${label}</label><input id="${id}" name="${name}" type="${type}"${required}${min}${step}${placeholder}>`;
    }

    function table(headers, rows, emptyMessage = "No demo records yet.") {
        if (!rows.length) {
            return `<div class="demo-empty">${escapeHtml(emptyMessage)}</div>`;
        }
        return `<div class="demo-table-wrap"><table class="demo-table"><thead><tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
    }

    function accountRow(account) {
        const owner = data.customers.find(customer => customer.id === account.customerId);
        return `<tr>
            <td>${escapeHtml(account.id)}</td><td>${escapeHtml(owner?.name || "Unknown")}</td>
            <td><select data-account-type="${escapeHtml(account.id)}" aria-label="Account type for ${escapeHtml(account.id)}">${["Savings", "Current", "Investment"].map(type => `<option${account.type === type ? " selected" : ""}>${type}</option>`).join("")}</select></td><td>${money(account.balance)}</td>
            <td><select data-account-status="${escapeHtml(account.id)}" aria-label="Status for ${escapeHtml(account.id)}">${["Active", "Blocked", "Closed"].map(status => `<option${account.status === status ? " selected" : ""}>${status}</option>`).join("")}</select></td>
            <td><button type="button" class="text-button" data-close-account="${escapeHtml(account.id)}">Close</button></td>
        </tr>`;
    }

    function renderAccounts() {
        const target = document.getElementById("accountManagementWorkspace");
        if (!target) return;
        const create = workspaceForm("Open a new account",
            `${field("Customer", "customerId", "text", { options: customerChoices() })}
             ${field("Account type", "type", "text", { options: ["Savings", "Current"] })}`,
            "Open account", "createAccountForm");
        target.innerHTML = `${create}
            <div class="demo-section-heading"><h3>Account directory</h3><span>${data.accounts.length} accounts</span></div>
            ${table(["Account ID", "Customer", "Type", "Balance", "Status", "Action"], data.accounts.map(accountRow), "No accounts yet.")}`;
    }

    function renderCustomers(filter = "") {
        const target = document.getElementById("customerManagementWorkspace");
        if (!target) return;
        const query = filter.trim().toLowerCase();
        const customers = data.customers.filter(customer =>
            [customer.id, customer.name, customer.email, customer.phone].some(value => String(value).toLowerCase().includes(query))
        );
        target.innerHTML = `
            <div class="demo-toolbar">
                <label for="customerSearch">Search customers</label>
                <input id="customerSearch" type="search" placeholder="Name, email, phone, or customer ID" value="${escapeHtml(filter)}">
            </div>
            ${workspaceForm("Add customer", `
                ${field("Full name", "name")}
                ${field("Email", "email", "email")}
                ${field("Phone", "phone", "tel")}
                ${field("KYC status", "kyc", "text", { options: ["Pending", "In review", "Verified", "Rejected"] })}`,
            "Add customer", "createCustomerForm")}
            <div class="demo-section-heading"><h3>Customers &amp; KYC profiles</h3><span>${customers.length} shown</span></div>
            ${table(["Customer", "Contact", "KYC", "Accounts", "Actions"], customers.map(customer => {
                const accountCount = data.accounts.filter(account => account.customerId === customer.id).length;
                return `<tr><td><strong>${escapeHtml(customer.name)}</strong><small>${escapeHtml(customer.id)}</small></td>
                    <td>${escapeHtml(customer.email)}<small>${escapeHtml(customer.phone)}</small></td>
                    <td>${escapeHtml(customer.kyc)}</td><td>${accountCount}</td>
                    <td><button type="button" class="text-button" data-customer-action="view" data-id="${escapeHtml(customer.id)}">View</button>
                    <button type="button" class="text-button" data-customer-action="update" data-id="${escapeHtml(customer.id)}">Update</button>
                    <button type="button" class="text-button danger" data-customer-action="delete" data-id="${escapeHtml(customer.id)}">Delete</button></td></tr>`;
            }), "No customer matched your search.")}
            <div class="inline-editor" id="customerEditor" hidden></div>`;
    }

    function transactionRow(transaction) {
        const account = data.accounts.find(item => item.id === transaction.accountId);
        const amountClass = transaction.direction === "credit" ? "credit" : "debit";
        const signedAmount = transaction.direction === "credit" ? "+" : "−";
        return `<tr><td>${escapeHtml(transaction.id)}</td><td>${escapeHtml(nowLabel(transaction.createdAt))}</td>
            <td>${escapeHtml(transaction.type)}</td><td>${escapeHtml(transaction.description)}</td>
            <td>${escapeHtml(account?.id || transaction.accountId || "—")}</td>
            <td class="${amountClass}">${signedAmount}${money(transaction.amount)}</td>
            <td>${escapeHtml(transaction.status || "Completed")}</td>
            <td><button type="button" class="text-button" data-receipt="${escapeHtml(transaction.id)}">Receipt</button></td></tr>`;
    }

    function renderTransactions(filter = "") {
        const target = document.getElementById("transactionWorkspace");
        if (!target) return;
        const q = filter.toLowerCase();
        const transactions = [...data.transactions].reverse().filter(item =>
            [item.id, item.type, item.description, item.accountId, item.status].some(value => String(value || "").toLowerCase().includes(q))
        );
        target.innerHTML = `
            <div class="demo-toolbar">
                <label for="transactionSearch">Search or filter transactions</label>
                <input id="transactionSearch" type="search" placeholder="Transaction ID, type, description, or account" value="${escapeHtml(filter)}">
            </div>
            ${workspaceForm("Record deposit or withdrawal", `
                ${field("Transaction type", "type", "text", { options: ["Deposit", "Withdrawal"] })}
                ${field("Account", "accountId", "text", { options: activeAccountChoices() })}
                ${field("Amount (₹)", "amount", "number", { min: "0.01", step: "0.01" })}
                ${field("Description", "description", "text", { placeholder: "Cash deposit, ATM withdrawal…" })}`,
            "Record transaction", "createTransactionForm")}
            <div class="demo-section-heading"><h3>Transaction history &amp; receipts</h3><span>${transactions.length} records</span></div>
            ${table(["Transaction ID", "Date", "Type", "Description", "Account", "Amount", "Status", ""], transactions.map(transactionRow))}
            <section class="receipt-panel" id="transactionReceipt" hidden aria-live="polite"></section>`;
    }

    function renderTransfers() {
        const target = document.getElementById("transferManagementWorkspace");
        if (!target) return;
        target.innerHTML = `
            <div class="demo-limit">Per-transfer limit: <strong>${money(data.transferLimit)}</strong></div>
            ${workspaceForm("Update demo transfer limit", `${field("Maximum per transfer (₹)", "limit", "number", { min: "1", step: "0.01" })}`, "Save limit", "transferLimitForm")}
            ${workspaceForm("Send a demo transfer", `
                ${field("From account", "fromAccount", "text", { options: activeAccountChoices() })}
                ${field("Transfer to", "destinationType", "text", { options: ["Another customer", "My own account", "Saved beneficiary"] })}
                <div data-recipient-fields>${field("Recipient customer", "recipientId", "text", { options: customerChoices() })}</div>
                <div data-beneficiary-fields hidden>${field("Saved beneficiary", "beneficiaryId", "text", { options: data.beneficiaries.map(item => ({ value: item.id, label: `${item.name} · ${item.bankName}` })) })}</div>
                <div data-own-account-fields hidden>${field("Your destination account", "toAccount", "text", { options: activeAccountChoices() })}</div>
                ${field("Amount (₹)", "amount", "number", { min: "0.01", step: "0.01" })}
                ${field("Note", "description", "text", { required: false, placeholder: "Optional transfer note" })}`,
            "Transfer funds", "createTransferForm")}
            ${workspaceForm("Add beneficiary", `
                ${field("Beneficiary name", "name")}
                ${field("Account number", "accountNumber")}
                ${field("Bank name", "bankName")}`,
            "Save beneficiary", "createBeneficiaryForm")}
            <div class="demo-section-heading"><h3>Beneficiaries</h3><span>${data.beneficiaries.length} saved</span></div>
            ${table(["Name", "Bank", "Account", "Action"], data.beneficiaries.map(item =>
                `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.bankName)}</td><td>•••• ${escapeHtml(item.accountNumber.slice(-4))}</td><td><button type="button" class="text-button danger" data-remove-beneficiary="${escapeHtml(item.id)}">Remove</button></td></tr>`
            ), "No beneficiaries saved.")}
            <div class="demo-section-heading"><h3>Transfer status &amp; history</h3></div>`;
        target.querySelector("[data-own-account-fields] select").disabled = true;
        target.querySelector("[data-beneficiary-fields] select").disabled = true;
    }

    function renderLoans() {
        const target = document.getElementById("loanWorkspace");
        if (!target) return;
        const rows = data.loans.map(loan => `<tr><td>${escapeHtml(loan.id)}</td><td>${escapeHtml(loan.customerName)}</td><td>${escapeHtml(loan.type)}</td>
            <td>${money(loan.amount)}</td><td>${Number(loan.rate).toFixed(2)}%</td><td>${escapeHtml(loan.status)}</td>
            <td>${money(loan.outstanding)}</td><td>
            ${loan.status === "Pending" ? `<button class="text-button" data-loan-status="Approved" data-id="${escapeHtml(loan.id)}">Approve</button><button class="text-button danger" data-loan-status="Rejected" data-id="${escapeHtml(loan.id)}">Reject</button>` : ""}
            ${loan.status === "Approved" && loan.outstanding > 0 ? `<button class="text-button" data-loan-repay="${escapeHtml(loan.id)}">Repay</button>` : ""}
            </td></tr>`);
        target.innerHTML = `
            ${workspaceForm("Apply for a demo loan", `
                ${field("Customer", "customerId", "text", { options: customerChoices() })}
                ${field("Loan type", "type", "text", { options: ["Personal", "Home", "Vehicle", "Education"] })}
                ${field("Principal amount (₹)", "amount", "number", { min: "1", step: "0.01" })}
                ${field("Annual interest rate (%)", "rate", "number", { min: "0", step: "0.01" })}
                ${field("Term (months)", "months", "number", { min: "1", step: "1" })}`,
            "Submit application", "createLoanForm")}
            <section class="calculator-panel"><h3>EMI calculator</h3>
                ${field("Principal (₹)", "calculatorPrincipal", "number", { min: "1", step: "0.01" })}
                ${field("Annual rate (%)", "calculatorRate", "number", { min: "0", step: "0.01" })}
                ${field("Term (months)", "calculatorMonths", "number", { min: "1", step: "1" })}
                <button class="secondary-btn" type="button" data-calculate-emi>Calculate EMI</button>
                <strong id="emiResult">Enter values to calculate an estimated EMI.</strong>
            </section>
            <div class="demo-section-heading"><h3>Applications, approval &amp; repayment</h3></div>
            ${table(["Loan ID", "Customer", "Type", "Amount", "Rate", "Status", "Outstanding", "Action"], rows)}`;
    }

    function depositMaturity(principal, rate, months, monthly) {
        const monthlyRate = rate / 1200;
        if (monthly) {
            if (monthlyRate === 0) return principal * months;
            return principal * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        }
        return principal * Math.pow(1 + monthlyRate, months);
    }

    function renderDeposits() {
        const target = document.getElementById("depositWorkspace");
        if (!target) return;
        target.innerHTML = `
            ${workspaceForm("Create fixed or recurring deposit", `
                ${field("Customer", "customerId", "text", { options: customerChoices() })}
                ${field("Funding account", "fundingAccount", "text", { options: activeAccountChoices() })}
                ${field("Product type", "type", "text", { options: ["Fixed Deposit", "Recurring Deposit"] })}
                ${field("Deposit amount (₹)", "amount", "number", { min: "1", step: "0.01" })}
                ${field("Monthly contribution for RD (₹)", "monthlyContribution", "number", { required: false, min: "0", step: "0.01" })}
                ${field("Annual interest rate (%)", "rate", "number", { min: "0", step: "0.01" })}
                ${field("Term (months)", "months", "number", { min: "1", step: "1" })}`,
            "Create deposit", "createDepositForm")}
            <div class="demo-section-heading"><h3>Deposit accounts &amp; maturity</h3></div>
            ${table(["Deposit ID", "Customer", "Product", "Principal", "Rate", "Maturity date", "Estimated maturity"], data.deposits.map(item =>
                `<tr><td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.customerName)}</td><td>${escapeHtml(item.type)}</td><td>${money(item.amount)}</td><td>${Number(item.rate).toFixed(2)}%</td><td>${escapeHtml(item.maturityDate)}</td><td>${money(item.maturityAmount)}</td></tr>`
            ), "No fixed or recurring deposits yet.")}`;
    }

    function renderAdmin() {
        const target = document.getElementById("adminWorkspace");
        if (!target) return;
        target.innerHTML = `<div class="demo-metrics">
            <div><span>Customers</span><strong>${data.customers.length}</strong></div>
            <div><span>Accounts</span><strong>${data.accounts.length}</strong></div>
            <div><span>Transactions</span><strong>${data.transactions.length}</strong></div>
            <div><span>Loan applications</span><strong>${data.loans.length}</strong></div>
        </div>
        <div class="demo-section-heading"><h3>Manage accounts</h3><span>Block, unblock, or close accounts</span></div>
        ${table(["Account", "Owner", "Type", "Balance", "Status", "Change status"], data.accounts.map(account =>
            `<tr><td>${escapeHtml(account.id)}</td><td>${escapeHtml(data.customers.find(c => c.id === account.customerId)?.name || "Unknown")}</td>
            <td>${escapeHtml(account.type)}</td><td>${money(account.balance)}</td><td>${escapeHtml(account.status)}</td><td>
            ${["Active", "Blocked", "Closed"].map(status => `<button type="button" class="text-button" data-admin-status="${status}" data-id="${escapeHtml(account.id)}">${status}</button>`).join("")}
            </td></tr>`
        ))}
        <div class="demo-section-heading"><h3>Manage customers</h3></div>
        ${table(["Customer ID", "Name", "KYC", "Actions"], data.customers.map(customer =>
            `<tr><td>${escapeHtml(customer.id)}</td><td>${escapeHtml(customer.name)}</td><td>${escapeHtml(customer.kyc)}</td><td>
            <button type="button" class="text-button" data-open-customer-action="view" data-id="${escapeHtml(customer.id)}">View</button>
            <button type="button" class="text-button" data-open-customer-action="update" data-id="${escapeHtml(customer.id)}">Update</button>
            </td></tr>`
        ))}
        <div class="demo-section-heading"><h3>Recent transactions</h3></div>
        ${table(["Transaction ID", "Type", "Description", "Amount", "Status"], data.transactions.slice().reverse().slice(0, 10).map(transaction =>
            `<tr><td>${escapeHtml(transaction.id)}</td><td>${escapeHtml(transaction.type)}</td><td>${escapeHtml(transaction.description)}</td><td>${money(transaction.amount)}</td><td>${escapeHtml(transaction.status)}</td></tr>`
        ))}
        <div class="demo-section-heading"><h3>Loan applications</h3></div>
        ${table(["Loan ID", "Customer", "Type", "Amount", "Status"], data.loans.map(loan =>
            `<tr><td>${escapeHtml(loan.id)}</td><td>${escapeHtml(loan.customerName)}</td><td>${escapeHtml(loan.type)}</td><td>${money(loan.amount)}</td><td>${escapeHtml(loan.status)}</td></tr>`
        ))}
        <p class="demo-notice">Admin controls and banking records are demo data stored in this browser.</p>`;
    }

    function renderReports() {
        const target = document.getElementById("reportsWorkspace");
        if (!target) return;
        target.innerHTML = `<div class="demo-toolbar">
            <label for="reportType">Report</label>
            <select id="reportType">
                <option value="daily">Daily transactions</option><option value="monthly">Monthly transactions</option>
                <option value="deposit">Deposit report</option><option value="withdrawal">Withdrawal report</option>
                <option value="loan">Loan report</option><option value="customer">Customer report</option>
                <option value="statement">Account statement</option>
            </select>
            <label for="reportAccount">Account</label><select id="reportAccount"><option value="">All accounts</option>${data.accounts.map(account => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.id)} · ${escapeHtml(account.type)}</option>`).join("")}</select>
            <button type="button" class="secondary-btn" data-export-report>Download CSV</button>
            <button type="button" class="secondary-btn" data-print-report>Print / Save PDF</button>
        </div><div id="reportResult" class="report-result"></div>`;
        renderReportResult();
    }

    function getReportRows() {
        const type = document.getElementById("reportType")?.value || "daily";
        const accountId = document.getElementById("reportAccount")?.value || "";
        const today = new Date();
        return data.transactions.filter(transaction => {
            if (accountId && transaction.accountId !== accountId) return false;
            if (type === "deposit" && transaction.type !== "Deposit") return false;
            if (type === "withdrawal" && transaction.type !== "Withdrawal") return false;
            if (type === "daily" && new Date(transaction.createdAt).toDateString() !== today.toDateString()) return false;
            if (type === "monthly" && (new Date(transaction.createdAt).getMonth() !== today.getMonth() || new Date(transaction.createdAt).getFullYear() !== today.getFullYear())) return false;
            return true;
        });
    }

    function renderReportResult() {
        const target = document.getElementById("reportResult");
        if (!target) return;
        const type = document.getElementById("reportType")?.value || "daily";
        if (type === "customer") {
            target.innerHTML = table(["Customer ID", "Name", "Email", "Phone", "KYC"], data.customers.map(customer =>
                `<tr><td>${escapeHtml(customer.id)}</td><td>${escapeHtml(customer.name)}</td><td>${escapeHtml(customer.email)}</td><td>${escapeHtml(customer.phone)}</td><td>${escapeHtml(customer.kyc)}</td></tr>`
            ));
            return;
        }
        if (type === "loan") {
            target.innerHTML = table(["Loan ID", "Customer", "Type", "Amount", "Status"], data.loans.map(loan =>
                `<tr><td>${escapeHtml(loan.id)}</td><td>${escapeHtml(loan.customerName)}</td><td>${escapeHtml(loan.type)}</td><td>${money(loan.amount)}</td><td>${escapeHtml(loan.status)}</td></tr>`
            ));
            return;
        }
        target.innerHTML = table(["Transaction ID", "Date", "Type", "Description", "Account", "Amount"], getReportRows().map(transaction =>
            `<tr><td>${escapeHtml(transaction.id)}</td><td>${escapeHtml(nowLabel(transaction.createdAt))}</td><td>${escapeHtml(transaction.type)}</td><td>${escapeHtml(transaction.description)}</td><td>${escapeHtml(transaction.accountId)}</td><td>${money(transaction.amount)}</td></tr>`
        ), "No records match this report.");
    }

    function renderNotifications() {
        const target = document.getElementById("notificationsWorkspace");
        if (!target) return;
        target.innerHTML = `<button type="button" class="secondary-btn" data-mark-notifications-read>Mark all as read</button>
            ${table(["Notification", "Time", "Status"], data.notifications.map(item =>
                `<tr><td>${escapeHtml(item.message)}</td><td>${escapeHtml(nowLabel(item.createdAt))}</td><td>${item.read ? "Read" : "New"}</td></tr>`
            ), "No notifications yet.")}`;
    }

    function renderSettings() {
        const target = document.getElementById("profileSettingsWorkspace");
        if (!target) return;
        target.innerHTML = `<form class="demo-form profile-form" id="updateProfileForm">
            <label for="profileName">Name</label><input id="profileName" name="name" required value="${escapeHtml(data.profile.name)}">
            <label for="profileEmail">Email</label><input id="profileEmail" name="email" type="email" required value="${escapeHtml(data.profile.email)}">
            <button type="submit" class="secondary-btn">Save profile</button>
        </form>
        <div class="demo-actions"><button type="button" class="secondary-btn" data-open-notification-settings>Notification settings</button></div>
        <p class="demo-notice">Profile changes are saved only in this browser.</p>`;
    }

    function renderAll() {
        renderCustomers(document.getElementById("customerSearch")?.value || "");
        renderAccounts();
        renderTransactions(document.getElementById("transactionSearch")?.value || "");
        renderTransfers();
        renderLoans();
        renderDeposits();
        renderAdmin();
        renderReports();
        renderNotifications();
        renderSettings();
        updateDashboard();
        renderTransferHistory();
        if (lastReceiptId) {
            const transaction = data.transactions.find(item => item.id === lastReceiptId);
            const receipt = document.getElementById("transactionReceipt");
            if (transaction && receipt) {
                receipt.innerHTML = receiptHtml(transaction);
                receipt.hidden = false;
            }
        }
    }

    function updateDashboard() {
        const deposits = data.transactions.filter(t => t.direction === "credit").reduce((sum, t) => sum + t.amount, 0);
        const withdrawals = data.transactions.filter(t => t.direction === "debit").reduce((sum, t) => sum + t.amount, 0);
        const activeAccounts = data.accounts.filter(account => account.status === "Active").length;
        const update = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        update("dashboardDeposits", money(deposits));
        update("dashboardWithdrawals", money(withdrawals));
        update("dashboardCustomers", String(data.customers.length));
        update("dashboardAccounts", String(activeAccounts));

        const selectedAccountId = {
            primary: "ACC-4589",
            savings: "ACC-2124",
            investment: "ACC-8841"
        }[window.getActiveAccountKey?.() || "primary"];
        const selectedAccount = data.accounts.find(account => account.id === selectedAccountId);
        if (selectedAccount) {
            const displayBalance = money(selectedAccount.balance);
            const balanceElement = document.getElementById("balance");
            if (balanceElement) balanceElement.textContent = window.isBalanceVisible?.() === false ? "••••••••" : displayBalance;
            update("availableBalance", displayBalance);
        }
        update("profileDisplayName", data.profile.name);
        const avatar = document.querySelector(".profile-switcher .avatar");
        if (avatar) avatar.textContent = data.profile.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();

        const recent = document.getElementById("dashboardRecentTransactions");
        if (recent) {
            const latest = [...data.transactions].reverse().slice(0, 5);
            recent.innerHTML = latest.map(transaction => {
                const incoming = transaction.direction === "credit";
                const icon = incoming ? "arrow-down-left" : transaction.type === "Transfer" ? "send" : "shopping-bag";
                return `<div class="transaction">
                    <div class="transaction-icon ${incoming ? "income" : transaction.type === "Transfer" ? "transfer" : "shopping"}"><i data-lucide="${icon}"></i></div>
                    <div class="transaction-info"><strong>${escapeHtml(transaction.description)}</strong><span>${escapeHtml(nowLabel(transaction.createdAt))} · ${escapeHtml(transaction.id)}</span></div>
                    <div class="transaction-amount ${incoming ? "credit" : "debit"}">${incoming ? "+" : "−"}${money(transaction.amount)}</div>
                </div>`;
            }).join("");
            window.lucide?.createIcons();
        }
    }

    function renderTransferHistory() {
        const target = document.getElementById("transferHistoryList");
        if (!target) return;
        const transfers = data.transactions.filter(t => t.type === "Transfer" && t.direction === "debit").slice().reverse();
        if (!transfers.length) return;
        target.innerHTML = transfers.map(transaction =>
            `<div class="list-row"><div><strong>${escapeHtml(transaction.description)}</strong><small>${escapeHtml(nowLabel(transaction.createdAt))} · ${escapeHtml(transaction.id)} · ${escapeHtml(transaction.status)}</small></div><span class="debit">−${money(transaction.amount)}</span></div>`
        ).join("");
    }

    function addTransaction({ type, accountId, amount, description, direction, status = "Completed", transferId = "" }) {
        const account = data.accounts.find(item => item.id === accountId);
        if (!account || account.status !== "Active") throw new Error("Select an active account.");
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter an amount greater than zero.");
        if (direction === "debit" && account.balance < amount) throw new Error("Insufficient demo account balance.");

        account.balance += direction === "credit" ? amount : -amount;
        const transaction = {
            id: newId("TXN", data.transactions),
            type, accountId, amount, description, direction, status,
            transferId,
            createdAt: new Date().toISOString()
        };
        data.transactions.push(transaction);
        saveData();
        updateDashboard();
        renderTransferHistory();
        return transaction;
    }

    function receiptHtml(transaction) {
        return `<h3>Transaction receipt</h3><dl class="receipt-details">
            <div><dt>Transaction ID</dt><dd>${escapeHtml(transaction.id)}</dd></div>
            <div><dt>Type</dt><dd>${escapeHtml(transaction.type)}</dd></div>
            <div><dt>Description</dt><dd>${escapeHtml(transaction.description)}</dd></div>
            <div><dt>Account</dt><dd>${escapeHtml(transaction.accountId)}</dd></div>
            <div><dt>Amount</dt><dd>${money(transaction.amount)}</dd></div>
            <div><dt>Status</dt><dd>${escapeHtml(transaction.status)}</dd></div>
            <div><dt>Date</dt><dd>${escapeHtml(nowLabel(transaction.createdAt))}</dd></div>
        </dl><button type="button" class="secondary-btn" data-print-receipt>Print receipt</button>`;
    }

    function amountFrom(formData, name = "amount") {
        const amount = Number(formData.get(name));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter an amount greater than zero.");
        return amount;
    }

    function handleForm(form) {
        const values = new FormData(form);
        const kind = form.id;
        if (kind === "createCustomerForm") {
            const customer = {
                id: newId("CUS", data.customers),
                name: String(values.get("name")).trim(),
                email: String(values.get("email")).trim(),
                phone: String(values.get("phone")).trim(),
                kyc: values.get("kyc"),
                createdAt: new Date().toISOString()
            };
            data.customers.push(customer);
            notice(`Customer profile created for ${customer.name}.`);
            window.showMessage?.(`Customer ${customer.id} added`);
        } else if (kind === "createAccountForm") {
            const account = {
                id: newId("ACC", data.accounts),
                customerId: values.get("customerId"),
                type: values.get("type"),
                balance: 0,
                status: "Active"
            };
            data.accounts.push(account);
            window.showMessage?.(`Account ${account.id} opened`);
        } else if (kind === "createTransactionForm") {
            const type = values.get("type");
            const amount = amountFrom(values);
            const transaction = addTransaction({
                type,
                accountId: values.get("accountId"),
                amount,
                description: String(values.get("description")).trim() || type,
                direction: type === "Deposit" ? "credit" : "debit"
            });
            notice(`${type} of ${money(amount)} recorded.`);
            document.getElementById("transactionReceipt").innerHTML = receiptHtml(transaction);
            document.getElementById("transactionReceipt").hidden = false;
            lastReceiptId = transaction.id;
            window.showMessage?.(`${type} recorded · ${transaction.id}`);
        } else if (kind === "createTransferForm") {
            const from = data.accounts.find(item => item.id === values.get("fromAccount"));
            const amount = amountFrom(values);
            if (amount > data.transferLimit) throw new Error(`Transfer exceeds the ${money(data.transferLimit)} demo limit.`);
            const ownTransfer = values.get("destinationType") === "My own account";
            const beneficiaryTransfer = values.get("destinationType") === "Saved beneficiary";
            const recipient = ownTransfer
                ? data.accounts.find(item => item.id === values.get("toAccount"))
                : null;
            const beneficiary = beneficiaryTransfer
                ? data.beneficiaries.find(item => item.id === values.get("beneficiaryId"))
                : null;
            const customer = !ownTransfer && !beneficiaryTransfer
                ? data.customers.find(item => item.id === values.get("recipientId"))
                : null;
            if (ownTransfer && (!recipient || recipient.id === from?.id || recipient.customerId !== from?.customerId)) {
                throw new Error("Choose another active account owned by you.");
            }
            if (!ownTransfer && !beneficiaryTransfer && (!customer || customer.id === from?.customerId)) throw new Error("Select a different recipient customer.");
            if (beneficiaryTransfer && !beneficiary) throw new Error("Select a saved beneficiary first.");
            const recipientAccount = !ownTransfer && !beneficiaryTransfer
                ? data.accounts.find(account => account.customerId === customer.id && account.status === "Active")
                : null;
            if (!ownTransfer && !beneficiaryTransfer && !recipientAccount) {
                throw new Error("The recipient needs an active demo account before receiving funds.");
            }
            const transferId = newId("TRF", data.transactions);
            const destinationName = ownTransfer ? recipient.id : beneficiaryTransfer ? beneficiary.name : customer.name;
            const description = `${ownTransfer ? "Transfer to own account" : beneficiaryTransfer ? "Transfer to beneficiary" : "Transfer to"} ${destinationName}${values.get("description") ? ` — ${values.get("description")}` : ""}`;
            const debit = addTransaction({ type: "Transfer", accountId: from?.id, amount, description, direction: "debit", transferId });
            if (ownTransfer) {
                addTransaction({ type: "Transfer", accountId: recipient.id, amount, description: `Transfer from ${from.id}`, direction: "credit", transferId });
            } else if (!beneficiaryTransfer) {
                addTransaction({ type: "Transfer", accountId: recipientAccount.id, amount, description: `Received from ${from.id}`, direction: "credit", transferId });
            }
            notice(`Transfer ${transferId} sent to ${destinationName}.`);
            lastReceiptId = debit.id;
            window.showMessage?.(`Transfer sent · ${transferId}`);
        } else if (kind === "createBeneficiaryForm") {
            const beneficiary = {
                id: newId("BEN", data.beneficiaries),
                name: String(values.get("name")).trim(),
                accountNumber: String(values.get("accountNumber")).trim(),
                bankName: String(values.get("bankName")).trim()
            };
            data.beneficiaries.push(beneficiary);
            window.showMessage?.("Beneficiary saved");
        } else if (kind === "transferLimitForm") {
            const limit = Number(values.get("limit"));
            if (!Number.isFinite(limit) || limit <= 0) throw new Error("Enter a transfer limit greater than zero.");
            data.transferLimit = limit;
            window.showMessage?.("Transfer limit updated");
        } else if (kind === "createLoanForm") {
            const customer = data.customers.find(item => item.id === values.get("customerId"));
            const amount = amountFrom(values);
            const months = Number(values.get("months"));
            const rate = Number(values.get("rate"));
            if (!Number.isInteger(months) || months <= 0 || !Number.isFinite(rate) || rate < 0) throw new Error("Enter a valid rate and term.");
            data.loans.push({
                id: newId("LON", data.loans), customerId: customer.id, customerName: customer.name,
                type: values.get("type"), amount, rate, months, status: "Pending", outstanding: amount
            });
            notice(`Loan application submitted for ${customer.name}.`);
            window.showMessage?.("Loan application submitted");
        } else if (kind === "createDepositForm") {
            const customer = data.customers.find(item => item.id === values.get("customerId"));
            const fundingAccountId = values.get("fundingAccount");
            const fundingAccount = data.accounts.find(item => item.id === fundingAccountId && item.status === "Active");
            const type = values.get("type");
            const amount = amountFrom(values);
            const rate = Number(values.get("rate"));
            const months = Number(values.get("months"));
            const monthly = type === "Recurring Deposit";
            const monthlyContribution = Number(values.get("monthlyContribution")) || amount;
            if (!Number.isInteger(months) || months <= 0 || !Number.isFinite(rate) || rate < 0) throw new Error("Enter a valid interest rate and term.");
            const maturityDate = new Date();
            maturityDate.setMonth(maturityDate.getMonth() + months);
            const principal = monthly ? monthlyContribution * months : amount;
            if (!fundingAccount || fundingAccount.customerId !== customer.id) {
                throw new Error("Choose an active funding account owned by this customer.");
            }
            addTransaction({
                type: monthly ? "Recurring Deposit" : "Fixed Deposit",
                accountId: fundingAccountId,
                amount: principal,
                description: `${type} contribution`,
                direction: "debit"
            });
            data.deposits.push({
                id: newId("DEP", data.deposits), customerId: customer.id, customerName: customer.name, type,
                amount: principal,
                rate, months, maturityDate: maturityDate.toLocaleDateString(),
                maturityAmount: depositMaturity(monthly ? monthlyContribution : amount, rate, months, monthly)
            });
            notice(`${type} created for ${customer.name}.`);
            window.showMessage?.(`${type} created`);
        } else if (kind === "updateProfileForm") {
            data.profile.name = String(values.get("name")).trim();
            data.profile.email = String(values.get("email")).trim();
            const customerProfile = data.customers.find(customer => customer.id === "CUS-1001");
            if (customerProfile) {
                customerProfile.name = data.profile.name;
                customerProfile.email = data.profile.email;
            }
            const profileName = document.getElementById("profileDisplayName");
            if (profileName) profileName.textContent = data.profile.name;
            const avatar = document.querySelector(".profile-switcher .avatar");
            if (avatar) avatar.textContent = data.profile.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
            notice("Profile settings updated.");
            window.showMessage?.("Profile settings saved");
        } else {
            return;
        }
        saveData();
        renderAll();
    }

    document.addEventListener("submit", event => {
        const form = event.target.closest(".demo-form");
        if (!form) return;
        event.preventDefault();
        try {
            handleForm(form);
        } catch (error) {
            window.showMessage?.(error.message);
        }
    });

    document.addEventListener("input", event => {
        if (event.target.id === "customerSearch") renderCustomers(event.target.value);
        if (event.target.id === "transactionSearch") renderTransactions(event.target.value);
    });

    document.addEventListener("change", event => {
        const statusAccount = event.target.dataset.accountStatus;
        if (statusAccount) {
            const account = data.accounts.find(item => item.id === statusAccount);
            if (account) {
                account.status = event.target.value;
                saveData();
                notice(`Account ${account.id} status changed to ${account.status}.`);
                renderAll();
            }
        }
        const accountTypeId = event.target.dataset.accountType;
        if (accountTypeId) {
            const account = data.accounts.find(item => item.id === accountTypeId);
            if (account) {
                account.type = event.target.value;
                saveData();
                renderAll();
                window.showMessage?.(`Account ${account.id} updated`);
            }
        }
        if (event.target.id === "reportType" || event.target.id === "reportAccount") renderReportResult();
        if (event.target.name === "destinationType") {
            const own = event.target.value === "My own account";
            const beneficiary = event.target.value === "Saved beneficiary";
            const recipientFields = document.querySelector("[data-recipient-fields]");
            const ownFields = document.querySelector("[data-own-account-fields]");
            const beneficiaryFields = document.querySelector("[data-beneficiary-fields]");
            recipientFields.hidden = own || beneficiary;
            ownFields.hidden = !own;
            beneficiaryFields.hidden = !beneficiary;
            ownFields.querySelector("select").disabled = !own;
            beneficiaryFields.querySelector("select").disabled = !beneficiary;
        }
    });

    document.addEventListener("click", event => {
        const closeId = event.target.dataset.closeAccount;
        if (closeId) {
            const account = data.accounts.find(item => item.id === closeId);
            if (account) {
                account.status = "Closed";
                saveData();
                renderAll();
                window.showMessage?.(`${closeId} closed`);
            }
        }

        const adminStatus = event.target.dataset.adminStatus;
        const adminId = event.target.dataset.id;
        if (adminStatus && adminId) {
            const account = data.accounts.find(item => item.id === adminId);
            if (account) {
                account.status = adminStatus;
                saveData();
                notice(`Account alert: ${adminId} marked ${adminStatus.toLowerCase()}.`);
                renderAll();
                window.showMessage?.(`${adminId} ${adminStatus.toLowerCase()}`);
            }
        }

        const customerAction = event.target.dataset.customerAction;
        if (customerAction) handleCustomerAction(customerAction, event.target.dataset.id);
        const openCustomerAction = event.target.dataset.openCustomerAction;
        if (openCustomerAction) {
            document.querySelector('.nav-item[data-page="customers"]')?.click();
            handleCustomerAction(openCustomerAction, event.target.dataset.id);
        }

        const loanStatus = event.target.dataset.loanStatus;
        if (loanStatus) {
            const loan = data.loans.find(item => item.id === event.target.dataset.id);
            if (loan) {
                try {
                    if (loanStatus === "Approved") {
                        const account = data.accounts.find(item => item.customerId === loan.customerId && item.status === "Active");
                        if (!account) throw new Error("Customer needs an active account before loan approval.");
                        addTransaction({
                            type: "Loan disbursement",
                            accountId: account.id,
                            amount: loan.amount,
                            description: `Loan disbursement ${loan.id}`,
                            direction: "credit"
                        });
                    }
                    loan.status = loanStatus;
                    saveData();
                    notice(`Loan ${loan.id} ${loanStatus.toLowerCase()}.`);
                    renderAll();
                } catch (error) {
                    window.showMessage?.(error.message);
                }
            }
        }

        const repaymentId = event.target.dataset.loanRepay;
        if (repaymentId) repayLoan(repaymentId);

        const removeBeneficiaryId = event.target.dataset.removeBeneficiary;
        if (removeBeneficiaryId) {
            data.beneficiaries = data.beneficiaries.filter(item => item.id !== removeBeneficiaryId);
            saveData();
            renderTransfers();
        }

        const confirmDeleteCustomerId = event.target.dataset.confirmDeleteCustomer;
        if (confirmDeleteCustomerId) {
            const customer = data.customers.find(item => item.id === confirmDeleteCustomerId);
            if (customer) {
                data.accounts = data.accounts.filter(account => account.customerId !== customer.id);
                data.customers = data.customers.filter(item => item.id !== customer.id);
                saveData();
                notice(`Customer profile ${customer.id} deleted; transaction history retained.`);
                renderAll();
                window.showMessage?.("Customer and linked accounts removed");
            }
        }

        if (event.target.matches("[data-cancel-customer-delete]")) {
            const editor = document.getElementById("customerEditor");
            if (editor) editor.hidden = true;
        }

        const receiptId = event.target.dataset.receipt;
        if (receiptId) {
            const transaction = data.transactions.find(item => item.id === receiptId);
            const receipt = document.getElementById("transactionReceipt");
            if (transaction && receipt) {
                receipt.innerHTML = receiptHtml(transaction);
                receipt.hidden = false;
                lastReceiptId = transaction.id;
                receipt.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }

        if (event.target.matches("[data-print-receipt]")) window.print();
        if (event.target.matches("[data-calculate-emi]")) calculateEmi();
        if (event.target.matches("[data-export-report]")) exportReport();
        if (event.target.matches("[data-print-report]")) window.print();
        if (event.target.matches("[data-mark-notifications-read]")) {
            data.notifications.forEach(item => { item.read = true; });
            saveData();
            renderNotifications();
        }

        if (event.target.matches("[data-open-notification-settings]")) {
            document.querySelector('.nav-item[data-page="settings"]')?.click();
            document.querySelector(".security-toggle")?.focus();
        }

    });

    function handleCustomerAction(action, id) {
        const customer = data.customers.find(item => item.id === id);
        if (!customer) return;
        const editor = document.getElementById("customerEditor");
        if (action === "delete") {
            const linkedAccounts = data.accounts.filter(account => account.customerId === id);
            editor.hidden = false;
            editor.innerHTML = `<h3>Delete customer profile?</h3>
                <p>This removes ${escapeHtml(customer.name)} and ${linkedAccounts.length} linked account record(s). Existing transaction and loan history remains.</p>
                <div class="demo-actions"><button type="button" class="primary-btn danger-button" data-confirm-delete-customer="${escapeHtml(id)}">Confirm delete</button>
                <button type="button" class="secondary-btn" data-cancel-customer-delete>Cancel</button></div>`;
            return;
        }
        if (action === "view") {
            const accounts = data.accounts.filter(account => account.customerId === id);
            editor.hidden = false;
            editor.innerHTML = `<h3>Customer profile · ${escapeHtml(customer.id)}</h3>
                <p><strong>${escapeHtml(customer.name)}</strong></p>
                <p>Email: ${escapeHtml(customer.email)} · Phone: ${escapeHtml(customer.phone)}</p>
                <p>KYC status: ${escapeHtml(customer.kyc)} · Profile created: ${escapeHtml(nowLabel(customer.createdAt))}</p>
                <h4>Customer accounts (${accounts.length})</h4>
                ${accounts.map(account => `<p>${escapeHtml(account.type)} · ${escapeHtml(account.id)} · ${money(account.balance)} · ${escapeHtml(account.status)}</p>`).join("")}`;
            return;
        }
        editor.hidden = false;
        editor.innerHTML = `<h3>Update customer · ${escapeHtml(customer.id)}</h3>
            <form class="demo-form" id="updateCustomerForm" data-id="${escapeHtml(id)}">
                <label>Name</label><input name="name" required value="${escapeHtml(customer.name)}">
                <label>Email</label><input name="email" type="email" required value="${escapeHtml(customer.email)}">
                <label>Phone</label><input name="phone" required value="${escapeHtml(customer.phone)}">
                <label>KYC status</label><select name="kyc">${["Pending", "In review", "Verified", "Rejected"].map(status => `<option${customer.kyc === status ? " selected" : ""}>${status}</option>`).join("")}</select>
                <button class="primary-btn" type="submit">Save customer</button>
            </form>`;
        editor.querySelector("form").addEventListener("submit", event => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            Object.assign(customer, {
                name: String(formData.get("name")).trim(),
                email: String(formData.get("email")).trim(),
                phone: String(formData.get("phone")).trim(),
                kyc: formData.get("kyc")
            });
            saveData();
            renderAll();
            window.showMessage?.("Customer profile updated");
        });
    }

    function repayLoan(id) {
        const loan = data.loans.find(item => item.id === id);
        if (!loan || loan.status !== "Approved") return;
        const account = data.accounts.find(item => item.customerId === loan.customerId && item.status === "Active");
        if (!account) {
            window.showMessage?.("No active customer account is available for repayment.");
            return;
        }
        const payment = Math.min(loan.outstanding, Math.max(1, loan.outstanding / loan.months));
        try {
            addTransaction({ type: "Loan repayment", accountId: account.id, amount: payment, description: `Repayment for ${loan.id}`, direction: "debit" });
            loan.outstanding = Math.max(0, loan.outstanding - payment);
            if (!loan.outstanding) loan.status = "Repaid";
            saveData();
            notice(`Loan repayment of ${money(payment)} recorded.`);
            renderAll();
        } catch (error) {
            window.showMessage?.(error.message);
        }
    }

    function calculateEmi() {
        const principal = Number(document.querySelector("[name='calculatorPrincipal']")?.value);
        const annualRate = Number(document.querySelector("[name='calculatorRate']")?.value);
        const months = Number(document.querySelector("[name='calculatorMonths']")?.value);
        const result = document.getElementById("emiResult");
        if (!principal || !months || !Number.isFinite(annualRate) || annualRate < 0) {
            result.textContent = "Enter a valid principal, rate, and term.";
            return;
        }
        const monthlyRate = annualRate / 1200;
        const emi = monthlyRate === 0
            ? principal / months
            : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        result.textContent = `Estimated monthly EMI: ${money(emi)}`;
    }

    function csvCell(value) {
        return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
    }

    function exportReport() {
        const type = document.getElementById("reportType").value;
        const headers = type === "customer"
            ? ["Customer ID", "Name", "Email", "Phone", "KYC"]
            : type === "loan"
                ? ["Loan ID", "Customer", "Type", "Amount", "Status"]
                : ["Transaction ID", "Date", "Type", "Description", "Account", "Amount"];
        const records = type === "customer"
            ? data.customers.map(c => [c.id, c.name, c.email, c.phone, c.kyc])
            : type === "loan"
                ? data.loans.map(l => [l.id, l.customerName, l.type, l.amount, l.status])
                : getReportRows().map(t => [t.id, nowLabel(t.createdAt), t.type, t.description, t.accountId, t.amount]);
        const csv = [headers, ...records].map(row => row.map(value => {
            const safeValue = typeof value === "string" && /^[=+\-@]/.test(value) ? `'${value}` : value;
            return csvCell(safeValue);
        }).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `manishbank-${type}-report.csv`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function activeDemoAccount() {
        const accountId = {
            primary: "ACC-4589",
            savings: "ACC-2124",
            investment: "ACC-8841"
        }[window.getActiveAccountKey?.() || "primary"];
        return data.accounts.find(account => account.id === accountId);
    }

    function transferToCustomer(name, amount) {
        const customer = data.customers.find(item => item.name === name);
        const from = activeDemoAccount();
        const recipient = customer && data.accounts.find(account => account.customerId === customer.id && account.status === "Active");
        const value = Number(amount);
        if (!from || !recipient) throw new Error("A sender and recipient with active demo accounts are required.");
        if (customer.id === from.customerId) throw new Error("Choose another customer, or use the own-account transfer option.");
        if (!Number.isFinite(value) || value <= 0) throw new Error("Enter an amount greater than zero.");
        if (value > data.transferLimit) throw new Error(`Transfer exceeds the ${money(data.transferLimit)} demo limit.`);
        const transferId = newId("TRF", data.transactions);
        const debit = addTransaction({
            type: "Transfer", accountId: from.id, amount: value, description: `Transfer to ${customer.name}`,
            direction: "debit", transferId
        });
        addTransaction({
            type: "Transfer", accountId: recipient.id, amount: value, description: `Received from ${from.id}`,
            direction: "credit", transferId
        });
        notice(`Money transferred to ${customer.name} · ${transferId}.`);
        renderAll();
        return debit;
    }

    function addMoneyToActive(amount, description = "Demo funds added") {
        const account = activeDemoAccount();
        const transaction = addTransaction({
            type: "Deposit",
            accountId: account?.id,
            amount: Number(amount),
            description,
            direction: "credit"
        });
        notice(`Money received: ${money(transaction.amount)} credited to ${account.id}.`);
        renderAll();
        return transaction;
    }

    function withdrawFromActive(amount, description = "Demo withdrawal") {
        const account = activeDemoAccount();
        const transaction = addTransaction({
            type: "Withdrawal",
            accountId: account?.id,
            amount: Number(amount),
            description,
            direction: "debit"
        });
        notice(`${description} of ${money(transaction.amount)} completed.`);
        renderAll();
        return transaction;
    }

    function requestMoneyFrom(name, amount) {
        const value = Number(amount);
        if (!Number.isFinite(value) || value <= 0) throw new Error("Enter an amount greater than zero.");
        notice(`Money request for ${money(value)} sent to ${name}.`);
    }

    window.ManishBankDemo = {
        updateDashboard,
        getAccountDetails(accountKey) {
            const accountId = { primary: "ACC-4589", savings: "ACC-2124", investment: "ACC-8841" }[accountKey];
            const account = data.accounts.find(item => item.id === accountId);
            return account ? { ...account } : null;
        },
        transferToCustomer,
        addMoneyToActive,
        withdrawFromActive,
        requestMoneyFrom
    };

    renderAll();
})();
