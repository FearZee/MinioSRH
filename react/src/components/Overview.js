import React, {useEffect, useState} from "react";
import {useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Badge, Button, ListGroup} from 'react-bootstrap';

export const Overview = ({dir}) => {

    const navigate = useNavigate ();
    const [items, setItems] = useState([]);
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [isSelected, setIsSelected] = useState(false);

    const fetchItems = async () => {
        const res = await fetch(`http://localhost:3000/items?name=test`);
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
            navigate(`/dir/${item.name}`)
        }

        if(item.type === undefined){
            console.log('downloadfile')
            const filename = item.name.split('/')
            const res = await fetch(`http://localhost:3000/item?name=test&path=${item.name}&filename=${item.name}`)

            if(res.status === 200){
                let blob = await res.blob();
                const imageObjectURL = URL.createObjectURL(blob);
                let fileLink = document.createElement('a');
                fileLink.href = imageObjectURL;
                fileLink.download = item.name;
                fileLink.click()
                // window.open(imageObjectURL, "_blank")
            }
        }
    }

    const handleShare = async (item) => {
        const filename = item.name.split('/')
        if(item.type === 'dir'){
            const res = await fetch(`http://localhost:3000/item-share?name=test&prefix=${filename[0]}`)
        }else if(filename.length >= 2){
            const res = await fetch(`http://localhost:3000/item-share?name=test&prefix=${filename[0]}&filename=${filename[1]}`)
        }else {
            const res = await fetch(`http://localhost:3000/item-share?name=test&prefix=""&filename=${filename[0]}`)
        }

    }

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsSelected(true);
    };

    const changeHandlerDir = (event) => {
        console.log(event.target.files)
        setSelectedFile(event.target.files);
        setIsSelected(true);
    };

    const handleSubmission = async () => {
        console.log(selectedFile)
        if(selectedFile.length > 1){
            for(let i = 0; i < selectedFile.length; i++){
                const formData = new FormData();

                formData.set('file', selectedFile[i]);
                formData.set('pathtest', selectedFile[i].webkitRelativePath);
                const res = await fetch('http://localhost:3000/upload-files', {
                    method: 'POST',
                    body: formData
                })
                if(res.status === 200){
                    console.log('uploaded');
                }
            }
        }else {
            const formData = new FormData();

            formData.append('file', selectedFile);

            fetch('http://localhost:3000/upload', {
                    method: 'POST',
                    body: formData
                }
            )
                .then((response) => response.json())
                .then((result) => {
                    console.log('Success:', result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    };

    return (
        <div className={'m-2'}>
            <h1>Files</h1>

            <div>
                Upload file
                <input className={'form-control me-2'} onChange={changeHandler} type="file" id="picker" name="fileList"/>
                Upload Folder
                <input className={'form-control me-2'}  onChange={changeHandlerDir} type="file" id="picker" name="fileList" directory="" webkitdirectory="" multiple />
                <Button variant={"primary my-2"} onClick={handleSubmission}>Upload</Button>
            </div>
            <h3><Badge bg="secondary">root</Badge></h3>
            <ListGroup className={"mt-2"}>
                {items.map((item) => {
                    return <ListGroup.Item className={"d-flex justify-content-between"} key={item.name} >
                        {item.name}
                        <div>
                            <Button variant={"secondary mx-2"} onClick={() => handleClick(item)}>download</Button>
                            <Button variant={"secondary"} onClick={() => handleShare(item)}>Share</Button>
                        </div>
                    </ListGroup.Item>
                })}
            </ListGroup>
        </div>
    )
}