import React, { useState, useEffect } from 'react';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const codespace = process.env.REACT_APP_CODESPACE_NAME;
        const apiUrl = codespace 
          ? `https://${codespace}-8000.app.github.dev/api/workouts/`
          : 'http://localhost:8000/api/workouts/';
        
        console.log('Fetching workouts from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Workouts data received:', data);
        
        // Handle both paginated (.results) and plain array responses
        const workoutsData = data.results || data;
        setWorkouts(workoutsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-success';
      case 'intermediate':
        return 'bg-warning';
      case 'advanced':
        return 'bg-danger';
      case 'expert':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) return <div className="container mt-4">Loading workouts...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h2>💪 Workouts</h2>
      </div>
      <div className="row">
        {workouts.map((workout, index) => (
          <div key={workout.id || index} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">{workout.name}</h5>
                <span className={`badge ${getDifficultyBadgeClass(workout.difficulty_level)}`}>
                  {workout.difficulty_level}
                </span>
                <span className="badge bg-info ms-2">{workout.category}</span>
              </div>
              <div className="card-body">
                <p className="card-text">{workout.description}</p>
                <ul className="list-unstyled">
                  <li><strong>Duration:</strong> {workout.estimated_duration} minutes</li>
                  <li><strong>Calories:</strong> ~{workout.estimated_calories} kcal</li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="alert alert-warning" role="alert">
        <strong>💪 Total workouts:</strong> {workouts.length}
      </div>
    </div>
  );
}

export default Workouts;
