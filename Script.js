lucide.createIcons();

let balanceVisible = true;
let activeAccountKey = "primary";
window.isBalanceVisible = () => balanceVisible;
window.getActiveAccountKey = () => activeAccountKey;

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function toggleBalance() {

    const balance = document.getElementById("balance");

    if (balanceVisible) {
        balance.textContent = "••••••••";
        balanceVisible = false;
    } else {
        balance.textContent = accountDetails[activeAccountKey].balance;
        balanceVisible = true;
    }
    window.ManishBankDemo?.updateDashboard();
}

function showMessage(message) {

    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toastText");

    toastText.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function updateDashboardClock() {
    const now = new Date();
    const time = document.getElementById("dashboardTime");
    const date = document.getElementById("dashboardDate");
    const greeting = document.getElementById("timeGreeting");
    const hour = now.getHours();
    const timeOfDay = hour >= 5 && hour < 12
        ? "morning"
        : hour >= 12 && hour < 17
            ? "afternoon"
            : hour >= 17 && hour < 21
                ? "evening"
                : "night";

    if (greeting) {
        const name = document.getElementById("profileDisplayName")?.textContent || "Manish";
        greeting.textContent = `Good ${timeOfDay}, ${name} 👋`;
    }

    if (!time || !date) {
        return;
    }

    time.dateTime = now.toISOString();
    time.textContent = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    });
    date.textContent = now.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

let displayedCalendarMonth = new Date();
displayedCalendarMonth = new Date(
    displayedCalendarMonth.getFullYear(),
    displayedCalendarMonth.getMonth(),
    1
);

