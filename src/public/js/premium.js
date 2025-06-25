// premium.js
const leaderboardButton = document.getElementById("leaderboard-button");
const leaderboardSection = document.getElementById("leaderboard-section");
const leaderboardBody = document.getElementById("leaderboard-list");
const token = localStorage.getItem("token");
const rzpButton = document.getElementById("rzp-button");
const downloadExpense = document.getElementById("download-expense");


leaderboardButton.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    if (leaderboardSection.style.display === "block") {
      leaderboardSection.style.display = "none";
      leaderboardButton.textContent = "Show leaderboard";
    } else {
      const response = await axios.get(
        `${baseUrl}/premium/leaderboard`,
        {
          headers: { Authorization: token },
        }
      );

      // Clear previous leaderboard data
      leaderboardBody.innerHTML = "";
      // Populate leaderboard table rows
      leaderboardBody.innerHTML = response.data
        .map((user) => {
          const total = user.totalExpenses ? user.totalExpenses : 0;
          return `<tr>
                   * Name: <td>${user.name}</td> - 
                  Total Expense: <td>${total}</td>
                </tr><br/>`;
        })
        .join("");
      leaderboardSection.style.display = "block";
    }
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    alert("Error fetching leaderboard");
  }
});

async function hideOrNot() {
  try {
    const response = await axios.get( 
      `${baseUrl}/purchase/ispremium`,
      {
        headers: { Authorization: token },
      }
    );

    if (response.data.isPremiumUser) {
      rzpButton.style.display = "none";
      leaderboardButton.style.display = "block";
      downloadExpense.style.display = "block";
      updatePremiumStatus(true);
    } 
  } catch (err) {
    console.error("Error checking premium status:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  hideOrNot();
});

function updatePremiumStatus(isPremium) {
  const premiumCard = document.getElementById('premium-status-card');
  const title = document.getElementById('premium-status-title');
  const text = document.getElementById('premium-status-text');
  const upgradeBtn = document.getElementById('rzp-button');
  const progressSection = document.getElementById('premium-features-progress');
  
  if (isPremium) {
    document.body.classList.add('premium-active');
    title.textContent = 'Premium Member';
    text.innerHTML = '<span class="text-success">Thanks for being a premium user!</span>';
    upgradeBtn.style.display = 'none';
    progressSection.style.display = 'block';
    
    // Add shimmer effect to the card
    premiumCard.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.3)';
  } else {
    document.body.classList.remove('premium-active');
    title.textContent = 'Premium Status';
    text.textContent = 'Unlock premium features';
    upgradeBtn.style.display = 'block';
    progressSection.style.display = 'none';
    premiumCard.style.boxShadow = '';
  }
}



// Leaderboard button click
leaderboardButton.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    const response = await axios.get(`${baseUrl}/premium/leaderboard`, {
      headers: { Authorization: token },
    });

    // Clear existing leaderboard
    leaderboardBody.innerHTML = "";

    // Populate with updated data
    leaderboardBody.innerHTML = response.data
      .map((user, index) => {
        const total = user.totalExpenses || 0;
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${total}</td>
          </tr>
        `;
      })
      .join("");

    // Show modal using Bootstrap
    const modal = new bootstrap.Modal(leaderboardSection);
    modal.show();

  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    alert("Error fetching leaderboard. Please try again later.");
  }
});


