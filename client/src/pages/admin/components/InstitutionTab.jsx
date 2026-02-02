import { useState } from "react";
import { toast } from "react-toastify";
import { FiEdit3, FiCheck, FiX, FiPlus, FiGlobe, FiMapPin, FiHash } from "react-icons/fi";
import { createInstitution, updateInstitution } from "../../../services/institutionApi";
import "./InstitutionTab.css";

const InstitutionTab = ({ institution, setInstitution }) => {
  const [isEditing, setIsEditing] = useState(!institution); // Auto-open form if no institution exists
  const [loading, setLoading] = useState(false);
  const [institutionForm, setInstitutionForm] = useState({
    name: institution?.name || "",
    code: institution?.code || "",
    address: institution?.address || "",
    website: institution?.website || "",
  });

  const handleEditToggle = () => {
    setInstitutionForm({
      name: institution?.name || "",
      code: institution?.code || "",
      address: institution?.address || "",
      website: institution?.website || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!institutionForm.name || !institutionForm.code) {
      return toast.error("Institution name & code required");
    }

    setLoading(true);
    try {
      if (institution?._id && isEditing) {
        const res = await updateInstitution(institution._id, institutionForm);
        setInstitution(res.institution);
        toast.success("Changes saved successfully");
      } else {
        const res = await createInstitution(institutionForm);
        setInstitution(res.institution);
        toast.success("Institution profile created");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-card">
      <div className="tab-header">
        <div className="header-text">
          <h3>Institution Profile</h3>
          <p className="subtitle">Manage your organization's public identity</p>
        </div>
        {institution && !isEditing && (
          <button className="btn-edit-action" onClick={handleEditToggle}>
          <FiEdit3 size={14} /> <span>Edit Profile</span>
        </button>
        )}
      </div>

      {institution && !isEditing ? (
        <div className="institution-info">
          <div className="info-grid">
            <div className="info-item">
              <div className="icon-box"><FiGlobe /></div>
              <div className="content">
                <strong>Organization Name</strong>
                <span>{institution.name}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="icon-box"><FiHash /></div>
              <div className="content">
                <strong>Institution Code</strong>
                <span>{institution.code}</span>
              </div>
            </div>
            <div className="info-item full-width">
              <div className="icon-box"><FiMapPin /></div>
              <div className="content">
                <strong>Physical Address</strong>
                <span>{institution.address || "No address provided"}</span>
              </div>
            </div>
            <div className="info-item full-width">
              <div className="icon-box"><FiGlobe /></div>
              <div className="content">
                <strong>Official Website</strong>
                <span>{institution.website || "No website linked"}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="institution-form">
          <div className="form-row">
            <div className="form-group">
              <label>Institution Name</label>
              <input
                placeholder="e.g. Stanford University"
                value={institutionForm.name}
                onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Institution Code</label>
              <input
                placeholder="e.g. STAN-01"
                value={institutionForm.code}
                onChange={(e) => setInstitutionForm({ ...institutionForm, code: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              placeholder="Enter full street address"
              value={institutionForm.address}
              onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              placeholder="https://www.institution.com"
              value={institutionForm.website}
              onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
            />
          </div>

          <div className="button-group">
            <button className="btn-save" onClick={handleSave} disabled={loading}>
              {loading ? (
                <span className="loader-dots">Processing...</span>
              ) : institution ? (
                <><FiCheck className="btn-icon" /> Update Profile</>
              ) : (
                <><FiPlus className="btn-icon" /> Create Profile</>
              )}
            </button>
            {isEditing && institution && (
              <button className="btn-cancel" onClick={() => setIsEditing(false)} disabled={loading}>
                <FiX className="btn-icon" /> Discard Changes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionTab;