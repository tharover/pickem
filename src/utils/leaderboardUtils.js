// 🧮 Assign ranks based on total points, with medals
export function assignRanks(users) {
  let rank = 1;
  let previousPoints = null;
  let rankCount = 0;
  const ranked = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.totalPoints !== previousPoints) {
      rank += rankCount;
      rankCount = 1;
      previousPoints = user.totalPoints;
    } else {
      rankCount++;
    }

    const medal =
      rank === 1 ? '🥇' :
      rank === 2 ? '🥈' :
      rank === 3 ? '🥉' : '';

    ranked.push({ ...user, rank, medal });
  }

  return ranked;
}

// 🎯 Calculate points for a single pick based on game results
export function calculatePoints(pick, game) {
  if (!game || !pick || !pick.pick) return 0;

  const hasResults = game.homePoints != null && game.awayPoints != null;
  if (!hasResults) return 0;

  switch (pick.pick) {
    case 'Home': return game.homePoints || 0;
    case 'Away': return game.awayPoints || 0;
    case 'Over': return game.over || 0;
    case 'Under': return game.under || 0;
    default: return 0;
  }
}

// ⏱️ Sort games by kickoff time
export function sortGamesByTime(games) {
  return Object.keys(games).sort(
    (a, b) => new Date(games[a].gameTime) - new Date(games[b].gameTime)
  );
}
