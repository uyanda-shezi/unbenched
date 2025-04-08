import { Metadata } from "next";
import UserManagementPage from "@/components/users/UserManagement";

export const metadata: Metadata = {
    title: 'Users',
    description: 'Manage users',
};

const AdminUsersPage = () => {
    return (
        <UserManagementPage/>
    );
};

export default AdminUsersPage;