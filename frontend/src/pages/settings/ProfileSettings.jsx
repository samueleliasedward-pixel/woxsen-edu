import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Lock, 
  Camera, Save, Key, Shield, Bell, Moon 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || 'Rajesh Kumar',
    email: user?.email || 'student@woxsen.edu',
    phone: '+91 98765 43210',
    studentId: 'WXU2026001',
    program: 'B.Tech CSE',
    year: '3rd Year',
    semester: '6th Semester',
    address: 'Hyderabad, Telangana',
    dob: '2004-05-15',
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving profile:', formData);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Moon },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-header">
                <div className="avatar-section">
                  <div className="avatar-large">
                    {previewImage ? (
                      <img src={previewImage} alt="Profile" />
                    ) : (
                      <span>{formData.name.charAt(0)}</span>
                    )}
                  </div>
                  <label className="avatar-upload">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    Change Photo
                  </label>
                </div>
                <div className="profile-title">
                  <h2>{formData.name}</h2>
                  <p>{formData.studentId}</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Program</label>
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <select name="year" value={formData.year} onChange={handleInputChange}>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange}>
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>3rd Semester</option>
                    <option>4th Semester</option>
                    <option>5th Semester</option>
                    <option>6th Semester</option>
                    <option>7th Semester</option>
                    <option>8th Semester</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>
                    <MapPin size={16} />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="account-settings">
              <div className="settings-section">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
                <button className="save-btn">
                  <Key size={16} />
                  Update Password
                </button>
              </div>

              <div className="settings-section">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>
                <button className="security-btn">
                  <Shield size={16} />
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notification-settings">
              <div className="settings-section">
                <h3>Email Notifications</h3>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Assignment deadlines
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Exam reminders
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Grade updates
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Class cancellations
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Push Notifications</h3>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    AI Assistant responses
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Announcements
                  </label>
                  <label>
                    <input type="checkbox" />
                    Marketing updates
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;