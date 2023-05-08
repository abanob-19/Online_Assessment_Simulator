import React, { useState, useRef,useEffect , useCallback} from 'react';
import { useLocation } from 'react-router-dom';
import { useInstructorsContext } from '../hooks/useInstrcutorContext'
import styles from '../pages/Instructor.module.css';
import { Link } from 'react-router-dom';
import { Button,Card } from 'react-bootstrap';
import axios from 'axios';
import EditMathField from 'react-mathquill'
import  MathQuill  from 'react-mathquill';
import VirtualKeyboard from 'react-virtual-keyboard';
import StudentNavbar from '../components/StudentNavbar';
import Drawing from './drawing';
const StudentExam = () => {
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [buttonText, setButtonText] = useState('Submit');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const courseName = searchParams.get('courseName'); 
  const examId = searchParams.get('examId');
  const duration = searchParams.get('duration'); 
    const title = searchParams.get('title');
    const end = searchParams.get('endTime');
    const now = new Date (Date.now()) 
    // const startTime = (new Date(exam.startTime)).setHours((new Date(exam.startTime)).getHours() - 3) ;
    // const remainingToStart = startTime > now ? (startTime - now) / 1000 : 0;
    const endTime =  (new Date(end)).setHours((new Date(end)).getHours() - 3) ;
    const remainingToEnd = endTime > now ? (endTime - now) / 1000 : 0;
  const [version, setVersion] = useState(0);    
  const { state, dispatch } = useInstructorsContext()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [submitted, setSubmitted] = useState(false);
  const[isSubmitting,setIsSubmitting]=useState(false);
  const [imageUrl, setImageUrl] = useState({});
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
 const [enabled, setEnabled] = useState(false);
 const [started, setStarted] = useState(false);
 const [drawings, setDrawings] = useState({});
 const [choicesUrl, setChoicesUrl] = useState({});
 const [remainingTime, setRemainingTime] = useState(null);
 useEffect(() => {
  console.log('remaining to end', remainingToEnd);
  const intervalId = setInterval(() => {
    const timeLeft = remainingToEnd;

    if (timeLeft <= 0) {
      clearInterval(intervalId);
      setRemainingTime(null);
    } else {
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = Math.floor(timeLeft % 60);
      setRemainingTime(`${hours}:${minutes}:${seconds}`);
    }
  }, 1000);

  return () => clearInterval(intervalId);
}, [remainingToEnd]);
 const isImageAttachment = (attachment) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const extension = attachment.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
};
const handlePrint = useCallback((event) => {
  console.log(drawings);},[drawings])
const handleChoiceUrls=async function fetchImageUrl(id,index,qattachment,length) {
  const response = await axios.get(
    `/instructor/getImage/?attachment=${qattachment}`
  );
 

 
  setChoicesUrl(prevState => {
    const newState = {...prevState};
    if (!newState[id]) {
      newState[id] = new Array(length);
    }
    newState[id][index] = response.data;
    return newState;
  });
  
  
}
const handleDrawingUpdate = useCallback((question, data) => {
  setDrawings((prevDrawings) => ({
    ...prevDrawings,
    [question]: data,
  }));
  console.log(drawings);
}, []);
  const [file, setFile] = useState(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (started){
      captureScreenshot();}
    }, 15000); // take screenshot every 15 seconds

    return () => clearInterval(interval);
  }, [started]);
  const captureScreenshot = async () => {
    const canvas = canvasRef.current;
    const webcam = webcamRef.current;
  
    console.log(webcam);
    console.log(webcamRef.current.videoWidth);
    // console.log(webcam.video.readyState);
  
    if (webcam) {
      const videoSettings = webcam.videoWidth && webcam.videoHeight
        ? { videoWidth: webcam.videoWidth, videoHeight: webcam.videoHeight }
        : {};
  
      console.log("Webcam is defined");
      console.log("Canvas dimensions:", canvas.width, canvas.height);
      console.log("Video dimensions:", videoSettings.videoWidth, videoSettings.videoHeight);
  
      canvas.width = videoSettings.videoWidth;
      canvas.height = videoSettings.videoHeight;
  
      setTimeout( async () => {
        canvas.getContext('2d').drawImage(
          webcam,
          0,
          0,
          videoSettings.videoWidth,
          videoSettings.videoHeight
        );
        const dataURL = canvas.toDataURL('image/jpeg', 0.5);
      
        try {
          
            
          
          const response = await fetch('/student/saveScreenshot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ screenshot: dataURL ,
            courseName:courseName,
            examId:examId,
            studentId:user._id
             })
          });
          const result = await response.json();
          console.log(result);
        } catch (error) {
          console.error('Failed to save screenshot', error);
        }
      }, 500); // add a 500ms delay before taking the screenshot
    } else {
      console.log("Webcam is not yet defined");
    }
  };
  const startExam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      webcamRef.current.srcObject = stream;
      webcamRef.current.play();
      console.log("Webcam is now defined");
      setEnabled(true);
    } catch (error) {
      console.error('Failed to access webcam', error);
    }
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log(e.target.files[0]);
    console.log(file);
  };

  const handleUpload = async (q) => {
    console.log(file);
    if(file){
      console.log("file is not null");
    const formData = new FormData();
    console.log(file);
    formData.append('attachment', file);
    formData.append('questionId', q);
    formData.append('examId', examId);
    formData.append('courseName', courseName);
    formData.append('studentId', user._id);
    
    await fetch(`/student/uploadFile`, {
      method: 'POST',
      'Content-Type': 'multipart/form-data',
      body: formData, 
  
 
    })
      .then(json => {
        console.log(json);
        setFile(null);
        setVersion(version => version + 1); // force re-render
      })
      .catch(error => {
        console.error(error);
        alert('Failed to edit question');
      });}
      else 
      alert('No file selected');
    }
  const stopCamera = () => {
    const stream = webcamRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }
  };
  const handleurls=async function fetchImageUrl(id,qattachment) {
    const response = await axios.get(
      `/instructor/getImage/?attachment=${qattachment}`
    );
   
    setImageUrl(prevState => ({
      ...prevState,
      [id]: response.data,
    }));
    
  }
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`/student/getQuestionsForExam?courseName=${courseName}&examId=${examId}&Id=${user._id}`);
      const data = await response.json()
      const q=data.Questions;
     
      
    setSubmitted(data.submitted);
    
      var i=0;
      for (i=0;i<data.answers.length;i++){
        answers[data.Questions[i]._id]=data.answers[i];
        }
      setAnswers(answers);
      console.log(answers);
      for(var i=0;i<data.Questions.length;i++){
        
        if(data.Questions[i].attachment&& isImageAttachment(data.Questions[i].attachment)){
         handleurls(data.Questions[i]._id,data.Questions[i].attachment)
        }
      
      }
      for (var i=0;i<data.Questions.length;i++){
        if(data.Questions[i].type=="mcq"){
        for (var j=0;j<data.Questions[i].choices.length;j++){
         
          if(data.Questions[i].choiceAttachments&&data.Questions[i].choiceAttachments[j]&& isImageAttachment(data.Questions[i].choiceAttachments[j])){
            await handleChoiceUrls(data.Questions[i]._id,j,data.Questions[i].choiceAttachments[j],data.Questions[i].choices.length)
            
           }
        }}
        
      }
      setQuestions(q);
     
    }
    fetchData();
    
  }, [version,state.secVersion]);

  const handleAnswerChange = (questionId, choiceIndex) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: choiceIndex
    }));
  };

  const handleSubmit = async() => {
    // You can save the answers to the server here
    setButtonText('Submitting...');
    setIsSubmitting(true);
    const response= await fetch(`/student/submitExam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseName,
          examId,
          Id: user._id,
          answers: answers,
          sumbitted:true,
          drawings:drawings
        })
      })
      .then(response => {
        console.log(response);
        setSubmitted(true);
        setIsSubmitting(false);
        setButtonText('Submitted');
        stopCamera();
        setEnabled(false);
        setStarted(false);
      })
      .catch(error => {
        // handle error
        console.log(error);
      });
      
    console.log(answers);
  };
  const handleDownload = async (attachment) => {
    try {
      const response = await axios.get(`/student/downloadFile/?attachment=${attachment}`, {
        responseType: 'blob', // set the response type to blob to handle binary data
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
  
      // create a temporary link and click it to download the file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
    }
  };
  const handleClickStart = () => {
    setStarted(true);
    window.scrollTo(0, 0);
  };
  if (!questions) {
    return (
      <div className={styles['container']}>
        <div className={styles['loader']}></div>
      </div>
    );
  }
  if (submitted)      { 
  return  (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <StudentNavbar />

      {/* Course name */}
      <h1 style={{ paddingTop: '72px', marginBottom: '36px', textAlign: 'center' }}>{courseName.charAt(0).toUpperCase()+courseName.slice(1)}</h1>

      {/* Title */}
      <h2 style={{ marginBottom: '72px', textAlign: 'center' }}>{title.charAt(0).toUpperCase()+title.slice(1)}</h2>

      {/* Return button */}
      <Button
        as={Link}
        to={`/StudentPage/`}
        variant="success"
        style={{ marginTop: '24px' }}
      >
        Submitted, Return to Home Page
      </Button>
    </div>
  );
}

return (
  <div className="container"  style={{ overflow: 'auto' }}>
    <canvas ref={canvasRef} style={{ display: 'none' }} />
    <video ref={webcamRef} className={`${started ? styles.invisible : 'w-100'}`} />
    {!enabled && (
      <div className="alert alert-warning">
        You have to enable your webcam to take the exam{' '}
        <button className="btn btn-primary ml-3" onClick={startExam}>
          Enable WebCam
        </button>
      </div>
    )}
    {!started && enabled && (
      <div className="alert alert-success">
        You can start the exam now{' '}
        <button className="btn btn-primary ml-3" onClick={handleClickStart}>
          Start
        </button>
      </div>
    )}
    {started && (
      <div>
      <div style={{
  display: 'flex',
  justifyContent: 'center', // center the headings horizontally
  alignItems: 'center', // center the headings vertically
  flexDirection: 'column', // stack the headings vertically
}}>
  <h1 style={{
    fontSize: '3rem', // increase the font size of the h1 element
    fontWeight: 'bold', // make the text bold
    marginBottom: '0.5rem', // add some margin at the bottom
    color: '#333', // set the text color to a dark gray
  }}>{courseName.charAt(0).toUpperCase()+courseName.slice(1)}</h1>
  <h2 style={{
    fontSize: '2.5rem', // increase the font size of the h2 element
    fontWeight: 'bold', // make the text bold
    marginBottom: '0.5rem', // add some margin at the bottom
    color: '#007b55', // set the text color to blue
  }}>{title} Exam</h2>
  <h2 style={{
    fontSize: '1.5rem', // increase the font size of the h2 element
    fontWeight: 'normal', // make the text normal weight
    marginBottom: '0.5rem', // add some margin at the bottom
    color: '#555', // set the text color to a lighter gray
  }}>{started}</h2>
</div>
<div style={{
  display: 'flex',
  justifyContent: 'flex-end', // align the element to the right
  alignItems: 'center', // center the element vertically
}}>
  <h3 style={{
    fontSize: '1.3rem', // decrease the font size of the h3 element
    fontWeight: 'normal', // make the text normal weight
    marginRight: '0.5rem', // add some margin to the right
    color: 'black', // set the text color to a lighter gray
    position: 'fixed', // position the element fixed
    top: '1rem', // set the top position
    right: '1rem',
    zIndex:'9999' // set the right position
  }}>{`Duration: ${remainingTime} `}</h3>
</div>

        {questions.map((question, index) => (
          <Card key={question._id} className="mt-5">
            <Card.Body>
              <Card.Title>
                ({index + 1}) {question.text} ({question.grade} grades)
              </Card.Title>
              {question.attachment && (
                <Button variant="primary" onClick={() => handleDownload(question.attachment)}>
                  Download Attachments
                </Button>
              )}
              {question.attachment && isImageAttachment(question.attachment) && (
                <div style={{ width: '200px', height: '200px' }}>
                  <Card.Img src={imageUrl[question._id]} alt="Attachment" fluid />
                </div>
              )}
              <input type="file" onChange={handleFileChange} />
              <Button variant="primary" className="ml-3" onClick={() => handleUpload(question._id)}>
                Upload your answers
              </Button>
              {question.type === 'mcq' && (
                <ul className="list-unstyled mt-3">
                  {question.choices.map((choice, choiceIndex) => (
                    <li key={choiceIndex}>
                      <label>
                        <input
                          type="radio"
                          name={`question${index}`}
                          value={choice}
                          checked={answers[question._id] === choiceIndex}
                          onChange={() => handleAnswerChange(question._id, choiceIndex)}
                        />
                        <span className="mr-2">{String.fromCharCode(97 + choiceIndex)})</span>
                        {choice}
                      </label>
                      {question.choiceAttachments && question.choiceAttachments[choiceIndex] && (
                        <div style={{ width: '200px', height: '200px' }}>
                          <Card.Img
                            src={choicesUrl[question._id][choiceIndex]}
                            alt="Attachment"
                            fluid
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {question.type === 'text' && (
                <div className="mt-3">
                  <label>Your answer:</label>
                  <input
  
  type="text"
  value={answers[question._id]}
  onChange={(e) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question._id]: e.target.value,
    }));
  }}
  style={{
    height: '80px', // set the height of the input element to 80 pixels
    width: '85%', // set the width of the input element to 100% of its container
    resize: 'none', // disable resizing of the input element
    textAlign: 'left',
    verticalAlign: 'top',
    paddingBottom: '40px',  // left-align the text inside the input element
  }}
/>
                  <Drawing onUpdate={(data) => handleDrawingUpdate(question._id, data)} />
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
        {!submitted && !isSubmitting && (
          <Button className="btn btn-primary mt-3" variant='success' onClick={handleSubmit} style={{
            width: '100%', // set the width of the button to 100% of its container
            paddingBottom:'40px',
            height:'2px', // center the button horizontally
            fontSize: '1.2rem', // set the font size of the button
            fontWeight: 'bold', // make the text bold
          }}>
            {buttonText}
          </Button>
        )}
        {isSubmitting && <p className="mt-3">Submitting...</p>}
       
      </div>
    )}
  </div>
);

  
};

export default StudentExam;
