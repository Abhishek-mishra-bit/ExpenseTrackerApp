const formE1 = document.getElementById("expense-form");
const baseUrl = window.location.origin;

async function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(formE1);
  const expense = {};
  formData.forEach((value, key) => {
    expense[key] = value;
  });
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `${baseUrl}/userexpense/expensesData`,
      expense,
      {
        headers: { Authorization: token },
      }
    );

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: '#198754',
      color: '#fff',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

      Toast.fire({
        icon: 'success',
        title: 'Expense added'
      });


    formE1.reset();
    loadFullReport(); // Refresh the report to show the new expense
  } catch (err) {
    console.error("Error adding expense:", err);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to add expense. Please try again.',
      confirmButtonColor: '#dc3545'
    });
  }
}

function filterReportChanged() {
  const filterValue = document.getElementById("timeFilter").value;
  if (filterValue === "custom") {
    document.getElementById("customDateFilter").style.display = "flex";
  } else {
    document.getElementById("customDateFilter").style.display = "none";
    loadFullReport(1, filterValue);
  }
}

function setExpensesLimit() {
  const limitValue = document.getElementById("expensesLimit").value;
  localStorage.setItem("expensesLimit", limitValue);
  const currentFilter = document.getElementById("timeFilter").value || "all";
  loadFullReport(1, currentFilter);
}

async function loadFullReport(page = 1, filter = "all") {
  const limit = parseInt(localStorage.getItem("expensesLimit")) || 10;
  let url = `${baseUrl}/userexpense/expenses/paginated?page=${page}&row=${limit}&filter=${filter}`;

  if (filter === "custom") {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    if (!fromDate || !toDate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Dates',
        text: 'Please select both From and To dates',
        confirmButtonColor: '#ffc107',
      });
      return;
    }
    url += `&from=${fromDate}&to=${toDate}`;
  }

  try {
    const response = await axios.get(url, {
      headers: { Authorization: localStorage.getItem("token") },
    });

    const { expenses, currentPage, totalPages } = response.data;

    const expenseTableBody = document.getElementById("expense-table-body");
    expenseTableBody.innerHTML = "";

    let index = (currentPage - 1) * limit;
    expenses.forEach((item) => {
      index++;
      const dateObj = new Date(item.createdAt);
      const formattedDate = dateObj.toLocaleDateString("en-GB");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index}</td>
        <td>${item.amount}</td>
        <td>${item.description}</td>
        <td>${item.category}</td>
        <td>${formattedDate}</td>
        <td><button onclick="deleteReport('${item._id}', ${currentPage}, '${filter}')" class="btn btn-sm btn-danger">Delete</button></td>
      `;
      expenseTableBody.appendChild(row);
    });

    updateReportPaginationControls(currentPage, totalPages, filter);
  } catch (err) {
    console.error("Error loading report:", err);
    await Swal.fire({
      icon: 'error',
      title: 'Error Loading Report',
      text: 'Failed to load expenses. Please try again.',
      confirmButtonColor: '#dc3545',
    });
  }
}

function updateReportPaginationControls(currentPage, totalPages, filter) {
  const reportPagination = document.getElementById(
    "report-pagination-controls"
  );
  reportPagination.innerHTML = "";

  if (totalPages <= 1) return;

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.className = "btn btn-outline-secondary btn-sm";
    prevButton.innerText = "Previous";
    prevButton.onclick = () => loadFullReport(currentPage - 1, filter);
    reportPagination.appendChild(prevButton);
  }

  const pageInfo = document.createElement("span");
  pageInfo.className = "mx-3 align-self-center";
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
  reportPagination.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.className = "btn btn-outline-secondary btn-sm";
    nextButton.innerText = "Next";
    nextButton.onclick = () => loadFullReport(currentPage + 1, filter);
    reportPagination.appendChild(nextButton);
  }
}

async function showReport(event) {
  event.preventDefault();
  loadFullReport(1, "all");
  const modal = new bootstrap.Modal(
    document.getElementById("expenseReportModal")
  );
  modal.show();
}

async function deleteReport(id, currentPage, filter) {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      await axios.delete(`${baseUrl}/userexpense/expenses/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Expense has been deleted.',
        showConfirmButton: false,
        timer: 1500,
      });
      let limit = parseInt(localStorage.getItem("expensesLimit")) || 10;
        const response = await axios.get(`${baseUrl}/userexpense/expenses/paginated?page=${currentPage}&row=${limit}&filter=${filter}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      const items = response.data.expenses || [];
      const totalCount = response.data.totalCount || 0;
      const totalPages = Math.ceil(totalCount / limit);
      if (items.length === 0 && currentPage > 1) {
          loadFullReport(currentPage - 1, filter);
      } else {
          loadFullReport(currentPage, filter);
      }
    }
  } catch (err) {
    console.error("Error deleting expense:", err);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to delete expense. Please try again.',
      confirmButtonColor: '#dc3545',
    });
  }
}

async function download() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}/userexpense/expenses/download`, {
      headers: { Authorization: token }
    });

    if (response.status === 200 && response.data.expenses && response.data.expenses.length > 0) {
      const csvData = response.data.expenses.map((item) => {
        const date = new Date(item.createdAt).toLocaleDateString("en-GB");
        return `"${item.amount}","${item.description}","${item.category}","${date}"`;
      });

      const csvHeader = "Amount,Description,Category,Date\n";
      const blob = new Blob([csvHeader + csvData.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await Swal.fire({
        icon: 'success',
        title: 'Download Started',
        text: 'Your expense report is being downloaded.',
        timer: 2000,
      });
    } else {
      await Swal.fire({
        icon: 'info',
        title: 'No Expenses',
        text: 'No expenses found to download.',
      });
    }
  } catch (err) {
    console.error("Error downloading expenses:", err);
    await Swal.fire({
      icon: 'error',
      title: 'Download Failed',
      text: 'Failed to download expenses. Please try again.',
    });
  }
}

