import useUserRole from "@/hooks/useUserRole";

const Statistics = () => {
    const {role} = useUserRole();
    console.log(role);
    return (
        <div>
            a
        </div>
    );
};

export default Statistics;