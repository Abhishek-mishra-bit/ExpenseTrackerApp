const baseUrl = window.location.origin;

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'You will be logged out from the application.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, logout!'
  });

  if (result.isConfirmed) {
    localStorage.removeItem('token');
    localStorage.removeItem('isPremium');
    window.location.href = `${baseUrl}/user/login`;
  }
});

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    await Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: "For your security, you've been signed out. Please login again.",
      confirmButtonColor: '#ffc107',
      confirmButtonText: 'Go to Login',
      allowOutsideClick: false
    }).then(() => {
      window.location.href = `${baseUrl}/user/login`;
    });
    return;
  }

  // Check premium status and update UI
  const isPremium = localStorage.getItem('isPremium') === 'true';
  if (isPremium) {
    document.getElementById('premiumText').innerHTML = `
      <span class="badge bg-success fs-6">
        <i class="fas fa-crown me-2"></i>Premium User
      </span>
    `;
    document.getElementById('leaderboard-button').style.display = 'block';
    document.getElementById('download-expense').style.display = 'block';
  }
});