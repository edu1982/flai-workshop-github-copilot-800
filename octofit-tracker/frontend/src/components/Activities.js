import React, { useState, useEffect } from 'react';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const codespace = process.env.REACT_APP_CODESPACE_NAME;
        const apiUrl = codespace 
          ? `https://${codespace}-8000.app.github.dev/api/activities/`
          : 'http://localhost:8000/api/activities/';
        
        console.log('Fetching activities from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Activities data received:', data);
        
        // Handle both paginated (.results) and plain array responses
        const activitiesData = data.results || data;
        setActivities(activitiesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <div className="container mt-4">Loading activities...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h2>🏃 Activities</h2>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Activity Type</th>
              <th>Duration (min)</th>
              <th>Calories Burned</th>
              <th>Distance (km)</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={activity.id || index}>
                <td>{activity.activity_type}</td>
                <td>{activity.duration}</td>
                <td>{activity.calories_burned}</td>
                <td>{activity.distance ? activity.distance.toFixed(2) : 'N/A'}</td>
                <td>{new Date(activity.date).toLocaleDateString()}</td>
                <td>{activity.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="alert alert-info" role="alert">
        <strong>📊 Total activities:</strong> {activities.length}
      </div>
    </div>
  );
}

export default Activities;
