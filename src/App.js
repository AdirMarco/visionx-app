/*
///Intenal Storage
import { useState } from 'react';
import './App.css';
const uuid = require('uuid');

function App() {
    const [image, setImage] = useState('');
    const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate.')
    const [visitorName, setVisitorName] = useState('placeholder.jpeg');
    const [isAuth, setAuth] = useState(false);

    function sendImage(e) {
        e.preventDefault();
        setVisitorName(image.name);
        const visitorImageName = uuid.v4();
        fetch(`https://7vmgtv3ch7.execute-api.us-east-1.amazonaws.com/dev/visionx-visitor-image-storage/${visitorImageName}.jpeg`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'image/jpeg'
            },
            body: image
        }).then(async () => {
            const response = await authenticate(visitorImageName);
            if (response.Message === 'Success') {
                setAuth(true);
                setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, Wellcome to work`)
            } else {
                setAuth(false);
                setUploadResultMessage('Authentication Failed: This person is not an employee.')
            }
        }).catch(error => {
            setAuth(false);
            setUploadResultMessage('There is an error during the authentication process. please try again.')
            console.error(error);
        })        
    }

    async function authenticate(visitorImageName) {
        const requestUrl = 'https://7vmgtv3ch7.execute-api.us-east-1.amazonaws.com/dev/employee?' + new URLSearchParams({
            objectKey: `${visitorImageName}.jpeg`
        });
        return await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        .then((data) => {
            return data;
        }).catch(error => console.error(error));
    }

    return (
        <div className="App">
        <h2>VisionX Facial Recognition App</h2>
        
        <form onSubmit={sendImage}>
            <input type='file' name='image' onChange={e => setImage(e.target.files[0])}/>
            <button type='submit'>Authenticate</button>
        </form>
        <div className={isAuth ? 'success' : 'failure' }>{uploadResultMessage}</div>
        <img src={ require(`./visitors/${visitorName}`) } alt="Visitor" height={250} width={250}/>
        </div>
        );
    }

export default App;*/


//---------------------------------------------------------------------------------

/*
//LIVE
import React, { useState, useRef } from 'react';
import './App.css';
import Webcam from 'react-webcam';
const uuid = require('uuid');

function App() {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);
    const [uploadResultMessage, setUploadResultMessage] = useState('Please capture an image to authenticate.');
    const [isAuth, setAuth] = useState(false);

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
    };

    function sendImage(e) {
        e.preventDefault();
        if (!image) {
            alert("Please capture an image first.");
            return;
        }

        // Convert base64 image to Blob
        const fetchBlob = async () => {
            const response = await fetch(image);
            const blob = await response.blob();
            return blob;
        };

        const visitorImageName = uuid.v4();
        fetchBlob().then(blob => {
            return fetch(`https://7vmgtv3ch7.execute-api.us-east-1.amazonaws.com/dev/visionx-visitor-image-storage/${visitorImageName}.jpeg`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'image/jpeg'
                },
                body: blob
            })
        }).then(async response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await authenticate(visitorImageName);
        }).then(response => {
            if (response.Message === 'Success') {
                setAuth(true);
                setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, Welcome to work`)
            } else {
                setAuth(false);
                setUploadResultMessage('Authentication Failed: This person is not an employee.')
            }
        }).catch(error => {
            setAuth(false);
            setUploadResultMessage('There is an error during the authentication process. Please try again.')
            console.error(error);
        })        
    }

    async function authenticate(visitorImageName) {
        const requestUrl = 'https://7vmgtv3ch7.execute-api.us-east-1.amazonaws.com/dev/employee?' + new URLSearchParams({
            objectKey: `${visitorImageName}.jpeg`
        });
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch authentication data');
        }
        return response.json();
    }

    return (
        <div className="App">
            <h2>VisionX Facial Recognition App</h2>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
            />
            <button onClick={capture}>Capture Photo</button>
            <form onSubmit={sendImage}>
                <button type='submit'>Authenticate</button>
            </form>
            <div className={isAuth ? 'success' : 'failure'}>{uploadResultMessage}</div>
            {image && <img src={image} alt="Captured" height={250} width={250}/>}
        </div>
    );
}

export default App;
*/


//------------------tests

/*
//עובד נהדר לזיהוי פנים מקומי ללא אימות
import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

function App() {
    const webcamRef = useRef(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [detectionResult, setDetectionResult] = useState('No face detected');

    useEffect(() => {
        // Load face-api.js models
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                setModelLoaded(true);
                console.log('Models loaded successfully');
            } catch (err) {
                console.error('Error loading models:', err);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (modelLoaded) {
            // Start face detection if models are loaded
            const interval = setInterval(async () => {
                if (webcamRef.current && webcamRef.current.video.readyState === 4) {
                    const detections = await faceapi.detectAllFaces(
                        webcamRef.current.video,
                        new faceapi.TinyFaceDetectorOptions()
                    );
                    if (detections.length > 0) {
                        setDetectionResult('Face detected');
                    } else {
                        setDetectionResult('No face detected');
                    }
                }
            }, 100); // Check every 0.1  second for face detection

            return () => clearInterval(interval);
        }
    }, [modelLoaded]);

    return (
        <div>
            <h2>Face Detection Status</h2>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="50%"
            />
            <div>{detectionResult}</div>
        </div>
    );
}

export default App;
*/

