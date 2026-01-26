exports.validatePassword = (password) => {
    const minLength = 8;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < minLength) {
      return { valid: false, message: "비밀번호는 8자 이상이어야 합니다." };
    }
    if (!hasLetter) {
      return { valid: false, message: "비밀번호에는 최소 1개의 영문자가 포함되어야 합니다." };
    }
    if (!hasNumber) {
      return { valid: false, message: "비밀번호에는 최소 1개의 숫자가 포함되어야 합니다." };
    }

    return { valid: true };
  };
  