import RegistrationForm from "@/components/auth/RegistrationForm";

const RegisterPage = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center mb-6"> Create a New Account</h1>
                <RegistrationForm/>
                <p className="mt-4 text-sm text-gray-600 text-center">
                    Already have an account? <a className="text-blue-500 hover:underline" href="/signin">Sign in</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;