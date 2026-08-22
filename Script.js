lucide.createIcons();

let balanceVisible = true;

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function toggleBalance() {

    const balance = document.getElementById("balance");

    if (balanceVisible) {
        balance.textContent = "••••••••";
        balanceVisible = false;
    } else {
        balance.textContent = "₹1,24,580.50";
        balanceVisible = true;
    }
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

function logout() {

    event.preventDefault();

    showMessage("Logout functionality triggered");
}


/* Navigation */

document.querySelectorAll(".nav-item").forEach(item => {

    item.addEventListener("click", function(e) {

        if (!this.classList.contains("logout")) {

            e.preventDefault();

            document.querySelectorAll(".nav-item")
                .forEach(nav => nav.classList.remove("active"));

            this.classList.add("active");

            showMessage(this.textContent.trim());
        }
    });

});