"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  institution: string;
  points: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then(setLeaderboard);
  }, []);

  return (
    <div>
      <h1>Leaderboard by University</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>University</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={entry.institution}>
              <td>{index + 1}</td>
              <td>{entry.institution}</td>
              <td>{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
