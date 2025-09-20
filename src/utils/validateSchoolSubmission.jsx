// Validation utilities for school submission form

export const validateSchoolInfo = (schoolData) => {
  const errors = {};
  
  if (!schoolData.schoolName || schoolData.schoolName.trim() === '') {
    errors.schoolName = 'School name is required';
  }
  
  if (schoolData.notes && schoolData.notes.length > 500) {
    errors.notes = 'Notes cannot exceed 500 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateClasses = (classes) => {
  const errors = {};
  
  if (!classes || classes.length === 0) {
    errors.classes = 'At least one class is required';
    return { isValid: false, errors };
  }
  
  let totalDeclared = 0;
  
  classes.forEach((classItem, index) => {
    if (!classItem.className || classItem.className.trim() === '') {
      errors[`class_${index}_name`] = 'Class name is required';
    }
    
    if (!classItem.declaredCount || classItem.declaredCount <= 0) {
      errors[`class_${index}_count`] = 'Student count must be greater than 0';
    } else {
      totalDeclared += parseInt(classItem.declaredCount);
    }
  });
  
  if (totalDeclared === 0) {
    errors.total = 'Total declared students must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    totalDeclared
  };
};

export const validateStudents = (students, totalDeclared) => {
  const errors = {};
  
  if (!students || students.length === 0) {
    errors.students = 'At least one student is required';
    return { isValid: false, errors };
  }
  
  if (students.length !== totalDeclared) {
    errors.count = `Number of students (${students.length}) must match declared count (${totalDeclared})`;
  }
  
  students.forEach((student, index) => {
    if (!student.name || student.name.trim() === '') {
      errors[`student_${index}_name`] = 'Student name is required';
    }
    
    if (!student.dob) {
      errors[`student_${index}_dob`] = 'Date of birth is required';
    } else {
      // Validate date format and age
      const dob = new Date(student.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (isNaN(dob.getTime())) {
        errors[`student_${index}_dob`] = 'Invalid date format';
      } else if (age < 5 || age > 18) {
        errors[`student_${index}_dob`] = 'Student age must be between 5 and 18 years';
      }
    }
    
    if (!student.className || student.className.trim() === '') {
      errors[`student_${index}_class`] = 'Class is required';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCompleteSubmission = (submissionData) => {
  const schoolValidation = validateSchoolInfo(submissionData.schoolInfo);
  const classesValidation = validateClasses(submissionData.classes);
  const studentsValidation = validateStudents(submissionData.students, classesValidation.totalDeclared);
  
  const allErrors = {
    ...schoolValidation.errors,
    ...classesValidation.errors,
    ...studentsValidation.errors
  };
  
  return {
    isValid: schoolValidation.isValid && classesValidation.isValid && studentsValidation.isValid,
    errors: allErrors,
    totalDeclared: classesValidation.totalDeclared
  };
};

export const formatValidationErrors = (errors) => {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message
  }));
};