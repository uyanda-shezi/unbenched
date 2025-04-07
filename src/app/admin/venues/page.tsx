import { Metadata } from "next";
import ManageVenueFormData from "@/components/venue/ManageVenueForm";

export const metadata: Metadata = {
    title: 'Venues',
    description: 'Manage venues',
};

const AdminVenuesPage = () => {
    return (<ManageVenueFormData/>)
}

export default AdminVenuesPage;