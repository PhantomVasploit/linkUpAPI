import http from 'k6/http'
import {sleep, check} from 'k6'

export const options ={
    vus: 5,
    duration: '1m'
}

export default function(){
    const url = 'http://127.0.0.1:8080/api/link-up/v1/posts'
    

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }   
    }

    const response = http.get(url, params)

    check(response, {
        'is status 200': (res)=>res.status === 200,
        'is fetch successful': (res)=> res.body.includes('Fetch successful')
    })
    sleep(1)
}