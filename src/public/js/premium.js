// premium.js
const leaderboardButton = document.getElementById("leaderboard-button");
const leaderboardSection = document.getElementById("leaderboard-section");
const leaderboardBody = document.getElementById("leaderboard-list");
const token = localStorage.getItem("token");
const rzpButton = document.getElementById("rzp-button");

leaderboardButton.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    if (leaderboardSection.style.display === "block") {
      leaderboardSection.style.display = "none";
      leaderboardButton.textContent = "Show leaderboard";
    } else {
      const response = await axios.get(
        "http://localhost:3000/premium/leaderboard",
        {
          headers: { Authorization: token },
        }
      );

      // Clear previous leaderboard data
      leaderboardBody.innerHTML = "";
      // Populate leaderboard table rows
      leaderboardBody.innerHTML = response.data
        .map((user) => {
          const total = user.total_cost ? user.total_cost : 0;
          return `<tr>
                   * Name: <td>${user.name}</td> - 
                  Total Expense: <td>${total}</td>
                </tr><br/>`;
        })
        .join("");
      leaderboardSection.style.display = "block";
      leaderboardButton.textContent = "Hide Leaderboard";
    }
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    alert("Error fetching leaderboard");
  }
});

async function hideOrNot() {
  try {
    const response = await axios.get(
      "http://localhost:3000/purchase/ispremium",
      {
        headers: { Authorization: token },
      }
    );

    if (response.data.isPremiumUser) {
      rzpButton.style.display = "none";
      leaderboardButton.style.display = "block";
      const premiumText = document.getElementById("premiumText");
      premiumText.textContent = "Thanks for being a premium user!";
      // Remove inline !important; define it in CSS if needed
      premiumText.style.fontWeight = "bold";
    }
  } catch (err) {
    console.error("Error checking premium status:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  hideOrNot();
});
