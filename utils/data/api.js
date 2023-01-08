import axios from "axios";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
// toast(data.msg, { type: 'success' })

class apiClass {
    constructor() { }

    fetchConfig = async (
        setConfigData
    ) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/config`);
            setConfigData(data.data)
        }
        catch (err) {
            return;
        }

    }

    setCookies = (
        accesstoken,
        refreshtoken,
        role
    ) => {
        Cookies.set("accesstoken", accesstoken, {
            expires: new Date(new Date().getTime() + 1000 * 60 * 3), // 3 minutes (this is the same time backend accesstoken expires))
            secure: true,
            sameSite: 'strict'
        })
        Cookies.set("refreshtoken", refreshtoken, {
            expires: 28, // 28 days (this is the same time backend refreshtoken expires)
            secure: true,
            sameSite: 'strict'
        })
        Cookies.set("role", role, {
            expires: 28, // 28 days (this is the same time backend role expires))
            secure: true,
            sameSite: 'strict'
        });
    }

    logout = (
        navigate
    ) => {
        Cookies.remove('accesstoken')
        Cookies.remove('refreshtoken')
        Cookies.remove('role')

        navigate('/');
    }

    setAdminCookies = (
        token
    ) => {
        Cookies.set('extratoken', token, {
            secure: true,
            sameSite: 'strict'
        })
    }

    logoutAdmin = (
        navigate
    ) => {
        Cookies.remove('extratoken')

        navigate('/dashboard');
    }

    refreshToken = async () => {
        if (!Cookies.get('accesstoken') && Cookies.get('refreshtoken')) {
            try {
                const { data } = await axios.get(`${BASE_URL}/auth/generate-accesstoken`, {
                    headers: {
                        authorization: `Bearer ${Cookies.get('refreshtoken')}`
                    }
                })

                // log the user in
                this.setCookies(data.accesstoken, data.refreshtoken, data.data.role)
            }
            catch (err) {
                return
            }
        }

        // if (!Cookies.get('refreshtoken')) {
        //     window.location.reload();
        //     toast('Session is over, please login')
        // }
    }

    fetchProfile = async (
        setProfileData,
        setProfileLoading,
        setFetchProfileSuccess,
        setFetchProfileMsg
    ) => {
        setProfileLoading(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/auth/get-profile`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });
            setProfileData(data.data);
            setProfileLoading(false);
            setFetchProfileSuccess(true);
            setFetchProfileMsg(data.msg)
        }
        catch (err) {
            if (err.response) {
                setFetchProfileMsg(err.response.data.msg);
                setFetchProfileSuccess(false)
                setProfileLoading(false)

                //clear cookies if there is error
                Cookies.remove('accesstoken')
                Cookies.remove('refreshtoken')
                Cookies.remove('role')
            }
            else {
                setFetchProfileMsg(err.message);
                setFetchProfileSuccess(false)
                setProfileLoading(false)
            }

            // logout
            // this.logout()
        }
    }

    fetchProfileAgain = async (
        setProfileData,
        setProfileLoadingAgain
    ) => {
        setProfileLoadingAgain(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/auth/get-profile`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });
            setProfileData(data.data);
            setProfileLoadingAgain(false);
            // toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setProfileLoadingAgain(false)
                // toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setProfileLoadingAgain(false)
                // toast(err.message, { type: 'error' })
            }

        }
    }

    changeProfileImage = async (
        setProfileImageLoading,
        file,
        setProfileLoadingAgain,
        setProfileData,) => {
        setProfileImageLoading(true);
        try {
            let formData = new FormData();
            formData.append('file', file)

            const { data } = await axios.put(`${BASE_URL}/profile/upload-profile`, formData, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // fecth profile if profile image changed successfull
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain)

            setProfileImageLoading(false);
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setProfileImageLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setProfileImageLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
        }
    }

    updateProfile = async (
        setProfileData,
        setProfileLoadingAgain,
        setFetchProfileSuccess,
        setFetchProfileMsg,
        inp,
        setEditProfileLoading,
    ) => {

        setEditProfileLoading(true);
        try {
            const { data } = await axios.put(`${BASE_URL}/profile/update-profile`, { ...inp }, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });

            toast(data.msg, { type: 'success' })

            // fetch profile if successful
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain, setFetchProfileSuccess, setFetchProfileMsg)
            setEditProfileLoading(false)
        }
        catch (err) {
            if (err.response) {
                setEditProfileLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setEditProfileLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
        }
    }

    updateConfig = async (
        setUpdatingConfig,
        inp,
        setConfigData,
        setCategory,
        category
    ) => {
        setCategory(category)
        setUpdatingConfig(true);
        try {
            const { data } = await axios.put(`${BASE_URL}/config/update`, { ...inp }, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            toast(data.msg, { type: 'success' })

            // fetch config data
            this.fetchConfig(setConfigData)
            setUpdatingConfig(false)
        }
        catch (err) {
            if (err.response) {
                setUpdatingConfig(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setUpdatingConfig(false);
                toast(err.response.data.msg, { type: 'error' })
            }
        }
    }

    resetPassword = async (
        data_,
        setChangePasswordLoading,
        setInp
    ) => {

        setChangePasswordLoading(true);
        try {
            const { data } = await axios.put(`${BASE_URL}/auth/reset-password`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });

            setChangePasswordLoading(false);
            toast(data.msg, { type: 'success' })
            setInp({
                oldPassword: "",
                newPassword: "",
                newCpassword: ""
            })
        }
        catch (err) {
            if (err.response) {
                setChangePasswordLoading(false);
                toast(err.response.data.msg, { type: 'error' });
            }
            else {
                setChangePasswordLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
        }
    }

    resetAdminPassword = async (
        setChangePasswordLoading,
        data_,
        setChangePasswordSuccess
    ) => {

        setChangePasswordLoading(true);
        try {
            const { data } = await axios.put(`${BASE_URL}/config/reset-admin-password`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            setChangePasswordLoading(false);
            setChangePasswordSuccess(true)
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setChangePasswordLoading(false);
                setChangePasswordSuccess(false);
                toast(err.response.data.msg, { type: 'error' });
            }
            else {
                setChangePasswordLoading(false);
                setChangePasswordSuccess(false);
                toast(err.response.data.msg, { type: 'error' })
            }
        }
    }

    // investment plan
    fetchPlans = async (
        setPlans,
        setFetchingPlans,
        setFetchingPlansSuccess
    ) => {
        setFetchingPlans(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/investment/plans`);
            setPlans(data.data);
            setFetchingPlans(false);
            setFetchingPlansSuccess(true);
        }
        catch (err) {
            if (err.response) {
                setFetchingPlans(false);
                setFetchingPlansSuccess(false);
            }
            else {
                setFetchingPlans(false);
                setFetchingPlansSuccess(false);
            }
        }
    }

    refreshPlans = async (
        setPlans,
        setRefreshingPlans
    ) => {
        setRefreshingPlans(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/investment/plans`);
            setPlans(data.data);
            setRefreshingPlans(false);
        }
        catch (err) {
            if (err.response) {
                setRefreshingPlans(false);
            }
            else {
                setRefreshingPlans(false);
            }
        }
    }

    postPlan = async (
        data_,
        setPostingPlan,
        setPlans,
        setRefreshingPlans
    ) => {
        setPostingPlan(true)
        try {
            const { data } = await axios.post(`${BASE_URL}/investment/plans`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            // refresh plan
            this.refreshPlans(setPlans, setRefreshingPlans)
            setPostingPlan(false);
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setPostingPlan(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setPostingPlan(false);
                toast(err.message, { type: 'error' })
            }
        }
    }

    updatePlan = async (
        data_,
        id,
        setUpdatingPlan,
        setPlans,
        setRefreshingPlans
    ) => {
        setUpdatingPlan(true)
        try {
            const { data } = await axios.put(`${BASE_URL}/investment/plans/${id}`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            // refresh plan
            this.refreshPlans(setPlans, setRefreshingPlans)
            setUpdatingPlan(false);
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setUpdatingPlan(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setUpdatingPlan(false);
                toast(err.message, { type: 'error' })
            }
        }
    }

    deletePlan = async (
        id,
        setDeletingPlan,
        setPlans,
        setRefreshingPlans
    ) => {

        try {
            const { data } = await axios.delete(`${BASE_URL}/investment/plans/${id}`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            // refresh plan
            this.refreshPlans(setPlans, setRefreshingPlans)
            setDeletingPlan(false);
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setDeletingPlan(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setDeletingPlan(false);
                toast(err.message, { type: 'error' })
            }
        }
    }

    buyPlan = async (
        data_,
        setInvestLoading,
        setProfileData,
        setProfileLoadingAgain,
        setAmount,
        setOpenInvestModal
    ) => {
        setInvestLoading(true)
        try {
            const { data } = await axios.post(`${BASE_URL}/investment/invest/${data_.id}`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                }
            });

            // refresh profile data
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain)
            setInvestLoading(false);
            setAmount("")
            setOpenInvestModal(false)
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setInvestLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setInvestLoading(false);
                toast(err.message, { type: 'error' })
            }
        }
    }

    // automatic resolve investment
    resolveInvestment = async () => {

        try {
            const { data } = await axios.get(`${BASE_URL}/investment/resolve`);
            // console.log(data)
            return
        }
        catch (err) {
            if (err.response) {
                // console.log(err.response.data.msg)
                return;
            }
            else {
                // console.log(err.message)
                return;
            }
        }
    }

    adminGetAllInvestments = async (
        setInvestmentData_admin,
        setFetchingInvestments_admin,
        setFetchInvestmentsMsg_admin
    ) => {
        setFetchingInvestments_admin(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/investment/get-all-investments-admin`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setInvestmentData_admin(data.data)
            setFetchingInvestments_admin(false)
            setFetchInvestmentsMsg_admin(data.msg)
        }
        catch (err) {
            if (err.response) {
                setFetchingInvestments_admin(false)
                setFetchInvestmentsMsg_admin(err.response.data.msg)
            }
            else {
                setFetchingInvestments_admin(false)
                setFetchInvestmentsMsg_admin(err.message)
            }
        }
    }

    userGetAllInvestments = async (
        setInvestmentData_users,
        setFetchingInvestments_users,
        setFetchInvestmentsMsg_users
    ) => {
        setFetchingInvestments_users(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/investment/get-all-investments`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });
            setInvestmentData_users(data)
            setFetchingInvestments_users(false)
            setFetchInvestmentsMsg_users(data.msg)
        }
        catch (err) {
            if (err.response) {
                setFetchingInvestments_users(false)
                setFetchInvestmentsMsg_users(err.response.data.msg)
            }
            else {
                setFetchingInvestments_users(false)
                setFetchInvestmentsMsg_users(err.message)
            }
        }
    }

    // manual by the supper admin
    resolveInvestments = async (
        id,
        setInvestmentData_admin,
        setFetchingInvestments_admin,
        setFetchInvestmentsMsg_admin,
        setResolvingInvestment,
        type,
        selectedUser,
        setUserData_admin,
        setFetchingUserData_admin_refesh,
    ) => {
        setResolvingInvestment(true)
        try {
            const { data } = await axios.put(`${BASE_URL}/investment/resolve-manual/${id}`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            type === 'hx' ? this.fetchUserHistory_admin_refresh(selectedUser, setUserData_admin, setFetchingUserData_admin_refesh) :
                this.adminGetAllInvestments(setInvestmentData_admin, setFetchingInvestments_admin, setFetchInvestmentsMsg_admin)

            setInvestmentData_admin(data)
            setResolvingInvestment(false)
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setResolvingInvestment(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setResolvingInvestment(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    // transfer
    verifyAccountNo = async (
        data_, setVerifyAccountNoLoading,
        setVerifyAccountNoData,
        setShowPayUserModal,
    ) => {
        setVerifyAccountNoLoading(true)
        try {
            const { data } = await axios.post(`${BASE_URL}/transfer/verify-acccount-no`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                }
            });
            setVerifyAccountNoData(data.data)
            setVerifyAccountNoLoading(false);
            setShowPayUserModal(true)
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setVerifyAccountNoLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setVerifyAccountNoLoading(false);
                toast(err.message, { type: 'error' })
            }
        }
    }

    payUser = async (
        data_,
        setPayLoading,
        setTransferSuccess,
        setProfileLoadingAgain,
        setProfileData
    ) => {
        setPayLoading(true)
        try {
            const { data } = await axios.post(`${BASE_URL}/transfer/pay-user`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });

            // refresh profile data
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain);

            setPayLoading(false);
            setTransferSuccess(true)
            toast(data.msg, { type: 'success' });
        }
        catch (err) {
            if (err.response) {
                setPayLoading(false);
                setTransferSuccess(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setPayLoading(false);
                setTransferSuccess(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    // withdrawal
    userWithdrawal = async (
        data_,
        setWithdrawalLoading,
        setInp,
        setProfileData,
        setProfileLoadingAgain
    ) => {
        setWithdrawalLoading(true);
        try {
            const { data } = await axios.post(`${BASE_URL}/withdrawal/request`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });

            // refresh profile data
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain);

            setWithdrawalLoading(false);
            setInp({
                amount: null,
                walletAddress: '',
                coin: ''
            })
            toast(data.msg, { type: 'success' });
        }
        catch (err) {
            if (err.response) {
                setWithdrawalLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setWithdrawalLoading(false);
                toast(err.message, { type: 'error' })
            }
        }
    }

    // deposit
    userDeposit = async (
        data_,
        setDepositLoading,
        setInp, window
    ) => {
        setDepositLoading(true);
        try {
            const { data } = await axios.post(`${BASE_URL}/deposit/`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });
            setDepositLoading(false);
            setInp({ amount: null })
            toast(data.msg, { type: 'success' })

            // redirext user to pay via libk returned from backend
            setTimeout(() => {
                window.location.href = data.data.hostedUrl
            }, 1500)

        }
        catch (err) {
            if (err.response) {
                setDepositLoading(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setDepositLoading(false);
                toast(err.message, { type: 'error' })
            }
        }
    }

    getUsers = async (
        setFetchingUsers_initial,
        setFetchingUsersSuccess_initial,
        setUserData
    ) => {
        setFetchingUsers_initial(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/auth/get-users`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setUserData(data)
            setFetchingUsersSuccess_initial(true)
            setFetchingUsers_initial(false)
        }
        catch (err) {
            if (err.response) {
                setFetchingUsers_initial(false)
                setFetchingUsersSuccess_initial(false)
            }
            else {
                setFetchingUsers_initial(false)
                setFetchingUsersSuccess_initial(false)
            }
        }
    }

    refreshUsers = async (
        setFetchingUsers_refresh,
        setUserData
    ) => {
        setFetchingUsers_refresh(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/auth/get-users`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setUserData(data)
            setFetchingUsers_refresh(false)
        }
        catch (err) {
            if (err.response) {
                setFetchingUsers_refresh(false)
            }
            else {
                setFetchingUsers_refresh(false)
            }
        }
    }

    toggleAdmin = async (
        id,
        toggleMakeAdminLoading,
        setFetchingUsers_refresh,
        setUserData
    ) => {
        toggleMakeAdminLoading(true)
        try {
            const { data } = await axios.put(`${BASE_URL}/auth/toggle-admin/${id}`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            //refresh user data
            this.refreshUsers(setFetchingUsers_refresh, setUserData);

            toggleMakeAdminLoading(false)
            toast(data.msg, { type: 'success' })

        }
        catch (err) {
            if (err.response) {
                toggleMakeAdminLoading(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                toggleMakeAdminLoading(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    toggleDeactivate = async (
        id,
        setToggleBockUserLoading,
        setFetchingUsers_refresh,
        setUserData
    ) => {
        setToggleBockUserLoading(true)
        try {
            const { data } = await axios.put(`${BASE_URL}/auth/toggle-block-user/${id}`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            //refresh user data
            this.refreshUsers(setFetchingUsers_refresh, setUserData);

            setToggleBockUserLoading(false)
            toast(data.msg, { type: 'success' })

        }
        catch (err) {
            if (err.response) {
                setToggleBockUserLoading(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setToggleBockUserLoading(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    deleteUser = async (
        id,
        setDeleteUserLoading,
        setFetchingUsers_refresh,
        setUserData
    ) => {
        setDeleteUserLoading(true)
        try {
            const { data } = await axios.put(`${BASE_URL}/auth/delete-many-accounts/`, { id }, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            //refresh user data
            this.refreshUsers(setFetchingUsers_refresh, setUserData);

            setDeleteUserLoading(false)
            toast(data.msg, { type: 'success' })
        }
        catch (err) {
            if (err.response) {
                setDeleteUserLoading(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setDeleteUserLoading(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    //user referral
    fetchReferralHx = async (
        setFetchReferralHxLoading,
        setReferralHxData,
        setFetchReferralHxSuccess
    ) => {

        setFetchReferralHxLoading(true);
        try {
            const { data } = await axios.get(`${BASE_URL}/referral/get-all-hx`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });

            setReferralHxData(data.data)
            setFetchReferralHxLoading(false)
            setFetchReferralHxSuccess(true)

        }
        catch (err) {
            if (err.response) {
                setFetchReferralHxLoading(false);
                setFetchReferralHxSuccess(false);
            }
            else {
                setFetchReferralHxLoading(false);
                setFetchReferralHxSuccess(false);
            }
        }
    }

    addRefecode = async (
        refcode,
        setAddingRefcode,
        setProfileData,
        setProfileLoadingAgain
    ) => {

        setAddingRefcode(true);
        try {
            const { data } = await axios.put(`${BASE_URL}/referral/add-refcode`, { refcode }, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });

            // fetch profile if successful
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain)

            setAddingRefcode(false)
            toast(data.msg, { type: 'success' })

        }
        catch (err) {
            if (err.response) {
                setAddingRefcode(false);
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setAddingRefcode(false);
                toast(err.response.data.msg, { type: 'error' })
            }
        }
    }

    // admin deposit handler section
    getDepositAdmin_initial = async (
        setFetchingDepositData_initial,
        setDepositDataSuccess,
        setDepositData
    ) => {
        setFetchingDepositData_initial(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/deposit/get-all-admin`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setFetchingDepositData_initial(false)
            setDepositDataSuccess(true)
            setDepositData(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingDepositData_initial(false)
                setDepositDataSuccess(false)
            }
            else {
                setFetchingDepositData_initial(false)
                setDepositDataSuccess(false)
            }
        }
    }

    // admin deposit handler section
    getDepositAdmin_refresh = async (
        setFetchingDepositData_refresh,
        setDepositData
    ) => {
        setFetchingDepositData_refresh(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/deposit/get-all-admin`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setFetchingDepositData_refresh(false)
            setDepositData(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingDepositData_refresh(false)
            }
            else {
                setFetchingDepositData_refresh(false)
            }
        }
    }

    // resolve deposit manually
    resolveDepositAdmin = async (
        amount,
        id,
        setResolvingDeposit,
        setFetchingDepositData_refresh,
        setDepositData,
        setAmount,
        setShowResolvingDepositModal,
        setSelectedData,
        type,
        selectedUser,
        setUserData_admin,
        setFetchingUserData_admin_refesh,
    ) => {
        setResolvingDeposit(true)
        try {
            const { data } = await axios.put(`${BASE_URL}/deposit/resolve/${id}`, { amount }, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            type === 'hx' ? this.fetchUserHistory_admin_refresh(selectedUser, setUserData_admin, setFetchingUserData_admin_refesh) :
                this.getDepositAdmin_refresh(setFetchingDepositData_refresh, setDepositData);

            setResolvingDeposit(false)
            toast(data.msg, { type: 'success' })
            setShowResolvingDepositModal(false);
            setAmount('');
            setSelectedData('')
        }
        catch (err) {
            if (err.response) {
                setResolvingDeposit(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setResolvingDeposit(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    // admin withdrawal handler section
    getPendingWithdrawal_initial = async (
        setFetchingPendingWithdrawalData_initial,
        setPendingWithdrawalDataSuccess,
        setPendingWithdrawalData
    ) => {
        setFetchingPendingWithdrawalData_initial(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/withdrawal/get-all-transactions/?status=pending`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setPendingWithdrawalData(data.data)
            setFetchingPendingWithdrawalData_initial(false)
            setPendingWithdrawalDataSuccess(true)
        }
        catch (err) {
            if (err.response) {
                setFetchingPendingWithdrawalData_initial(false)
                setPendingWithdrawalDataSuccess(false)
            }
            else {
                setFetchingPendingWithdrawalData_initial(false)
                setPendingWithdrawalDataSuccess(false)
            }
        }
    }

    getPendingWithdrawal_refresh = async (
        setFetchingPendingWithdrawalData_refresh,
        setPendingWithdrawalData
    ) => {
        setFetchingPendingWithdrawalData_refresh(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/withdrawal/get-all-transactions/?status=pending`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setPendingWithdrawalData(data.data)
            setFetchingPendingWithdrawalData_refresh(false)
        }
        catch (err) {
            if (err.response) {
                setFetchingPendingWithdrawalData_refresh(false)
            }
            else {
                setFetchingPendingWithdrawalData_refresh(false)
            }
        }
    }

    getRejectedWithdrawal_initial = async (
        setFetchingRejectedWithdrawalData_initial,
        setRejectedWithdrawalDataSuccess,
        setRejectedWithdrawalData
    ) => {
        setFetchingRejectedWithdrawalData_initial(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/withdrawal/get-all-transactions/?status=rejected`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setRejectedWithdrawalData(data.data)
            setFetchingRejectedWithdrawalData_initial(false)
            setRejectedWithdrawalDataSuccess(true)
        }
        catch (err) {
            if (err.response) {
                setFetchingRejectedWithdrawalData_initial(false)
                setRejectedWithdrawalDataSuccess(false)
            }
            else {
                setFetchingRejectedWithdrawalData_initial(false)
                setRejectedWithdrawalDataSuccess(false)
            }
        }
    }

    getRejectedWithdrawal_refresh = async (
        setFetchingRejectedWithdrawalData_refresh,
        setRejectedWithdrawalData
    ) => {
        setFetchingRejectedWithdrawalData_refresh(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/withdrawal/get-all-transactions/?status=rejected`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setRejectedWithdrawalData(data.data)
            setFetchingRejectedWithdrawalData_refresh(false)
        }
        catch (err) {
            if (err.response) {
                setFetchingRejectedWithdrawalData_refresh(false)
            }
            else {
                setFetchingRejectedWithdrawalData_refresh(false)
            }
        }
    }

    getConfirmedWithdrawal_initial = async (
        setFetchingConfirmedWithdrawalData_initial,
        setConfirmedWithdrawalDataSuccess,
        setConfirmedWithdrawalData,
    ) => {
        setFetchingConfirmedWithdrawalData_initial(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/withdrawal/get-all-transactions/?status=confirmed`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setConfirmedWithdrawalData(data.data)
            setFetchingConfirmedWithdrawalData_initial(false)
            setConfirmedWithdrawalDataSuccess(true)
        }
        catch (err) {
            if (err.response) {
                setFetchingConfirmedWithdrawalData_initial(false)
                setConfirmedWithdrawalDataSuccess(false)
            }
            else {
                setFetchingConfirmedWithdrawalData_initial(false)
                setConfirmedWithdrawalDataSuccess(false)
            }
        }
    }

    getConfirmedWithdrawal_refresh = async (
        setFetchingConfirmedWithdrawalData_refresh,
        setConfirmedWithdrawalData
    ) => {
        setFetchingConfirmedWithdrawalData_refresh(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/withdrawal/get-all-transactions/?status=confirmed`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setConfirmedWithdrawalData(data.data)
            setFetchingConfirmedWithdrawalData_refresh(false)
        }
        catch (err) {
            if (err.response) {
                setFetchingConfirmedWithdrawalData_refresh(false)
            }
            else {
                setFetchingConfirmedWithdrawalData_refresh(false)
            }
        }
    }

    confirmWithdrawal = async (
        id,
        setConfirmingWithdrawal,
        setConfirmingWithdrawalSuccess,
        setFetchingPendingWithdrawalData_refresh,
        setPendingWithdrawalData,
        setShowPendingWithdrawalModal,
        setSelectedData,
        type,
        selectedUser,
        setUserData_admin,
        setFetchingUserData_admin_refesh,
    ) => {
        setConfirmingWithdrawal(true)
        try {
            const { data } = await axios.put(`${BASE_URL}/withdrawal/confirm/${id}`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            // refresh transactions
            type === 'hx' ?
                this.fetchUserHistory_admin_refresh(selectedUser, setUserData_admin, setFetchingUserData_admin_refesh) :
                this.getPendingWithdrawal_refresh(setFetchingPendingWithdrawalData_refresh, setPendingWithdrawalData)

            setConfirmingWithdrawal(false)
            setConfirmingWithdrawalSuccess(true)
            toast(data.msg, { type: 'success' });
            setShowPendingWithdrawalModal(false);
            setSelectedData("")
        }
        catch (err) {
            if (err.response) {
                setConfirmingWithdrawal(false)
                setConfirmingWithdrawalSuccess(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setConfirmingWithdrawal(false)
                setConfirmingWithdrawalSuccess(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    rejectWithdrawal = async (
        id,
        setRejectingWithdrawal,
        setRejectingWithdrawalSuccess,
        setFetchingPendingWithdrawalData_refresh,
        setPendingWithdrawalData,
        setShowPendingWithdrawalModal,
        setSelectedData,
        type,
        selectedUser,
        setUserData_admin,
        setFetchingUserData_admin_refesh,
    ) => {
        setRejectingWithdrawal(true)
        try {
            const { data } = await axios.put(`${BASE_URL}/withdrawal/reject/${id}`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            // refresh transactions
            type === 'hx' ?
                this.fetchUserHistory_admin_refresh(selectedUser, setUserData_admin, setFetchingUserData_admin_refesh) :
                this.getPendingWithdrawal_refresh(setFetchingPendingWithdrawalData_refresh, setPendingWithdrawalData)


            setRejectingWithdrawal(false)
            setRejectingWithdrawalSuccess(true)

            toast(data.msg, { type: 'success' })
            setShowPendingWithdrawalModal(false);
            setSelectedData("")
        }
        catch (err) {
            if (err.response) {
                setRejectingWithdrawal(false)
                setRejectingWithdrawalSuccess(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setRejectingWithdrawal(false)
                setRejectingWithdrawalSuccess(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    fetchUserHistory_user = async (
        setUserData_user,
        setFetchingUserData_user,
        setUserDataSuccess_user,
    ) => {
        setFetchingUserData_user(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/history/user/`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });

            setFetchingUserData_user(false)
            setUserDataSuccess_user(true)
            setUserData_user(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingUserData_user(false)
                setUserDataSuccess_user(false)
            }
            else {
                setFetchingUserData_user(false)
                setUserDataSuccess_user(false)
            }
        }
    }

    fetchUserHistory_admin = async (
        id,
        setUserData_admin,
        setFetchingUserData_admin,
        setUserDataSuccess_admin,
    ) => {
        setFetchingUserData_admin(true)
        try {
            const { data } = await axios.get(`${BASE_URL}/history/user_admin/${id}`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            setFetchingUserData_admin(false)
            setUserDataSuccess_admin(true)
            setUserData_admin(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingUserData_admin(false)
                setUserDataSuccess_admin(false)
            }
            else {
                setFetchingUserData_admin(false)
                setUserDataSuccess_admin(false)
            }
        }
    }

    fetchUserHistory_admin_refresh = async (
        id,
        setUserData_admin,
        setFetchingUserData_admin_refesh,
    ) => {
        setFetchingUserData_admin_refesh(true)

        try {
            const { data } = await axios.get(`${BASE_URL}/history/user_admin/${id}`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            setFetchingUserData_admin_refesh(false)
            setUserData_admin(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingUserData_admin_refesh(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setFetchingUserData_admin_refesh(false)
            }
        }
    }

    creaditUser = async (
        data_,
        id,
        setCreditingUser,
        showOpenCreditUserModal,
        setUserData_admin,
        setFetchingUserData_admin_refesh,
        setInp
    ) => {
        setCreditingUser(true)

        try {
            const { data } = await axios.put(`${BASE_URL}/payusers/${id}`, data_, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            this.fetchUserHistory_admin_refresh(id, setUserData_admin, setFetchingUserData_admin_refesh)

            setCreditingUser(false)
            toast(data.msg, { type: 'success' });

            showOpenCreditUserModal(false);
            setInp({
                amount: null,
                action: ""
            })
        }
        catch (err) {
            if (err.response) {
                setCreditingUser(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setCreditingUser(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    pushNotification_admin = async (
        inp,
        setSendingNotificatio_admin,
        setInp,
        setProfileData,
        setProfileLoadingAgain
    ) => {
        setSendingNotificatio_admin(true)

        try {
            const { data } = await axios.post(`${BASE_URL}/notifications/admin/push`, inp, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });
            // refresh profile data
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain)

            setSendingNotificatio_admin(false)
            toast(data.msg, { type: 'success' });
            setInp({ text: '', title: '' })
        }
        catch (err) {
            if (err.response) {
                setSendingNotificatio_admin(false)
                toast(err.response.data.msg, { type: 'error' })
            }
            else {
                setSendingNotificatio_admin(false)
                toast(err.message, { type: 'error' })
            }
        }
    }

    fetchNotification_admin = async (
        setFetchingNotification_admin,
        setFetchNotificationSuccess_admin,
        setNotificationData_admin,
    ) => {
        setFetchingNotification_admin(true)

        try {
            const { data } = await axios.get(`${BASE_URL}/notifications/admin/`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            setFetchingNotification_admin(false)
            setFetchNotificationSuccess_admin(true)
            setNotificationData_admin(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingNotification_admin(false);
                setFetchNotificationSuccess_admin(false)
            }
            else {
                setFetchingNotification_admin(false);
                setFetchNotificationSuccess_admin(false)
            }
        }
    }

    fetchOneNotification_admin = async (
        id,
        setFetchingOneNotification,
        setFetchOneNotificationSuccess,
        setSelectedNotification
    ) => {
        setFetchingOneNotification(true)

        try {
            const { data } = await axios.get(`${BASE_URL}/notifications/admin/${id}`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            setFetchingOneNotification(false)
            setFetchOneNotificationSuccess(true)
            setSelectedNotification(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingOneNotification(false);
                setFetchOneNotificationSuccess(false)
            }
            else {
                setFetchingOneNotification(false);
                setFetchOneNotificationSuccess(false)
            }
        }
    }

    readNotification_user = async (
        data_,
        setReadingNotification,
        setReadingNotificationSuccess,
        setProfileData,
        setProfileLoadingAgain,
        navigate,
        setSelectedNotification,
        setFetchOneNotificationSuccess
    ) => {
        setReadingNotification(true)
        const id = data_._id;
        try {
            const { data } = await axios.put(`${BASE_URL}/notifications/read/${id}`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });
            // refresh profile data
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain);
            setSelectedNotification(data_)
            setReadingNotification(false)
            setReadingNotificationSuccess(true);
            setFetchOneNotificationSuccess(true)
            navigate(`/dashboard/notifications/${data_._id}`)

        }
        catch (err) {
            if (err.response) {
                setReadingNotification(false);
                setFetchOneNotificationSuccess(false)
                setReadingNotificationSuccess(false)
            }
            else {
                setReadingNotification(false);
                setFetchOneNotificationSuccess(false)
                setReadingNotificationSuccess(false)
            }
        }
    }

    deleteeNotification_user = async (
        id,
        setDeletetingNotification,
        setProfileData,
        setProfileLoadingAgain,
        navigate
    ) => {
        setDeletetingNotification(true)

        try {
            const { data } = await axios.put(`${BASE_URL}/notifications/delete/${id}`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });
            // refresh profile data
            this.fetchProfileAgain(setProfileData, setProfileLoadingAgain);
            toast(data.msg, { type: 'success' });

            setDeletetingNotification(false)
            navigate(`/dashboard/notifications`)

        }
        catch (err) {
            if (err.response) {
                setDeletetingNotification(false);
                toast(err.response.data.msg, { type: 'error' });
            }
            else {
                setDeletetingNotification(false);
                toast(err.message, { type: 'error' });
            }
        }
    }

    contactAdmin = async (
        inp,
        setSendingMsg,
        setInp
    ) => {
        setSendingMsg(true)

        try {
            const { data } = await axios.put(`${BASE_URL}/profile/contact-admin/`, inp, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`
                }
            });

            setSendingMsg(false)
            toast(data.msg, { type: 'success' });
            setInp({ subject: '', message: '' })
        }
        catch (err) {
            if (err.response) {
                setSendingMsg(false);
                toast(err.response.data.msg, { type: 'error' });
            }
            else {
                setSendingMsg(false);
                toast(err.message, { type: 'error' });
            }
        }
    }

    sendAdminQuestion = async (
        inp,
        setSendingQusMsg,
        setInp
    ) => {
        setSendingQusMsg(true)

        try {
            const { data } = await axios.post(`${BASE_URL}/message/send-admin/`, inp);

            setSendingQusMsg(false)
            toast(data.msg, { type: 'success' });
            setInp({ subject: '', message: '', email: '' })
        }
        catch (err) {
            if (err.response) {
                setSendingQusMsg(false);
                toast(err.response.data.msg, { type: 'error' });
            }
            else {
                setSendingQusMsg(false);
                toast(err.message, { type: 'error' });
            }
        }
    }

    fetchContestants_initial = async (
        setFetchingContestants_initial,
        setFetchingContestantSuccess,
        setContestantData
    ) => {
        setFetchingContestants_initial(true)

        try {
            const { data } = await axios.get(`${BASE_URL}/referral/contest/contestants/`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                }
            });

            setFetchingContestants_initial(false)
            setFetchingContestantSuccess(true)
            setContestantData(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingContestants_initial(false);
                setFetchingContestantSuccess(false)
            }
            else {
                setFetchingContestants_initial(false);
                setFetchingContestantSuccess(false)
            }
        }
    }

    fetchContestants_refresh = async (
        setFetchingContestants_refresh,
        setContestantData
    ) => {
        setFetchingContestants_refresh(true)

        try {
            const { data } = await axios.get(`${BASE_URL}/referral/contest/contestants/`, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                }
            });

            setFetchingContestants_refresh(false)
            setContestantData(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchingContestants_refresh(false);
            }
            else {
                setFetchingContestants_refresh(false);
            }
        }
    }

    resetContest = async (
        setReseting,
        setFetchingContestants_refresh,
        setContestantData
    ) => {
        setReseting(true)

        try {
            const { data } = await axios.put(`${BASE_URL}/referral/contest/reset/`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            // refresh contestants data
            this.fetchContestants_refresh(setFetchingContestants_refresh, setContestantData)
            setReseting(false)
            toast(data.msg, { type: 'success' });
        }
        catch (err) {
            if (err.response) {
                setReseting(false);
                toast(err.response.data.msg, { type: 'error' });
            }
            else {
                setReseting(false);
                toast(err.message, { type: 'error' });
            }
        }
    }

    resolveContest = async (
        setResolving,
        setFetchingContestants_refresh,
        setContestantData
    ) => {
        setResolving(true)

        try {
            const { data } = await axios.put(`${BASE_URL}/referral/contest/resolve/`, {}, {
                headers: {
                    'authorization': `Bearer ${Cookies.get('accesstoken')}`,
                    'authorization-admin': `Bearer ${Cookies.get('extratoken')}`
                }
            });

            // refresh contestants data
            this.fetchContestants_refresh(setFetchingContestants_refresh, setContestantData)
            setResolving(false)
            toast(data.msg, { type: 'success' });
        }
        catch (err) {
            if (err.response) {
                setResolving(false);
                toast(err.response.data.msg, { type: 'error' });
            }
            else {
                setResolving(false);
                toast(err.message, { type: 'error' });
            }
        }
    }

    fetchLatestDeposit = async (
        setFetchLatestDeposit,
        setFetchLatestDepositSuccess,
        setLatestDepositData,
    ) => {
        setFetchLatestDeposit(true)

        try {
            const { data } = await axios.get(`${BASE_URL}/deposit/latest/`);
            setFetchLatestDeposit(false);
            setLatestDepositData(data.data);
            setFetchLatestDepositSuccess(true);
        }
        catch (err) {
            if (err.response) {
                setFetchLatestDeposit(false);
                setFetchLatestDepositSuccess(false);
            }
            else {
                setFetchLatestDeposit(false);
                setFetchLatestDepositSuccess(false);
            }
        }
    }

    fetchLatestWithdrawal = async (
        setFetchLatestWithdrawal,
        setFetchLatestWithdrawalSuccess,
        setLatestWithdrawalData,
    ) => {
        setFetchLatestWithdrawal(true)

        try {
            const { data } = await axios.get(`${BASE_URL}/withdrawal/latest/`);
            setFetchLatestWithdrawal(false);
            setFetchLatestWithdrawalSuccess(true);
            setLatestWithdrawalData(data.data)
        }
        catch (err) {
            if (err.response) {
                setFetchLatestWithdrawal(false);
                setFetchLatestWithdrawalSuccess(false);
            }
            else {
                setFetchLatestWithdrawal(false);
                setFetchLatestWithdrawalSuccess(false);
            }
        }
    }
}


export default apiClass;