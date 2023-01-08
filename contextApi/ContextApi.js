import { useState, createContext } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Layout from "../layout";
import staticData from '../utils/data/staticData';


const ContextData = createContext()

function ContextApi({ children }) {
    // modal
    const [show, setShow] = useState(false);

    const links = [
        { url: '/dashboard/my-packages', name: 'My Packages', icon: DashboardIcon }
    ]

    const state = {
        ...staticData,
        modal: { show, setShow },
    }

    return (
        <ContextData.Provider value={state}>
            <Layout>
                {children}
            </Layout>
        </ContextData.Provider>
    )
}

export { ContextApi, ContextData }