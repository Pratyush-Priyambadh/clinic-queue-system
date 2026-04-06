import React, { useState, useEffect } from 'react';
import './App.css';

// Doctor data
const doctors = [
  { id: 1, name: "Dr. Sharma (Cardiology)", maxPatients: 5 },
  { id: 2, name: "Dr. Mehta (Neurology)", maxPatients: 5 },
  { id: 3, name: "Dr. Singh (Orthopedics)", maxPatients: 5 },
  { id: 4, name: "Dr. Rao (Dermatology)", maxPatients: 5 },
  { id: 5, name: "Dr. Khan (General Physician)", maxPatients: 5 }
];

function App() {
  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [queue, setQueue] = useState([]);
  const [treatedHistory, setTreatedHistory] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('history');

  // Sample initial data
  useEffect(() => {
    setQueue([
      { qno: 1, name: "Emily Clark", sym: "Chest pain and difficulty breathing", docId: 1, priority: "High", bookedTime: "10:15 AM", bookingDate: new Date().toLocaleDateString() },
      { qno: 2, name: "Michael Brown", sym: "Severe headache", docId: 2, priority: "Normal", bookedTime: "10:45 AM", bookingDate: new Date().toLocaleDateString() }
    ]);
    setTreatedHistory([
      { id: 1, name: "Jessica Williams", sym: "Annual physical examination", doctor: "Dr. Khan (General Physician)", priority: "Normal", time: new Date().toLocaleString() }
    ]);
  }, []);

  // Helper functions
  const showNotification = (msg, type = 'success') => {
    alert(msg);
  };

  const updateQueueNumbers = (updatedQueue) => {
    return updatedQueue.map((p, idx) => ({ ...p, qno: idx + 1 }));
  };

  // Patient books appointment
  const bookAppointment = (name, symptoms, docId, priority) => {
    const doctor = doctors.find(d => d.id === parseInt(docId));
    const queueCount = queue.filter(q => q.docId === parseInt(docId)).length;
    
    if (queueCount >= doctor.maxPatients) {
      alert(`${doctor.name} queue is full!`);
      return false;
    }
    
    const newPatient = {
      qno: queue.length + 1,
      name: name,
      sym: symptoms,
      docId: parseInt(docId),
      priority: priority,
      bookedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bookingDate: new Date().toLocaleDateString()
    };
    
    let newQueue = [...queue, newPatient];
    // Sort high priority first
    newQueue.sort((a, b) => {
      if (a.priority === 'High' && b.priority !== 'High') return -1;
      if (a.priority !== 'High' && b.priority === 'High') return 1;
      return a.qno - b.qno;
    });
    newQueue = updateQueueNumbers(newQueue);
    setQueue(newQueue);
    showNotification(`✅ Appointment booked! Queue #${newQueue[newQueue.length-1].qno}`);
    return true;
  };

  // Nurse admits patient
  const admitPatient = (index) => {
    const patient = queue[index];
    const newQueue = queue.filter((_, i) => i !== index);
    const updatedQueue = updateQueueNumbers(newQueue);
    setQueue(updatedQueue);
    
    setTreatedHistory([
      {
        id: Date.now(),
        name: patient.name,
        sym: patient.sym,
        doctor: doctors.find(d => d.id === patient.docId)?.name,
        priority: patient.priority,
        time: new Date().toLocaleString(),
        bookedTime: patient.bookedTime
      },
      ...treatedHistory
    ]);
    
    showNotification(`✅ ${patient.name} admitted. Now visible in Doctor's history.`);
  };

  // Nurse cancels appointment
  const cancelAppointment = (index) => {
    if (window.confirm("Cancel this appointment?")) {
      const newQueue = queue.filter((_, i) => i !== index);
      setQueue(updateQueueNumbers(newQueue));
      showNotification("Appointment cancelled", 'error');
    }
  };

  // Doctor schedules follow-up
  const scheduleFollowup = (patient, date, reason) => {
    const newFollowup = {
      id: Date.now(),
      patientName: patient.name,
      doctor: patient.doctor,
      reason: reason,
      date: new Date(date).toLocaleDateString(),
      scheduledDate: new Date().toLocaleString()
    };
    setFollowups([...followups, newFollowup]);
    showNotification(`📅 Follow-up scheduled for ${patient.name}`);
  };

  // Complete follow-up
  const completeFollowup = (id) => {
    setFollowups(followups.filter(f => f.id !== id));
    showNotification("Follow-up completed");
  };

  // Delete follow-up
  const deleteFollowup = (id) => {
    if (window.confirm("Cancel this follow-up?")) {
      setFollowups(followups.filter(f => f.id !== id));
      showNotification("Follow-up cancelled", 'error');
    }
  };

  // Auth handlers
  const handleLogin = (username, password) => {
    if (username === 'doctor') {
      setRole('doctor');
      setIsAuthenticated(true);
    } else if (username === 'nurse') {
      setRole('nurse');
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials. Use 'doctor' or 'nurse'");
    }
  };

  const handlePatientGuest = () => {
    setRole('patient');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
  };

  // Render authentication screen
  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-icon">🏥</div>
          <h1>Clinic Q-</h1>
          <p>smart queue · seamless care</p>
          <input type="text" id="username" className="auth-input" placeholder="Username (doctor / nurse)" />
          <input type="password" id="password" className="auth-input" placeholder="Password" />
          <button className="btn-primary" onClick={() => {
            const user = document.getElementById('username').value;
            const pwd = document.getElementById('password').value;
            handleLogin(user, pwd);
          }}>🔐 Staff Login</button>
          <div className="divider">or</div>
          <button className="btn-outline" onClick={handlePatientGuest}>🩺 Continue as Patient</button>
        </div>
      </div>
    );
  }

  // Patient Dashboard
  if (role === 'patient') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="logo"><h1>Clinic <span>Q-</span> ⚕️</h1></div>
          <div className="role-badge">🧑‍⚕️ Patient Mode</div>
          <button className="logout-btn" onClick={handleLogout}>
            <span style={{ marginRight: '8px' }}>🚪</span>
            <span>Exit</span>
          </button>
        </div>
        
        <div className="card">
          <h2>📋 Book Appointment</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const name = e.target.name.value;
            const symptoms = e.target.symptoms.value;
            const docId = e.target.doctor.value;
            const priority = e.target.priority.value;
            if (bookAppointment(name, symptoms, docId, priority)) {
              e.target.reset();
            }
          }}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" required placeholder="Enter full name" />
            </div>
            <div className="form-group">
              <label>Symptoms</label>
              <textarea name="symptoms" required rows="3" placeholder="Describe symptoms..."></textarea>
            </div>
            <div className="form-group">
              <label>Select Doctor</label>
              <select name="doctor" required>
                <option value="">-- Select Doctor --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} ({queue.filter(q => q.docId === doc.id).length}/{doc.maxPatients})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority">
                <option value="Normal">🟢 Normal</option>
                <option value="High">🔴 High Priority</option>
              </select>
            </div>
            <button type="submit" className="btn-action">✅ Confirm Appointment</button>
          </form>
        </div>
        
        <div className="card">
          <h2>👨‍⚕️ Doctor Availability</h2>
          <div className="doctor-grid">
            {doctors.map(doc => {
              const inQueue = queue.filter(q => q.docId === doc.id).length;
              return (
                <div key={doc.id} className="doctor-card">
                  <strong>{doc.name}</strong><br />
                  👥 {inQueue}/{doc.maxPatients}<br />
                  {doc.maxPatients - inQueue > 0 ? `✅ ${doc.maxPatients - inQueue} slots` : '🔴 Full'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Nurse Dashboard
  if (role === 'nurse') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="logo"><h1>Clinic <span>Q-</span> ⚕️</h1></div>
          <div className="role-badge">🩺 Nurse Mode · Queue Management</div>
          <button className="logout-btn" onClick={handleLogout}>🚪Exit</button>
        </div>
        
        <div className="card">
          <h2>🩺 Active Queue</h2>
          <div className="stats-bar">
            <span>Waiting: <strong>{queue.length}</strong></span>
            <span>🔴 High Priority: <strong>{queue.filter(p => p.priority === 'High').length}</strong></span>
          </div>
          
          {queue.length === 0 ? (
            <div className="empty-state">✨ No patients in queue</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Priority</th><th>Symptoms</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {queue.map((patient, idx) => {
                  const doctor = doctors.find(d => d.id === patient.docId);
                  return (
                    <tr key={idx}>
                      <td><strong>{patient.qno}</strong></td>
                      <td>{patient.name}<br /><small>{patient.bookedTime}</small></td>
                      <td>{doctor?.name}</td>
                      <td><span className={`status-badge ${patient.priority === 'High' ? 'status-high' : 'status-normal'}`}>{patient.priority}</span></td>
                      <td>{patient.sym.substring(0, 50)}</td>
                      <td>
                        <button className="btn-small btn-success" onClick={() => admitPatient(idx)}>🏥 Admit</button>
                        <button className="btn-small btn-danger" onClick={() => cancelAppointment(idx)}>✖ Cancel</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="card">
          <h2>📊 Doctor Queue Load</h2>
          <div className="doctor-grid">
            {doctors.map(doc => {
              const inQueue = queue.filter(q => q.docId === doc.id).length;
              return (
                <div key={doc.id} className="doctor-card">
                  <strong>{doc.name}</strong><br />
                  Waiting: {inQueue}/{doc.maxPatients}
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${(inQueue/doc.maxPatients)*100}%` }}></div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Doctor Dashboard
  if (role === 'doctor') {
    const selectedPatient = selectedPatientIndex >= 0 ? treatedHistory[selectedPatientIndex] : null;
    
    return (
      <div className="app-container">
        <div className="header">
          <div className="logo"><h1>Clinic <span>Q-</span> ⚕️</h1></div>
          <div className="role-badge">👨‍⚕️ Doctor Mode · History & Follow-ups</div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Exit</button>
        </div>
        
        <div className="card">
          <h2>📜 Patient Management</h2>
          <div className="tabs">
            <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📋 History ({treatedHistory.length})</button>
            <button className={`tab ${activeTab === 'followups' ? 'active' : ''}`} onClick={() => setActiveTab('followups')}>📅 Follow-ups ({followups.length})</button>
          </div>
          
          {activeTab === 'history' && (
            <>
              <div className="form-group">
                <label>Select Treated Patient</label>
                <select onChange={(e) => setSelectedPatientIndex(parseInt(e.target.value))} value={selectedPatientIndex}>
                  <option value="-1">-- Select patient --</option>
                  {treatedHistory.map((p, i) => (
                    <option key={p.id} value={i}>{p.name} - {p.doctor} ({p.time.split(',')[0]})</option>
                  ))}
                </select>
              </div>
              
              {selectedPatient && (
                <div className="history-detail">
                  <h3>{selectedPatient.name} <span className={`status-badge ${selectedPatient.priority === 'High' ? 'status-high' : 'status-normal'}`}>{selectedPatient.priority}</span></h3>
                  <p><strong>Doctor:</strong> {selectedPatient.doctor}</p>
                  <p><strong>Symptoms:</strong> {selectedPatient.sym}</p>
                  <p><strong>Visit Date:</strong> {selectedPatient.time}</p>
                  
                  <div className="followup-form">
                    <h4>📅 Schedule Follow-up</h4>
                    <input type="date" id="followupDate" className="form-input" />
                    <input type="text" id="followupReason" className="form-input" placeholder="Reason for follow-up" />
                    <button className="btn-action" onClick={() => {
                      const date = document.getElementById('followupDate').value;
                      const reason = document.getElementById('followupReason').value;
                      if (date && reason) {
                        scheduleFollowup(selectedPatient, date, reason);
                        document.getElementById('followupReason').value = '';
                      } else {
                        alert("Please fill both fields");
                      }
                    }}>📌 Schedule Follow-up</button>
                  </div>
                </div>
              )}
              
              {treatedHistory.length === 0 && <div className="empty-state">No treated patients yet</div>}
            </>
          )}
          
          {activeTab === 'followups' && (
            <>
              {followups.length === 0 ? (
                <div className="empty-state">No scheduled follow-ups</div>
              ) : (
                followups.map(f => (
                  <div key={f.id} className="followup-item">
                    <div>
                      <strong>{f.patientName}</strong><br />
                      👨‍⚕️ {f.doctor}<br />
                      📅 {f.date}<br />
                      📌 {f.reason}
                    </div>
                    <div>
                      <button className="btn-small btn-success" onClick={() => completeFollowup(f.id)}>✔ Complete</button>
                      <button className="btn-small btn-danger" onClick={() => deleteFollowup(f.id)}>✖ Cancel</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default App;