function renderDashboardCalendar() {
    const monthLabel = document.getElementById("calendarMonth");
    const daysGrid = document.getElementById("calendarDays");

    if (!monthLabel || !daysGrid) {
        return;
    }

    const year = displayedCalendarMonth.getFullYear();
    const month = displayedCalendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    monthLabel.textContent = displayedCalendarMonth.toLocaleDateString([], {
        month: "long",
        year: "numeric"
    });

    const cells = [];
    for (let blank = 0; blank < firstWeekday; blank += 1) {
        cells.push('<span class="calendar-day" role="presentation"></span>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const isToday = year === today.getFullYear()
            && month === today.getMonth()
            && day === today.getDate();
        const dateLabel = new Date(year, month, day).toLocaleDateString([], {
            dateStyle: "full"
        });
        cells.push(
            `<span class="calendar-day${isToday ? " today" : ""}" role="gridcell"${isToday ? ' aria-current="date"' : ""} aria-label="${dateLabel}">${day}</span>`
        );
    }

    daysGrid.innerHTML = cells.join("");
}

document.getElementById("previousMonth")?.addEventListener("click", function () {
    displayedCalendarMonth = new Date(
        displayedCalendarMonth.getFullYear(),
        displayedCalendarMonth.getMonth() - 1,
        1
    );
    renderDashboardCalendar();
});

document.getElementById("nextMonth")?.addEventListener("click", function () {
    displayedCalendarMonth = new Date(
        displayedCalendarMonth.getFullYear(),
        displayedCalendarMonth.getMonth() + 1,
        1
    );
    renderDashboardCalendar();
});

updateDashboardClock();
window.setInterval(updateDashboardClock, 1000);
renderDashboardCalendar();

function closeActionModal() {
    const modal = document.getElementById("actionModal");
    if (modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }
}

function openActionModal(action) {
    const modal = document.getElementById("actionModal");
    const content = document.getElementById("actionModalContent");

    if (!modal || !content) {
        return;
    }

    const config = {
        transfer: `
            <form class="action-form" data-action-form="transfer">
                <h3>Transfer Money</h3>
                <label for="modalRecipient">Recipient</label>
                <select id="modalRecipient" name="recipient">
                    <option>Rahul Sharma</option>
                    <option>Priya Singh</option>
                    <option>Amit Verma</option>
                    <option>Neha Gupta</option>
                </select>

                <label for="modalTransferAmount">Amount</label>
                <div class="inline-field">
                    <span>₹</span>
                    <input id="modalTransferAmount" name="amount" type="number" min="1" value="2500" />
                </div>

                <button type="submit" class="primary-btn">Send Money</button>
            </form>
        `,
        "add-money": `
            <form class="action-form" data-action-form="add-money">
                <h3>Add Money</h3>
                <label for="addMoneySource">Source</label>
                <select id="addMoneySource" name="source">
                    <option>Bank Account</option>
                    <option>UPI</option>
                    <option>Debit Card</option>
                    <option>Credit Card</option>
                </select>

                <label for="addMoneyValue">Amount</label>
                <div class="inline-field">
                    <span>₹</span>
                    <input id="addMoneyValue" name="amount" type="number" min="1" value="5000" />
                </div>

                <button type="submit" class="primary-btn">Add Funds</button>
            </form>
        `,
        "pay-bills": `
            <form class="action-form" data-action-form="pay-bills">
                <h3>Pay Bills</h3>
                <label for="billType">Bill Type</label>
                <select id="billType" name="billType">
                    <option>Internet</option>
                    <option>Electricity</option>
                    <option>Gas</option>
                    <option>Insurance</option>
                    <option>Rent</option>
                </select>

                <label for="billAmount">Amount</label>
                <div class="inline-field">
                    <span>₹</span>
                    <input id="billAmount" name="amount" type="number" min="1" value="1200" />
                </div>

                <button type="submit" class="primary-btn">Pay Now</button>
            </form>
        `,
        request: `
            <form class="action-form" data-action-form="request">
                <h3>Request Money</h3>
                <label for="requestFrom">Request From</label>
                <select id="requestFrom" name="from">
                    <option>Rahul Sharma</option>
                    <option>Priya Singh</option>
                    <option>Amit Verma</option>
                    <option>Neha Gupta</option>
                </select>

                <label for="requestAmount">Amount</label>
                <div class="inline-field">
                    <span>₹</span>
                    <input id="requestAmount" name="amount" type="number" min="1" value="2500" />
                </div>

                <button type="submit" class="primary-btn">Send Request</button>
            </form>
        `
    };

    content.innerHTML = config[action] || config.transfer;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    const form = content.querySelector("form");
    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const formType = form.dataset.actionForm;
        const amount = Number(formData.get("amount") || 0);

        if (!amount || amount <= 0) {
            showMessage("Please enter a valid amount");
            return;
        }

        if (formType === "transfer") {
            const recipient = formData.get("recipient") || "recipient";
            try {
                if (window.ManishBankDemo) {
                    window.ManishBankDemo.transferToCustomer(recipient, amount);
                } else {
                    addTransferHistoryEntry(recipient, amount);
                }
            } catch (error) {
                showMessage(error.message);
                return;
            }
            showMessage(`Transfer of ₹${amount.toLocaleString()} to ${recipient} successful`);
        } else if (formType === "add-money") {
            const source = formData.get("source") || "bank account";
            try {
                window.ManishBankDemo?.addMoneyToActive(amount, `Funds added from ${source}`);
            } catch (error) {
                showMessage(error.message);
                return;
            }
            showMessage(`Added ₹${amount.toLocaleString()} from ${source}`);
        } else if (formType === "pay-bills") {
            const billType = formData.get("billType") || "bill";
            try {
                window.ManishBankDemo?.withdrawFromActive(amount, `${billType} payment`);
            } catch (error) {
                showMessage(error.message);
                return;
            }
            showMessage(`${billType} payment of ₹${amount.toLocaleString()} completed`);
        } else if (formType === "request") {
            const requester = formData.get("from") || "contact";
            window.ManishBankDemo?.requestMoneyFrom(requester, amount);
            showMessage(`Request for ₹${amount.toLocaleString()} sent to ${requester}`);
        }

        closeActionModal();
    });
}

function addTransferHistoryEntry(recipient, amount) {
    const list = document.getElementById("transferHistoryList");
    if (!list) {
        return;
    }

    const row = document.createElement("div");
    row.className = "list-row";

    const now = new Date();
    const timeLabel = now.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });

    row.innerHTML = `
        <div>
            <strong>${recipient}</strong>
            <small>${timeLabel}</small>
        </div>
        <span class="debit">-₹${Number(amount).toLocaleString()}</span>
    `;

    list.prepend(row);
}

function updateTransferSummary() {
    const recipient = document.getElementById("recipientSelect");
    const amount = document.getElementById("transferAmount");
    const summary = document.getElementById("transferSummary");

    if (!recipient || !amount || !summary) {
        return;
    }

    const selectedRecipient = recipient.value || "Recipient";
    const amountValue = Number(amount.value || 0);

    summary.textContent = amountValue > 0
        ? `Ready to send ₹${amountValue.toLocaleString()} to ${selectedRecipient}`
        : `Select an amount to send to ${selectedRecipient}`;
}

