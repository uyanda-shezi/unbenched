export const validateSignInForm = (email: string, password: string) => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
        errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Invalid email format';
    }

    if (!password.trim()) {
        errors.password = 'Password is required';
    }

    return errors; // Return an object containing any errors
};