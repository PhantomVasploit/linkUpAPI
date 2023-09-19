import http from 'k6/http'
import {sleep, check} from 'k6'

export const options ={
    stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 100 },
        {duration: '1m', target: 0}
    ]
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
        'is successfully logged in': (res)=> res.body.includes('Fetch successful')
    })
    sleep(1)
}