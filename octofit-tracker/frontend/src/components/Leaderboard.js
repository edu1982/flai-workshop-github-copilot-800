import React, { useState, useEffect } from 'react';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const codespace = process.env.REACT_APP_CODESPACE_NAME;
        const apiUrl = codespace 
          ? `https://${codespace}-8000.app.github.dev/api/leaderboard/`
          : 'http://localhost:8000/api/leaderboard/';
        
        console.log('Fetching leaderboard from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Leaderboard data received:', data);
        
        // Handle both paginated (.results) and plain array responses
        const leaderboardData = data.results || data;
        setLeaderboard(leaderboardData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="container mt-4">Loading leaderboard...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h2>🏆 Leaderboard</h2>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User Name</th>
              <th>Team</th>
              <th>Total Activities</th>
              <th>Total Calories</th>
              <th>Total Distance (km)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.id || index} className={entry.rank <= 3 ? 'table-warning' : ''}>
                <td>
                  <strong>
                    {entry.rank === 1 && '🥇 '}
                    {entry.rank === 2 && '🥈 '}
                    {entry.rank === 3 && '🥉 '}
                    {entry.rank}
                  </strong>
                </td>
                <td>{entry.user_name}</td>
                <td><span className="badge bg-primary">{entry.team_name}</span></td>
                <td>{entry.total_activities}</td>
                <td>{entry.total_calories.toLocaleString()}</td>
                <td>{entry.total_distance ? entry.total_distance.toFixed(2) : '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="alert alert-success" role="alert">
        <strong>👥 Total participants:</strong> {leaderboard.length}
      </div>
    </div>
  );
}

export default Leaderboard;
