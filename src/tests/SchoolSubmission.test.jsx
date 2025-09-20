import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-toastify';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import 'react-toastify/dist/ReactToastify.css';

const SchoolSubmission = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    schoolName: '',
    classes: [{ className: '', declaredCount: 0 }],
    students: [],
    notes: '',
    contactInfo: { email: '', phone: '' }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClassChange = (index, field, value) => {
    setFormData((prev) => {
      const newClasses = [...prev.classes];
      newClasses[index] = { ...newClasses[index], [field]: value };
      return { ...prev, classes: newClasses };
    });
  };

  const addClass = () => {
    setFormData((prev) => ({
      ...prev,
      classes: [...prev.classes, { className: '', declaredCount: 0 }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.submitSchool(formData);
      toast.success('School submission received successfully');
      if (response.warnings && response.warnings.length > 0) {
        response.warnings.forEach((warning) => toast.warning(warning));
      }
      // Reset form or redirect
      setFormData({
        schoolName: '',
        classes: [{ className: '', declaredCount: 0 }],
        students: [],
        notes: '',
        contactInfo: { email: '', phone: '' }
      });
    } catch (error) {
      toast.error(error.message || 'Failed to submit school data');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Submit School Data</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
            School Name
          </label>
          <Input
            id="schoolName"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleInputChange}
            placeholder="Enter school name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Classes</label>
          {formData.classes.map((cls, index) => (
            <div key={index} className="flex space-x-4 mt-2">
              <Input
                placeholder="Class name"
                value={cls.className}
                onChange={(e) => handleClassChange(index, 'className', e.target.value)}
                required
              />
              <Input
                type="number"
                placeholder="Declared count"
                value={cls.declaredCount}
                onChange={(e) => handleClassChange(index, 'declaredCount', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          ))}
          <Button type="button" onClick={addClass} className="mt-2">
            Add Class
          </Button>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <Input
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter any additional notes"
            multiline
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Contact Email (Optional)
          </label>
          <Input
            id="email"
            name="contactInfo.email"
            value={formData.contactInfo.email}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              contactInfo: { ...prev.contactInfo, email: e.target.value }
            }))}
            placeholder="Enter contact email"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Contact Phone (Optional)
          </label>
          <Input
            id="phone"
            name="contactInfo.phone"
            value={formData.contactInfo.phone}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              contactInfo: { ...prev.contactInfo, phone: e.target.value }
            }))}
            placeholder="Enter contact phone"
          />
        </div>

        <Button type="submit" variant="primary">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default SchoolSubmission;