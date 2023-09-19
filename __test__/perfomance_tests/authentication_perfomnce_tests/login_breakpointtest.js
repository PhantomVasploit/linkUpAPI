import http from 'k6/http'
import {sleep, check} from 'k6'

export const options ={
    executor: 'ramping-arrival-rate',
    stages: [
        {duration: '1h', target: 20000}
    ]
}

export default function(){
    const url = 'http://127.0.0.1:8080/api/link-up/v1/login'
    const body = JSON.stringify({
        email: 'paulsanganyamawi@gmail.com',
        userPassword: 'pajoy9903'
    })

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }   
    }

    const response = http.post(url, body, params)

    check(response, {
        'is status 200': (res)=>res.status === 200,
        'is successfully logged in': (res)=> res.body.includes('login successful')
    })
    sleep(1)
}