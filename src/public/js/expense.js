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
    
    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Expense added successfully',
      confirmButtonColor: '#0d6efd',
      timer: 2000,
      timerProgressBar: true
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
    document.getElementById("customDateFilter").style.display = "block";
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

function updateReportPaginationControls(currentPage, totalPages, filter) {
  const reportPagination = document.getElementById(
    "report-pagination-controls"
  );
  reportPagination.innerHTML = "";

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.className = "btn btn-secondary";
    prevButton.innerText = "Previous";
    prevButton.onclick = () => loadFullReport(currentPage - 1, filter);
    reportPagination.appendChild(prevButton);
  }

  const pageInfo = document.createElement("span");
  pageInfo.className = "mx-2";
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
  reportPagination.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.className = "btn btn-secondary";
    nextButton.innerText = "Next";
    nextButton.onclick = () => loadFullReport(currentPage + 1, filter);
    reportPagination.appendChild(nextButton);
  }
}

async function loadFullReport(page = 1, filter = "all") {
  const limit = parseInt(localStorage.getItem("expensesLimit")) || 5;
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
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true
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
        <td><button onclick="deleteReport('${item._id}', ${currentPage}, '${filter}')" class="btn btn-danger">Delete</button></td>
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
      timer: 3000,
      timerProgressBar: true
    });
  }
}

function updateReportPaginationControls(currentPage, totalPages, filter) {
  const reportPagination = document.getElementById("report-pagination-controls");
  reportPagination.innerHTML = "";

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.className = "btn btn-secondary";
    prevButton.innerText = "Previous";
    prevButton.onclick = () => loadFullReport(currentPage - 1, filter);
    reportPagination.appendChild(prevButton);
  }

  const pageInfo = document.createElement("span");
  pageInfo.className = "mx-2";
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
  reportPagination.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.className = "btn btn-secondary";
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
  console.log("Deleting expense with ID:", id);
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
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
        timerProgressBar: true
      });
      
      loadFullReport(currentPage, filter);
    }
  } catch (err) {
    console.error("Error deleting expense:", err);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to delete expense. Please try again.',
      confirmButtonColor: '#dc3545',
      timer: 3000,
      timerProgressBar: true
    });
  }
}


async function download() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}/userexpense/expenses/download`, {
      headers: { Authorization: token }
    });

    if (response.status === 200 && response.data.expenses) {
      const csvData = response.data.expenses.map((item) => {
        const date = new Date(item.createdAt).toLocaleDateString("en-GB");
        return `${item.amount},${item.description},${item.category},${date}`;
      });

      const csvHeader = "Amount,Description,Category,Date\n";
      const blob = new Blob([csvHeader + csvData.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses.csv";
      a.click();
      URL.revokeObjectURL(url);

      await Swal.fire({
        icon: 'success',
        title: 'Download Started',
        text: 'Your expense report is being downloaded.',
        confirmButtonColor: '#198754',
        timer: 2000,
        timerProgressBar: true
      });
    } else {
      await Swal.fire({
        icon: 'info',
        title: 'No Expenses',
        text: 'No expenses found to download.',
        confirmButtonColor: '#0dcaf0'
      });
    }
  } catch (err) {
    console.error("Error downloading expenses:", err);
    await Swal.fire({
      icon: 'error',
      title: 'Download Failed',
      text: 'Failed to download expenses. Please try again.',
      confirmButtonColor: '#dc3545'
    });
  }
}




// async function loadDownloadHistory() {
//   try {
//     const response = await axios.get(
//       `${baseUrl}/userexpense/expenses/download-history`,
//       { headers: { Authorization: localStorage.getItem("token") } }
//     );
//     const historyContainer = document.getElementById("download-history");
//     historyContainer.innerHTML = "";
//     response.data.forEach((item, index) => {
//       const row = document.createElement("tr");
//       row.innerHTML = `
//         <td>${index + 1}</td>
//         <td>${new Date(item.createdAt).toLocaleString()}</td>
//         <td><a href="${item.fileUrl}" target="_blank" class="btn btn-primary">Download</a></td>
//       `;
//       historyContainer.appendChild(row);
//     });
//   } catch (error) {
//     console.error("Error fetching download history:", error);
//   }
// }

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
  document
    .getElementById("timeFilter")
    .addEventListener("change", filterReportChanged);
  document });

