import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom'
import {Badge, Button, ListGroup} from "react-bootstrap";

export const Folder = () => {

    const navigate = useNavigate ();
    const params = useParams();
    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        const res = await fetch(`http://localhost:3000/items-in-dir?name=test&prefix=${params.dir}`);
        if(res.status === 200){
            const json = await res.json();
            setItems(json);
        }
    }

    useEffect(() => {
        fetchItems();
    },[])

    const handleClick = async (item) => {
        if(item.type === 'dir'){
            console.log('open new dir')
            navigate(`/${item.name}`)
        }

        if(item.type === undefined){
            console.log('downloadfile')
            const filename = item.name.split('/')
            const res = await fetch(`http://localhost:3000/item?name=test&path=${item.name}&filename=${filename[1]}`)

            if(res.status === 200){
                let blob = await res.blob();
                const imageObjectURL = URL.createObjectURL(blob);
                let fileLink = document.createElement('a');
                fileLink.href = imageObjectURL;
                fileLink.download = filename[1];
                fileLink.click()
                // window.open(imageObjectURL, "_blank")
            }
        }
    }

    return (
        <div>
            <h2>Files</h2>
            <h2>root/{params.dir}</h2>
            <h3><Badge bg="secondary">root</Badge><Badge bg="primary">{params.dir}</Badge></h3>
            <ListGroup className={"mt-2"}>
                {items.map((item) => {
                    return <ListGroup.Item className={"d-flex justify-content-between"} key={item.name} >
                        {item.name}
                        <div>
                            <Button variant={"secondary mx-2"} onClick={() => handleClick(item)}>download</Button>
                        </div>
                    </ListGroup.Item>
                })}
            </ListGroup>
        </div>
    )
}