function confirmLogout() {
  Swal.fire({
    title: 'Are you sure?',
    text: "You will be logged out.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, logout'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('token');
      window.location.href = '/user/login';
    }
  });
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode');
  const isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

async function updateUserStatus() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await axios.get(`${baseUrl}/user/user/status`, {
            headers: { Authorization: token },
        });

        const { name, isPremium } = response.data;
        const greetingEl = document.getElementById('user-greeting');
        const actionsEl = document.getElementById('premium-actions');

        // Clear previous content to prevent duplicate buttons
        greetingEl.innerHTML = '';
        actionsEl.innerHTML = '';

        greetingEl.innerHTML = `Welcome, <strong>${name}</strong>`;

        if (isPremium) {
            greetingEl.innerHTML += `<span class="badge bg-warning text-dark ms-2">Premium</span>`;
            
            const themeButton = document.createElement('button');
            themeButton.className = 'btn btn-sm btn-outline-secondary';
            themeButton.innerHTML = '<i class="fas fa-moon"></i> Theme';
            themeButton.onclick = toggleTheme;
            actionsEl.appendChild(themeButton);

            document.getElementById('leaderboard-button').style.display = 'block';
            document.getElementById('download-expense').style.display = 'block';
        } else {
            const upgradeButton = document.createElement('button');
            upgradeButton.className = 'btn btn-sm btn-primary';
            upgradeButton.id = 'rzp-button';
            upgradeButton.innerHTML = '<i class="fas fa-arrow-up me-1"></i> Upgrade';
            actionsEl.appendChild(upgradeButton);
            
            // Attach the listener now that the button exists
            attachPurchaseListener();
        }
    } catch (error) {
        console.error("Failed to fetch user status", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    await Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: "For your security, you've been signed out. You can log in again anytime.",
      confirmButtonColor: '#ffc107',
      confirmButtonText: 'Go to Login',
      allowOutsideClick: false
    }).then(() => {
      window.location.href = `${baseUrl}/user/login`;
    });
    return;
  }
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  }

  updateUserStatus();
});