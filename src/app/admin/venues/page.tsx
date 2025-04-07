import { Metadata } from "next";
import ManageVenuePageComponent from "@/components/venue/ManageVenue";

export const metadata: Metadata = {
    title: 'Venues',
    description: 'Manage venues',
};

const AdminVenuesPage = () => {
    return (<ManageVenuePageComponent/>)
}

export default AdminVenuesPage;