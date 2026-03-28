import useUsers from "@/hooks/useUsers";

const ManageUsers = () => {
    const {users} = useUsers() 
    console.log(users);
    return (
        <div>
            aaa
        </div>
    );
};

export default ManageUsers;