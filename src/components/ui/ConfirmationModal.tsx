import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmButtonText = 'Yes',
    cancelButtonText = 'No',
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="mb-4">{message}</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                        {cancelButtonText}
                    </button>
                    <button onClick={onConfirm} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;