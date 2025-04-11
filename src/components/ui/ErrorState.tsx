interface ErrorStateProps {
    error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
    return <div className="text-red-500">Error: {error}</div>;
};

export default ErrorState;