import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import './App.css'; // Import the CSS file
const uuid = require('uuid');

function App() {
    const webcamRef = useRef(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [detectionResult, setDetectionResult] = useState('System is OFF. Turn it ON to enable identification.');
    const [isAuth, setAuth] = useState(false);
    const [uploadResultMessage, setUploadResultMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastDetectedFace, setLastDetectedFace] = useState(null);
    const [systemActive, setSystemActive] = useState(false); // Default OFF state

    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                setModelLoaded(true);
                console.log('Models loaded successfully');
            } catch (err) {
                console.error('Error loading models:', err);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (modelLoaded && systemActive && !isProcessing) {
            const interval = setInterval(async () => {
                if (webcamRef.current && webcamRef.current.video.readyState === 4) {
                    const detections = await faceapi.detectAllFaces(
                        webcamRef.current.video,
                        new faceapi.TinyFaceDetectorOptions()
                    );
                    if (detections.length > 0 && !isProcessing) {
                        const currentFaceDescriptor = detections[0].descriptor;
                        if (!lastDetectedFace || faceapi.euclideanDistance(lastDetectedFace, currentFaceDescriptor) > 0.6) {
                            setLastDetectedFace(currentFaceDescriptor);
                            setDetectionResult('Face detected');
                            capture();
                        }
                    } else if (detections.length === 0) {
                        setDetectionResult('No face detected');
                        setLastDetectedFace(null);
                    }
                }
            }, 500); // Check every 0.5 second for face detection

            return () => clearInterval(interval);
        }
    }, [modelLoaded, isProcessing, lastDetectedFace, systemActive]);

    const capture = () => {
        if (webcamRef.current && !isProcessing) {
            setIsProcessing(true);
            const imageSrc = webcamRef.current.getScreenshot();
            sendImage(imageSrc);
        }
    };

    const sendImage = (imageSrc) => {
        if (!imageSrc) return;

        const fetchBlob = async () => {
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            return blob;
        };

        const visitorImageName = uuid.v4();
        fetchBlob().then(blob => {
            return fetch(`https://7vmgtv3ch7.execute-api.us-east-1.amazonaws.com/dev/visionx-visitor-image-storage/${visitorImageName}.jpeg`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'image/jpeg'
                },
                body: blob
            });
        }).then(async response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await authenticate(visitorImageName);
        }).then(response => {
            if (response.Message === 'Success') {
                setAuth(true);
                setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, Welcome to work`);
            } else if (response.Message === 'Failed') {
                setAuth(false);
                setUploadResultMessage('Authentication Failed: This person is not an employee.');
            } else {
                throw new Error('Unexpected response message');
            }
        }).catch(error => {
            setAuth(false);
            if (error.message === 'Unexpected response message') {
                setUploadResultMessage('There was an issue processing the authentication. Please try again.');
            } else {
                setUploadResultMessage('There is an error during the authentication process. Please try again.');
            }
            console.error(error);
        }).finally(() => {
            setTimeout(() => {
                setIsProcessing(false); // Allow the system to be ready for the next face
                if (systemActive) {
                    setDetectionResult('Ready for next face');
                } else {
                    setDetectionResult('System is OFF. Turn it ON to enable identification.');
                }
                setUploadResultMessage('');
                setAuth(false);
            }, 5000); // 5 seconds delay before resetting
        });
    };

    const authenticate = async (visitorImageName) => {
        const requestUrl = 'https://7vmgtv3ch7.execute-api.us-east-1.amazonaws.com/dev/employee?' + new URLSearchParams({
            objectKey: `${visitorImageName}.jpeg`
        });
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch authentication data');
        }
        return response.json();
    };

    const toggleSystem = () => {
        const newSystemState = !systemActive;
        setSystemActive(newSystemState);
        if (!newSystemState) {
            setDetectionResult('System is OFF. Turn it ON to enable identification.');
            setLastDetectedFace(null);
            setIsProcessing(false);
            setUploadResultMessage('');
        } else {
            setDetectionResult('Ready for next face');
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="brand-name">visionX</h1>
                <button className="toggle-button" onClick={toggleSystem}>
                    {systemActive ? 'Turn OFF' : 'Turn ON'}
                </button>
            </header>
            <main className="app-main">
                {systemActive && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="webcam-feed"
                    />
                )}
                <div className="status-message">{detectionResult}</div>
                <div className={`result-message ${isAuth ? 'success' : 'failure'}`}>
                    {uploadResultMessage}
                </div>
            </main>
            <footer className="app-footer">
                Developed for the 'Cloud Systems Development' course project at Azrieli College
            </footer>
        </div>
    );
}

export default App;

