import Sidebar from "../components/Dashboard/Sidebar/Sidebar";

const DashboardLayout = () => {
    return (
        <div>
            <div className="relative min-h-screen md-flex bg-white">
                <Sidebar></Sidebar>
            </div>
        </div>
    );
};

export default DashboardLayout;