import { useNavigate } from 'react-router-dom';

const useManageOrSetup = () => {
    const navigate = useNavigate();
    return async (id: string) => {
        if (await window.api.isInstalled(id)) {
            navigate(`/manage/${id}`);
        } else {
            navigate(`/setup/${id}`);
        }
    };
};
export default useManageOrSetup;