/* Navigation */

const pagePanels = document.querySelectorAll(".page-panel");

function activatePage(page) {
    document.querySelectorAll(".nav-item").forEach(nav => {
        nav.classList.toggle("active", nav.dataset.page === page);
    });

    pagePanels.forEach(panel => {
        panel.classList.toggle("active", panel.dataset.pagePanel === page);
    });
}

const accountDetails = {
    primary: {
        name: "Primary Account",
        type: "Primary",
        balance: "₹1,24,580.50",
        availableBalance: "₹1,20,450.50",
        number: "•••• 4589"
    },
    savings: {
        name: "Savings",
        type: "Savings",
        balance: "₹65,430.00",
        availableBalance: "₹65,430.00",
        number: "•••• 2124"
    },
    investment: {
        name: "Investment",
        type: "Investment",
        balance: "₹2,15,900.00",
        availableBalance: "₹2,15,900.00",
        number: "•••• 8841"
    }
};

const investmentProfitStorageKey = "manishbank-investment-profit";
let investmentProfit = 12240;

try {
    const savedProfit = localStorage.getItem(investmentProfitStorageKey);
    if (savedProfit !== null && savedProfit.trim() !== "") {
        const parsedProfit = Number(savedProfit);
        if (Number.isFinite(parsedProfit) && parsedProfit >= 0) {
            investmentProfit = parsedProfit;
        }
    }
} catch (error) {
    console.warn("Could not load the saved investment profit.", error);
}

function formatMoney(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function updateProfitDisplays() {
    const analyticsValue = document.getElementById("analyticsProfitValue");
    const accountValue = document.getElementById("accountProfitValue");

    if (analyticsValue) {
        analyticsValue.textContent = formatMoney(investmentProfit);
    }
    if (accountValue) {
        accountValue.textContent = formatMoney(investmentProfit);
    }
    document.querySelectorAll("[data-profit-form] input[name='profit']").forEach(input => {
        input.value = investmentProfit.toFixed(2);
    });
}

document.querySelectorAll("[data-profit-edit]").forEach(button => {
    button.addEventListener("click", function () {
        const form = document.querySelector(`[data-profit-form="${this.dataset.profitEdit}"]`);
        if (!form) {
            return;
        }

        form.hidden = !form.hidden;
        if (!form.hidden) {
            const input = form.querySelector("input[name='profit']");
            input.value = investmentProfit.toFixed(2);
            input.focus();
        }
    });
});

document.querySelectorAll("[data-profit-form]").forEach(form => {
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const input = this.querySelector("input[name='profit']");
        const updatedProfit = Number(input.value);
        if (!Number.isFinite(updatedProfit) || updatedProfit < 0) {
            input.setCustomValidity("Enter a profit amount of zero or more.");
            input.reportValidity();
            return;
        }

        input.setCustomValidity("");
        investmentProfit = updatedProfit;
        updateProfitDisplays();
        this.hidden = true;

        try {
            localStorage.setItem(investmentProfitStorageKey, String(investmentProfit));
        } catch (error) {
            console.warn("Could not save the investment profit.", error);
            showMessage("Profit updated for this session, but could not be saved");
            return;
        }

        showMessage("Investment profit updated");
    });
});

function switchAccount(accountKey) {
    const details = accountDetails[accountKey];
    if (!details) {
        return;
    }

    activeAccountKey = accountKey;

    const balance = document.getElementById("balance");
    if (balance) {
        balance.textContent = balanceVisible ? details.balance : "••••••••";
    }

    document.getElementById("availableBalance").textContent = details.availableBalance;
    document.getElementById("dashboardAccountNumber").textContent = details.number;
    document.getElementById("dashboardAccountType").textContent = details.type;
    document.getElementById("currentAccountLabel").textContent = details.name;
    window.ManishBankDemo?.updateDashboard();

    document.querySelectorAll("[data-switch-account]").forEach(option => {
        option.setAttribute("aria-current", String(option.dataset.switchAccount === accountKey));
    });

    document.querySelectorAll(".account-card[data-account]").forEach(card => {
        card.setAttribute("aria-pressed", String(card.dataset.account === accountKey));
    });
}

const accountSwitchButton = document.getElementById("accountSwitchButton");
const accountSwitchMenu = document.getElementById("accountSwitchMenu");

accountSwitchButton?.addEventListener("click", function () {
    const isExpanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", String(!isExpanded));
    accountSwitchMenu.hidden = isExpanded;
});

