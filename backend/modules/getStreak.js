const User = require("../models/User");

// check if two dates fall on the same calendar day
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

async function getStreak(username) {
  const user = await User.findOne({ username });

  if (!user || !user.dailySets || user.dailySets.length === 0) {
    return 0;
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // sort sets by date descending (latest first)
  const sortedSets = user.dailySets.sort((a, b) => b.date - a.date);

  const todaySet = sortedSets.find(set => isSameDay(set.date, today));
  const yesterdaySet = sortedSets.find(set => isSameDay(set.date, yesterday));

  const solvedToday =
    todaySet &&
    todaySet.problems &&
    todaySet.problems.some(p => p.isSolved);

  const solvedYesterday =
    yesterdaySet &&
    yesterdaySet.problems &&
    yesterdaySet.problems.some(p => p.isSolved);

  let newStreak = 0;

  if (solvedToday) {
    newStreak = solvedYesterday ? (user.streak || 0) + 1 : 1;
  }

  user.streak = newStreak;
  await user.save();

  return newStreak;
}

module.exports = getStreak;
