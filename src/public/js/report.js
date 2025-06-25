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
        confirmButtonColor: '#ffc107'
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
        <td>₹${item.amount}</td>
        <td>${item.description}</td>
        <td><span class="badge bg-primary">${item.category}</span></td>
        <td>${formattedDate}</td>
        <td>
          <button onclick="deleteReport('${item._id}', ${currentPage}, '${filter}')" 
                  class="btn btn-sm btn-danger">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
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
      confirmButtonColor: '#dc3545'
    });
  }
}

function updateReportPaginationControls(currentPage, totalPages, filter) {
  const reportPagination = document.getElementById("report-pagination-controls");
  reportPagination.innerHTML = "";

  if (totalPages > 1) {
    const pagination = document.createElement("ul");
    pagination.className = "pagination justify-content-center";

    // Previous button
    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
      <a class="page-link" href="#" onclick="loadFullReport(${currentPage - 1}, '${filter}')">
        &laquo; Previous
      </a>
    `;
    pagination.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageLi = document.createElement("li");
      pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageLi.innerHTML = `
        <a class="page-link" href="#" onclick="loadFullReport(${i}, '${filter}')">${i}</a>
      `;
      pagination.appendChild(pageLi);
    }

    // Next button
    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
      <a class="page-link" href="#" onclick="loadFullReport(${currentPage + 1}, '${filter}')">
        Next &raquo;
      </a>
    `;
    pagination.appendChild(nextLi);

    reportPagination.appendChild(pagination);
  }
}

async function showReport(event) {
  event.preventDefault();
  loadFullReport(1, "all");
  const modal = new bootstrap.Modal(document.getElementById("expenseReportModal"));
  modal.show();
}

async function deleteReport(id, currentPage, filter) {
  try {
    const result = await Swal.fire({
      title: 'Delete Expense?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
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
        timer: 1500
      });
      
      loadFullReport(currentPage, filter);
    }
  } catch (err) {
    console.error("Error deleting expense:", err);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to delete expense. Please try again.',
      confirmButtonColor: '#dc3545'
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
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      await Swal.fire({
        icon: 'success',
        title: 'Download Started',
        text: 'Your expense report is being downloaded.',
        confirmButtonColor: '#198754',
        timer: 2000
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