document.querySelectorAll("[data-switch-account]").forEach(option => {
    option.addEventListener("click", function () {
        switchAccount(this.dataset.switchAccount);
        accountSwitchMenu.hidden = true;
        accountSwitchButton.setAttribute("aria-expanded", "false");
        showMessage(`${accountDetails[this.dataset.switchAccount].name} selected`);
    });
});

document.addEventListener("click", function (event) {
    if (!event.target.closest(".profile-switcher") && accountSwitchMenu) {
        accountSwitchMenu.hidden = true;
        accountSwitchButton?.setAttribute("aria-expanded", "false");
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && accountSwitchMenu && !accountSwitchMenu.hidden) {
        accountSwitchMenu.hidden = true;
        accountSwitchButton?.setAttribute("aria-expanded", "false");
        accountSwitchButton?.focus();
    }
});

switchAccount(activeAccountKey);

document.querySelectorAll(".account-card[data-account]").forEach(button => {
    button.addEventListener("click", function () {
        const details = accountDetails[this.dataset.account];
        const panel = document.getElementById("accountDetails");

        if (!details || !panel) {
            return;
        }

        switchAccount(this.dataset.account);

        document.getElementById("accountDetailsTitle").textContent = details.name;
        document.getElementById("accountDetailsType").textContent = details.type;
        const liveDetails = window.ManishBankDemo?.getAccountDetails(this.dataset.account);
        document.getElementById("accountDetailsBalance").textContent = liveDetails
            ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(liveDetails.balance)
            : details.balance;
        document.getElementById("accountDetailsNumber").textContent = liveDetails
            ? `•••• ${liveDetails.id.slice(-4)}`
            : details.number;
        panel.hidden = false;
        document.getElementById("accountProfitDetail").hidden = this.dataset.account !== "investment";
    });
});

updateProfitDisplays();

document.querySelectorAll(".nav-item").forEach(item => {

    item.addEventListener("click", function(e) {

        if (!this.classList.contains("logout")) {

            e.preventDefault();

            const page = this.dataset.page;
            activatePage(page);

            showMessage(this.textContent.trim());
        }
    });

});

document.querySelector("[data-open-security-settings]")?.addEventListener("click", function () {
    activatePage("settings");
    showMessage("Security settings opened");
});

document.querySelectorAll(".security-toggle").forEach(toggle => {
    toggle.addEventListener("click", function () {
        const enabled = this.getAttribute("aria-checked") !== "true";
        this.setAttribute("aria-checked", String(enabled));
        this.textContent = enabled ? "On" : "Off";
        showMessage(`${this.closest(".setting-row").querySelector("strong").textContent} ${enabled ? "enabled" : "disabled"}`);
    });
});

const transferForm = document.getElementById("transferForm");
const transferAmount = document.getElementById("transferAmount");
const quickAmounts = document.querySelectorAll("[data-amount]");
const actionButtons = document.querySelectorAll(".action-btn");

if (transferForm) {
    transferForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const value = Number(transferAmount.value);
        const recipient = document.getElementById("recipientSelect").value;

        if (!value || value <= 0) {
            showMessage("Please enter a valid amount");
            return;
        }

        addTransferHistoryEntry(recipient, value);
        try {
            if (window.ManishBankDemo) {
                window.ManishBankDemo.transferToCustomer(recipient, value);
            } else {
                addTransferHistoryEntry(recipient, value);
            }
        } catch (error) {
            showMessage(error.message);
            return;
        }
        showMessage(`Transfer of ₹${value.toLocaleString()} to ${recipient} successful`);
        transferAmount.value = "2500";
        updateTransferSummary();
    });
}

if (transferAmount) {
    transferAmount.addEventListener("input", updateTransferSummary);
}

document.getElementById("recipientSelect")?.addEventListener("change", updateTransferSummary);

quickAmounts.forEach(button => {
    button.addEventListener("click", function () {
        if (!transferAmount) {
            return;
        }

        transferAmount.value = this.dataset.amount;
        updateTransferSummary();
    });
});

actionButtons.forEach(button => {
    button.addEventListener("click", function () {
        openActionModal(this.dataset.action);
    });
});

document.querySelector("[data-close-modal]")?.addEventListener("click", closeActionModal);
document.getElementById("actionModal")?.addEventListener("click", function (event) {
    if (event.target === this) {
        closeActionModal();
    }
});
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeActionModal();
    }
});

updateTransferSummary();