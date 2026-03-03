import React, { useState } from 'react';
import { 
  Shield, Lock, Key, Users, Globe,
  Bell, Mail, Smartphone, CheckCircle,
  AlertCircle, Eye, EyeOff, Save
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './SecuritySettings.css';

const SecuritySettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: true,
    expiryDays: 90
  });

  const [ipWhitelist, setIpWhitelist] = useState([
    '192.168.1.0/24',
    '10.0.0.0/16'
  ]);

  const [apiKeys, setApiKeys] = useState([
    { name: 'AI Service', key: 'wox_ai_2x8h3k...', lastUsed: '2026-02-26', status: 'active' },
    { name: 'Mobile App', key: 'wox_mob_9j4f2d...', lastUsed: '2026-02-25', status: 'active' },
    { name: 'Analytics', key: 'wox_ana_5r7g1b...', lastUsed: '2026-02-24', status: 'revoked' },
  ]);

  const [newIp, setNewIp] = useState('');

  return (
    <div className="security-settings">
      <div className="page-header">
        <div>
          <h1>Security Settings</h1>
          <p>Manage authentication, permissions, and security policies</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Authentication Section */}
        <Card className="settings-section">
          <div className="section-header">
            <Shield size={20} />
            <h2>Authentication</h2>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Two-Factor Authentication</h3>
              <p>Require 2FA for all admin accounts</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Session Timeout</h3>
              <p>Automatically log out inactive users after</p>
            </div>
            <select 
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="timeout-select"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Login Attempts</h3>
              <p>Max failed attempts before lockout</p>
            </div>
            <select className="timeout-select">
              <option>3 attempts</option>
              <option>5 attempts</option>
              <option>10 attempts</option>
            </select>
          </div>
        </Card>

        {/* Password Policy */}
        <Card className="settings-section">
          <div className="section-header">
            <Lock size={20} />
            <h2>Password Policy</h2>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Minimum Length</h3>
            </div>
            <input 
              type="number" 
              value={passwordPolicy.minLength}
              onChange={(e) => setPasswordPolicy({...passwordPolicy, minLength: e.target.value})}
              className="number-input"
              min="6"
              max="20"
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Require Uppercase</h3>
            </div>
            <input 
              type="checkbox" 
              checked={passwordPolicy.requireUppercase}
              onChange={(e) => setPasswordPolicy({...passwordPolicy, requireUppercase: e.target.checked})}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Require Lowercase</h3>
            </div>
            <input 
              type="checkbox" 
              checked={passwordPolicy.requireLowercase}
              onChange={(e) => setPasswordPolicy({...passwordPolicy, requireLowercase: e.target.checked})}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Require Numbers</h3>
            </div>
            <input 
              type="checkbox" 
              checked={passwordPolicy.requireNumbers}
              onChange={(e) => setPasswordPolicy({...passwordPolicy, requireNumbers: e.target.checked})}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Require Special Characters</h3>
            </div>
            <input 
              type="checkbox" 
              checked={passwordPolicy.requireSpecial}
              onChange={(e) => setPasswordPolicy({...passwordPolicy, requireSpecial: e.target.checked})}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Password Expiry (days)</h3>
            </div>
            <input 
              type="number" 
              value={passwordPolicy.expiryDays}
              onChange={(e) => setPasswordPolicy({...passwordPolicy, expiryDays: e.target.value})}
              className="number-input"
            />
          </div>
        </Card>

        {/* IP Whitelist */}
        <Card className="settings-section">
          <div className="section-header">
            <Globe size={20} />
            <h2>IP Whitelist</h2>
          </div>

          <div className="ip-list">
            {ipWhitelist.map((ip, index) => (
              <div key={index} className="ip-item">
                <span>{ip}</span>
                <button className="remove-btn">×</button>
              </div>
            ))}
          </div>

          <div className="add-ip">
            <input
              type="text"
              placeholder="Enter IP or CIDR (e.g., 192.168.1.0/24)"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
            />
            <Button size="sm">Add</Button>
          </div>
        </Card>

        {/* API Keys */}
        <Card className="settings-section">
          <div className="section-header">
            <Key size={20} />
            <h2>API Keys</h2>
          </div>

          <table className="api-keys-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Last Used</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key, index) => (
                <tr key={index}>
                  <td>{key.name}</td>
                  <td>
                    <code>{key.key}</code>
                  </td>
                  <td>{key.lastUsed}</td>
                  <td>
                    <span className={`status-badge ${key.status}`}>
                      {key.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Button variant="outline" size="sm" className="generate-btn">
            Generate New Key
          </Button>
        </Card>

        {/* Notification Settings */}
        <Card className="settings-section">
          <div className="section-header">
            <Bell size={20} />
            <h2>Security Notifications</h2>
          </div>

          <div className="notification-option">
            <input type="checkbox" id="emailAlerts" defaultChecked />
            <label htmlFor="emailAlerts">Email alerts for failed logins</label>
          </div>

          <div className="notification-option">
            <input type="checkbox" id="smsAlerts" />
            <label htmlFor="smsAlerts">SMS for critical security events</label>
          </div>

          <div className="notification-option">
            <input type="checkbox" id="newDevice" defaultChecked />
            <label htmlFor="newDevice">Notify on new device login</label>
          </div>

          <div className="notification-option">
            <input type="checkbox" id="apiAlerts" defaultChecked />
            <label htmlFor="apiAlerts">API key usage alerts</label>
          </div>
        </Card>

        {/* Save Button */}
        <div className="save-section">
          <Button variant="primary" icon={Save}>
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;