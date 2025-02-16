exports.validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 15;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    if (password.length < minLength || password.length > maxLength) {
      return { valid: false, message: "비밀번호는 8~15자여야 합니다." };
    }
    if (!hasUpperCase) {
      return { valid: false, message: "비밀번호에는 최소 1개의 대문자가 포함되어야 합니다." };
    }
    if (!hasLowerCase) {
      return { valid: false, message: "비밀번호에는 최소 1개의 소문자가 포함되어야 합니다." };
    }
    if (!hasNumber) {
      return { valid: false, message: "비밀번호에는 최소 1개의 숫자가 포함되어야 합니다." };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: "비밀번호에는 최소 1개의 특수문자가 포함되어야 합니다." };
    }
  
    return { valid: true };
  };
  