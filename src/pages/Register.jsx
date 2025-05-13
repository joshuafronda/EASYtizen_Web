import '../App.css'
import { Box } from '@mui/material'
import TextField from '../components/common/Forms/Textfield'
import Passfield from '../components/common/Forms/Passfield'
import Button from '../components/common/Forms/Button'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import AxiosInstance from '../components/AxiosInstance'
import { useNavigate } from 'react-router-dom'


const Register = () =>{
    const navigate = useNavigate()
    const {handleSubmit, control} = useForm()

    const submission = (data) => {
        AxiosInstance.post(`register/`,{
            email: data.email, 
            password: data.password,
        })

        .then(() => {
            navigate(`/`)
        }
        )
    }

    return(
        <div className={"myBackground"}> 

            <form onSubmit={handleSubmit(submission)}>
                
               
            <Box className={"whiteBox"}>

                <Box className={"itemBox"}>
                    <Box className={"title"}> User registration </Box>
                </Box>

                <Box className={"itemBox"}>
                    <TextField
                    label={"Email"}
                    name ={"email"}
                    control={control}
                    />
                </Box>

                <Box className={"itemBox"}>
                    <Passfield
                    label={"Password"}
                    name={"password"}
                    control={control}
                    />
                </Box>

                <Box className={"itemBox"}>
                    <Passfield
                    label={"Confirm password"}
                    name={"password2"}
                    control={control}
                    />
                </Box>

                <Box className={"itemBox"}>
                    <Button 
                        type={"submit"}
                        label={"Register"}
                    />
                </Box>

                <Box className={"itemBox"}>
                    <Link to="/"> Already registered? Please login! </Link>
                </Box>


            </Box>

            </form> 
            
        </div>
    )

}

export default Register