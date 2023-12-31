import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import axiosReq from "../config/axios"
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";
import { AnimatePresence, useAnimate } from 'framer-motion';
import logout from '../assets/logout.png'
import Alert from "./Alert";
import AlertInterface from '../interfaces/alert.interface';
import { userData } from "../interfaces/user.interface";

type settingsProps = {
    userId: string | undefined;
    refreshProfile: () => void;
}


const ProfileSettings: React.FC<settingsProps> = ({userId, refreshProfile}) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<userData>({
        name: '',
        userInfo: '',
        phone: undefined,
        profileImage:''
    })

    const [loading, setLoading] = useState(true)
    const [scope, animate] = useAnimate()
    const { saveAuthData } = useAuth()
    const [alert, setAlert] = useState<AlertInterface>()
    const userID = localStorage.getItem('typechat_userId')
    const token = localStorage.getItem('typechat_token')
    const authHeader = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    const formAuthHeader = {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
        }
    }

    const getProfileData = async () => {
        try {
            const response = await axiosReq.get('/user/getdata/'+userID, authHeader)
            setUserData(response.data.response_data)
            refreshProfile();
            setLoadingTimeout()
        } catch (error) {
            console.log(error)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axiosReq.put('/user/update', userData, authHeader)  
            handleAlert({ msg: '¡Los cambios han sido guardados!', error: true, alertType: 'OK_ALERT' });
            hideAlert()
            setUserData(response.data.response_data)
            refreshProfile();
            setLoadingTimeout()
            animate(scope.current, {opacity: 0 },  {duration: .7})     
                      
        } catch (error) {
            console.log(error);
        }

    }

    const setLoadingTimeout = () => {
        animate(scope.current, {opacity: 0 },  {duration: .5}) 
        setTimeout(() => {
            setLoading(false)
        }, 500);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({...userData, [e.target.name]: e.target.value})
    }

    const logOut = () => {
        localStorage.removeItem('typechat_userId');
        localStorage.removeItem('typechat_token');
        saveAuthData({
            userID: '',
            token: ''
        })
        navigate('/login')
    }

    const handleClick = () => {
        const fileInput = document.querySelector('.inputField') as HTMLElement
        if(fileInput != null){
            fileInput.click()
        }
    }

    const handleAlert = (e:AlertInterface) => {
        setAlert(e)
    }

    const hideAlert = () => {
        setTimeout(() => {
            handleAlert({error: false, alertType: 'ERROR_ALERT', msg: ''});
        }, 3000);
    }

    const handleFileInput = async (e:React.ChangeEvent<HTMLInputElement>) => {
        let image
        if(e.target.files?.length != undefined){
            image = e.target.files[0]
            if(image.type == 'image/jpeg' || image.type == 'image/png' || image.type == 'image/webp' || image.type == 'image/jpg'){
                updateProfileImage(image)
            } else {
                handleAlert({ msg: 'Formato de archivo incorrecto', error: true, alertType: 'ERROR_ALERT' });
                hideAlert()
            }
        } 
    }

    const updateProfileImage = async (image: File) => {
        const formData = new FormData();
        formData.append('profile-image', image);
        try {
            await axiosReq.post('/user/update/profile-pic', formData, formAuthHeader);
            handleAlert({ msg: '¡Tu foto de perfil ha sido cambiada!', error: true, alertType: 'OK_ALERT' });
            hideAlert()
            refreshProfile();
            getProfileData();
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        setLoading(true)
        getProfileData()
    }, [userId])

    return (
        <>
            
            { loading &&
                <div ref={scope} className="absolute z-40 text-white mainContSettingsSpinner" style={{width: '288px', height:'390px', boxShadow: 'none'}}>
                    <Spinner/>                
                </div>
            }

            <div className="absolute z-30 text-white mainContSettings w-72 h-fit ">
                <div className="flex flex-col items-center gap-5">
                    <div onClick={ handleClick } className="rounded-full inputFileForm" title="Cambiar foto de perfil" >
                        <img className="w-16 rounded-full" src={`${import.meta.env.VITE_BACKEND_URL}/api/user/getprofilepic/`+userData.profileImage} alt="" />
                        <input onChange={handleFileInput} type="file" className="inputField" accept="image/*" hidden />
                    </div>

                    <div>
                        <form onSubmit={handleSubmit} action="" className="flex flex-col items-center gap-2 ">
                            <div className="flex flex-col">
                                <span className="text-xs">Nombre de usuario</span>
                                <input  className=" bg-zinc-900 rounded-lg py-0.5 px-2 text-sm" onChange= {handleChange} value={userData?.name} name="name" type="text" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs">Estado</span>
                                <input  className=" bg-zinc-900 rounded-lg py-0.5 px-2 text-sm" onChange= {handleChange} value={userData?.userInfo} name="userInfo" type="text" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs">Número de teléfono</span>
                                <input  className=" bg-zinc-900 rounded-lg py-0.5 px-2 text-sm" onChange= {handleChange} value={userData?.phone} name="phone" type="number" />
                            </div>
                            <button className="px-3 py-1 mt-3 text-sm rounded-xl bg-zinc-900 w-fit h-fit">Guardar cambios</button>
                        </form>
                        <button onClick={logOut} className="px-2 py-2 mx-auto mt-3 text-sm bg-red-900 rounded-xl w-fit h-fit">
                            <img className="w-4 mx-auto my-auto" src={logout} alt="" title="Cerrar sesión" />
                        </button>
                    </div>

                </div>
            </div>

            <AnimatePresence>

                { alert?.error && <Alert msg={alert.msg} error={alert.error} alertType={alert?.alertType}  /> }

            </AnimatePresence>
        
        
        </>
    )
}

export default ProfileSettings