// Validation utility for school submissions
export const validateSchoolSubmission = (submission) => {
  const errors = [];
  const warnings = [];

  // School name validation
  if (!submission.schoolName || submission.schoolName.trim().length < 2) {
    errors.push('School name must be at least 2 characters long');
  } else if (submission.schoolName.trim().length > 100) {
    errors.push('School name must be less than 100 characters');
  }

  // Classes validation
  if (!submission.classes || submission.classes.length === 0) {
    errors.push('At least one class must be added');
  } else {
    // Validate each class
    submission.classes.forEach((cls, index) => {
      if (!cls.className || cls.className.trim().length < 1) {
        errors.push(`Class ${index + 1}: Class name is required`);
      }
      
      if (!cls.declaredCount || cls.declaredCount < 0) {
        errors.push(`Class ${index + 1}: Declared count must be a positive number`);
      } else if (cls.declaredCount > 1000) {
        warnings.push(`Class ${index + 1}: Declared count seems unusually high (${cls.declaredCount})`);
      }
    });

    // Total validation
    const totalDeclared = submission.classes.reduce((sum, cls) => sum + (cls.declaredCount || 0), 0);
    if (totalDeclared === 0) {
      errors.push('Total declared students must be greater than 0');
    } else if (totalDeclared > 5000) {
      warnings.push(`Total declared students (${totalDeclared}) seems unusually high`);
    }
  }

  // Students validation (if provided)
  if (submission.students && submission.students.length > 0) {
    submission.students.forEach((student, index) => {
      if (!student.name || student.name.trim().length < 2) {
        errors.push(`Student ${index + 1}: Name must be at least 2 characters`);
      }
      
      if (!student.dob) {
        errors.push(`Student ${index + 1}: Date of birth is required`);
      } else {
        const dob = new Date(student.dob);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        
        if (age < 5 || age > 18) {
          warnings.push(`Student ${index + 1}: Age (${age}) seems outside typical school range`);
        }
      }
      
      if (!student.className) {
        errors.push(`Student ${index + 1}: Class name is required`);
      }
    });

    // Check if student count matches declared count
    const totalStudents = submission.students.length;
    const totalDeclared = submission.classes.reduce((sum, cls) => sum + (cls.declaredCount || 0), 0);
    
    if (totalStudents !== totalDeclared) {
      warnings.push(`Student count (${totalStudents}) doesn't match declared count (${totalDeclared})`);
    }
  }

  // Notes validation
  if (submission.notes && submission.notes.length > 500) {
    errors.push('Notes must be 500 characters or less');
  }

  // Contact information validation (if provided)
  if (submission.contactInfo) {
    if (submission.contactInfo.email && !isValidEmail(submission.contactInfo.email)) {
      errors.push('Invalid email format');
    }
    
    if (submission.contactInfo.phone && !isValidPhone(submission.contactInfo.phone)) {
      warnings.push('Phone number format may be invalid');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasWarnings: warnings.length > 0
  };
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone number (basic validation)
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Validation for individual student data
export const validateStudent = (student) => {
  const errors = [];

  if (!student.name || student.name.trim().length < 2) {
    errors.push('Student name must be at least 2 characters');
  }

  if (!student.dob) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(student.dob);
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth format');
    }
  }

  if (!student.className || student.className.trim().length < 1) {
    errors.push('Class name is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation for class data
export const validateClass = (classData) => {
  const errors = [];

  if (!classData.className || classData.className.trim().length < 1) {
    errors.push('Class name is required');
  }

  if (!classData.declaredCount || classData.declaredCount < 0) {
    errors.push('Declared count must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize input data
export const sanitizeSubmission = (submission) => {
  return {
    ...submission,
    schoolName: submission.schoolName?.trim(),
    notes: submission.notes?.trim(),
    classes: submission.classes?.map(cls => ({
      ...cls,
      className: cls.className?.trim()
    })),
    students: submission.students?.map(student => ({
      ...student,
      name: student.name?.trim(),
      className: student.className?.trim()
    }))
  };
};