// App.js
import React, { useState } from 'react';
import './App.css';

// Load users from localStorage or use default ones
const initialUsers = localStorage.getItem('users')
  ? JSON.parse(localStorage.getItem('users'))
  : [
      { username: 'admin', password: 'admin123', type: 'admin' },
      { username: 'rushirupesh', password: '1234', type: 'user' },
    ];

function App() {
  const [users, setUsers] = useState(initialUsers); // Manage users in state
  const [view, setView] = useState('login'); // login, signup, predictor, dashboard
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [signupData, setSignupData] = useState({ username: '', password: '', type: 'user' });
  const [loginHistory, setLoginHistory] = useState(
    localStorage.getItem('loginHistory') ? JSON.parse(localStorage.getItem('loginHistory')) : []
  );
  const [predictionHistory, setPredictionHistory] = useState(
    localStorage.getItem('predictionHistory') ? JSON.parse(localStorage.getItem('predictionHistory')) : []
  );
  const [predictForm, setPredictForm] = useState({
    pregnancies: '', glucose: '', bloodPressure: '', skinThickness: '', insulin: '',
    bmi: '', diabetesPedigreeFunction: '', age: ''
  });
  const [result, setResult] = useState('');
  const [confidence, setConfidence] = useState(null);

  const handleLogin = () => {
    console.log('Attempting login...');
    console.log('formData:', formData);
    console.log('userType:', userType);
    console.log('users array:', users);
    const user = users.find(
      (u) => u.username === formData.username && u.password === formData.password && u.type === userType
    );
    if (user) {
      if (userType === 'admin') setView('dashboard');
      else {
        setLoginHistory((prev) => [...prev, { username: formData.username, time: new Date().toLocaleString() }]);
        localStorage.setItem('loginHistory', JSON.stringify([...loginHistory, { username: formData.username, time: new Date().toLocaleString() }]));
        setView('predictor');
      }
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setView('login');
    setFormData({ username: '', password: '' });
    setPredictForm({
      pregnancies: '', glucose: '', bloodPressure: '', skinThickness: '', insulin: '',
      bmi: '', diabetesPedigreeFunction: '', age: ''
    });
    setResult('');
    setConfidence(null);
  };

  const handleSignup = () => {
    const updatedUsers = [...users, signupData];
    setUsers(updatedUsers); // Update state
    localStorage.setItem('users', JSON.stringify(updatedUsers)); // Save to localStorage
    alert('Signup successful');
    setView('login');
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    // Validate for negative values
    for (const key in predictForm) {
      if (predictForm.hasOwnProperty(key)) {
        const value = parseFloat(predictForm[key]);
        if (isNaN(value) || value < 0) {
          alert(`Negative or invalid value entered for ${key.replace(/([A-Z])/g, ' $1').trim()}. Please enter a non-negative number.`);
          return; // Stop the function if validation fails
        }
      }
    }

    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(predictForm),
    });
    const data = await response.json();
    if (data.prediction !== undefined) {
      setResult(data.prediction === 1 ? 'High risk of disease' : 'Low risk of disease');
      setConfidence(`${data.confidence}%`);
      setPredictionHistory((prev) => [
        ...prev,
        { username: formData.username, result: data.prediction === 1 ? 'High risk' : 'Low risk', confidence: `${data.confidence}%`, time: new Date().toLocaleString() }
      ]);
      localStorage.setItem('predictionHistory', JSON.stringify([
        ...predictionHistory,
        { username: formData.username, result: data.prediction === 1 ? 'High risk' : 'Low risk', confidence: `${data.confidence}%`, time: new Date().toLocaleString() }
      ]));
    }
  };

  return (
    <div className="app">
      {view === 'login' && (
        <div className="login-card">
          <div className="toggle-btns">
            <button className={userType === 'user' ? 'active' : ''} onClick={() => setUserType('user')}>User Login</button>
            <button className={userType === 'admin' ? 'active' : ''} onClick={() => setUserType('admin')}>Admin Login</button>
          </div>
          <h2>{userType === 'admin' ? 'Admin Login' : 'User Login'}</h2>
          <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <button onClick={handleLogin}>Login</button>
          <p>Don't have an account? <span onClick={() => setView('signup')} className="link">Register here</span></p>
        </div>
      )}

      {view === 'signup' && (
        <div className="login-card">
          <h2>Sign Up</h2>
          <input type="text" placeholder="Username" value={signupData.username} onChange={(e) => setSignupData({ ...signupData, username: e.target.value })} />
          <input type="password" placeholder="Password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
          <select value={signupData.type} onChange={(e) => setSignupData({ ...signupData, type: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleSignup}>Sign Up</button>
          <p>Already have an account? <span onClick={() => setView('login')} className="link">Login here</span></p>
        </div>
      )}

      {view === 'predictor' && (
        <div className="predictor">
          <h1>Disease Predictor</h1>
          <form onSubmit={handlePredict}>
            {Object.entries(predictForm).map(([key, val]) => (
              <div className="input-group" key={key}>
                <label>{key.replace(/([A-Z])/g, ' $1').trim()}:</label>
                <input
                  type="number"
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim()} (e.g., ${key === 'pregnancies' ? '0-17' : key === 'glucose' ? '0-199' : key === 'bloodPressure' ? '0-122' : key === 'skinThickness' ? '0-99' : key === 'insulin' ? '0-846' : key === 'bmi' ? '0-67.1' : key === 'diabetesPedigreeFunction' ? '0.078-2.42' : key === 'age' ? '21-81' : ''})`}
                  value={val}
                  onChange={(e) => setPredictForm({ ...predictForm, [key]: e.target.value })}
                  required
                  min="0"
                />
              </div>
            ))}
            <button type="submit">Predict</button>
          </form>
          {result && (
            <div className="result">
              <p>{result}</p>
              <p>Confidence: {confidence}</p>
            </div>
          )}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="dashboard">
          <h2>Admin Dashboard</h2>
          <table>
            <thead>
              <tr><th>User</th><th>Login Time</th></tr>
            </thead>
            <tbody>
              {loginHistory.map((log, i) => (
                <tr key={i}><td>{log.username}</td><td>{log.time}</td></tr>
              ))}
            </tbody>
          </table>
          <h3>Prediction History</h3>
          <table>
            <thead>
              <tr><th>User</th><th>Result</th><th>Confidence</th><th>Time</th></tr>
            </thead>
            <tbody>
              {predictionHistory.map((prediction, i) => (
                <tr key={i}><td>{prediction.username}</td><td>{prediction.result}</td><td>{prediction.confidence}</td><td>{prediction.time}</td></tr>
              ))}
            </tbody>
          </table>
          <h3>Prediction Summary Graph</h3>
          <div className="prediction-graph">
            <div className="graph-bar high-risk-bar" style={{ width: `${predictionHistory.filter(p => p.result === 'High risk').length * 30}px` }}>
              {predictionHistory.filter(p => p.result === 'High risk').length} High Risk
            </div>
            <div className="graph-bar low-risk-bar" style={{ width: `${predictionHistory.filter(p => p.result === 'Low risk').length * 30}px` }}>
              {predictionHistory.filter(p => p.result === 'Low risk').length} Low Risk
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;

























