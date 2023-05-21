import React, { useState, useRef,useEffect , useCallback} from 'react';
import { useLocation } from 'react-router-dom';
import { useInstructorsContext } from '../hooks/useInstrcutorContext'
import styles from '../pages/Instructor.module.css';
import { Link } from 'react-router-dom';
import { Button,Card,Badge } from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import EditMathField from 'react-mathquill'
import  MathQuill  from 'react-mathquill';
import VirtualKeyboard from 'react-virtual-keyboard';
import StudentNavbar2 from '../components/StudentNavbar2';
import StudentNavbar from '../components/StudentNavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Drawing from './drawing';
const StudentExam = () => {
  const[numOfSaved,setNumOfSaved]=useState(0)
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [savedText,setSavedText]=useState([])
  const [saved,setSaved]=useState([])
  const [buttonText, setButtonText] = useState('Submit');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const courseName = searchParams.get('courseName'); 
  const [isButtonClickable, setIsButtonClickable] = useState(false);
  const examId = searchParams.get('examId');
  const duration = searchParams.get('duration'); 
    const title = searchParams.get('title');
    const end = searchParams.get('endTime');
    const now = new Date (Date.now()) 
    const [update,setUpdate]=useState(false)
    const[updateIndex,setUpdateIndex]=useState(null)
    // const startTime = (new Date(exam.startTime)).setHours((new Date(exam.startTime)).getHours() - 3) ;
    // const remainingToStart = startTime > now ? (startTime - now) / 1000 : 0;
    const endTime =  (new Date(end)).setHours((new Date(end)).getHours() - 3) ;
    const remainingToEnd = endTime > now ? (endTime - now) / 1000 : 0;
  const [version, setVersion] = useState(0);    
  const { state, dispatch } = useInstructorsContext()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
const navigate = useNavigate();
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
 const [drawingsForStudent,setDrawingsForStudent]=useState(null)
 const[backgroundColor,setBackgroundColor]=useState('green')
 useEffect(() => {
  if (!user)
  { 
    navigate('/'); return  ; 
  }
  else if (user.role != "student")
   { navigate('/InstructorCourses'); return  ;}
   document.title = "Online Assessment Simulator";
  console.log('remaining to end', remainingToEnd);

  const intervalId = setInterval(() => {
    const timeLeft = remainingToEnd;
    const minutes=timeLeft/60
    if(minutes<=15)
    setBackgroundColor('red')
    else if (minutes<=30)
    setBackgroundColor('yellow')
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      setRemainingTime(null);
       handleSubmit();
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
const handleDrawingUpdate = useCallback((question, data,index) => {
  console.log('handleDrawingUpdate', question, data);
  
  setDrawingsForStudent((prevDrawings) => ({
    ...prevDrawings,
    [index]: data,  
  }));
  setUpdate(true)
  setUpdateIndex(index)
  setDrawings((prevDrawings) => ({
    ...prevDrawings,
    [question]: data,
  }));
  
  console.log(drawings);
}, []);
  const [file, setFile] = useState(null);
  useEffect(() => {
    if (!user)
    { 
      navigate('/'); return  ; 
    }
    else if (user.role != "student")
     { navigate('/InstructorCourses'); return  ;}
     document.title = "Online Assessment Simulator";
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
        toast.success('Uploaded successfully!', {
          position: toast.POSITION.TOP_RIGHT
        });
        setFile(null);
        setVersion(version => version + 1); // force re-render
      })
      .catch(error => {
        console.error(error);
        alert('Failed to edit question');
      });}
      else 
      toast.error('no file selected', {
        position: toast.POSITION.TOP_RIGHT
      });
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
    if (!user)
    { 
      navigate('/'); return  ; 
    }
    else if (user.role != "student")
     { navigate('/InstructorCourses'); return  ;}
     document.title = "Online Assessment Simulator";
    async function fetchData() {
      const response = await fetch(`/student/getQuestionsForExam?courseName=${courseName}&examId=${examId}&Id=${user._id}`);
      const data = await response.json()
      const q=data.Questions;
     const drawingsForStudent1=data.drawingsForStudent;
     setDrawingsForStudent(drawingsForStudent1);
     
      
    setSubmitted(data.submitted);
    
      var i=0;
      for (i=0;i<data.answers.length;i++){
        answers[data.Questions[i]._id]=data.answers[i];
        }
      setAnswers(answers);
      console.log(answers);
      for (i=0;i<data.drawingsForStudent.length;i++){
        drawings[data.Questions[i]._id]=data.drawingsForStudent[i];
        }
      const answerEntries = Object.entries(answers);
      const questionAnswers = answerEntries.map(([questionId, answer]) => ({ questionId, answer }));
  console.log(questionAnswers);
      let x = 0;
      const saved1 = questionAnswers.map((qa) => {
        const { answer } = qa;
        console.log(answer);
        console.log(drawings);
        console.log(drawings[qa.questionId]);
        return( answer !== undefined && answer !== null && answer.toString() !== '')||(drawings[qa.questionId]!==undefined&&drawings[qa.questionId]!==null);
      });
      
  console.log(saved1);
      for (let i = 0; i < saved1.length; i++) {
        if (saved1[i] === true) {
          setSavedText(prevSavedText => ({
            ...prevSavedText,
            [i]: 'Saved'
          }));
          setIsButtonClickable(true);
          x++;
          console.log(j);
        }
        else
        setSavedText(prevSavedText => ({
          ...prevSavedText,
          [i]: 'not saved'
        }));
      }
      
      if(x==0)
      setIsButtonClickable(false);
  
      setSaved(saved1);
      setNumOfSaved(x);
      
      setAnswers(answers);
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
  const [answerQueue, setAnswerQueue] = useState([]);
  const [debouncedQueue, setDebouncedQueue] = useState([]);

  useEffect(() => {
    const debounceDelay = 1000; // Adjust this value as needed

    const debounceTimer = setTimeout(() => {
      setDebouncedQueue(answerQueue);
    }, debounceDelay);

    return () => clearTimeout(debounceTimer);
  }, [answerQueue]);


  const handleAnswerChange = (questionId, choiceIndex,index) => {
    console.log(choiceIndex);
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: choiceIndex
    }));
     setAnswerQueue(prevQueue => [...prevQueue, { index, choiceIndex }]);
   console.log(choiceIndex);
  };
  useEffect(() => {
    console.log("here");
    if(questions){
    handleSaveAnswers();
    }
     
  
    
  }, [debouncedQueue,drawings]);
  

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
  const handleSaveAnswers = async() => {
    // You can save the answers to the server here
    if (debouncedQueue.length > 0|| update) {
    console.log(drawings);
    if(update){
      setSavedText(prevSavedText => ({
        ...prevSavedText,
        [updateIndex]: 'Saving'
      }));
    }
    else
    {setSavedText(prevSavedText => ({
      ...prevSavedText,
      [debouncedQueue[0].index]: 'Saving'
    }));}
    
    const response= await fetch(`/student/saveAnswers`, {
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
        console.log(answers);
           const answerEntries = Object.entries(answers);
      const questionAnswers = answerEntries.map(([questionId, answer]) => ({ questionId, answer }));
  console.log(questionAnswers);
      let j = 0;
      const saved1 = questionAnswers.map((qa) => {
        const { answer } = qa;
        console.log(answer);
        console.log(drawings);
        console.log(drawings[qa.questionId]);
        return( answer !== undefined && answer !== null && answer.toString() !== '')||(drawings[qa.questionId]!==undefined&&drawings[qa.questionId]!==null);
      });
      
  console.log(saved1);
      for (let i = 0; i < saved1.length; i++) {
        if (saved1[i] === true) {
          setIsButtonClickable(true);
          setSavedText(prevSavedText => ({
            ...prevSavedText,
            [i]: 'Saved'
          }));
          j++;
          console.log(j);
        }
        else
          setSavedText(prevSavedText => ({
            ...prevSavedText,
            [i]: 'Not Saved'
          }));
      }
      
      if(j==0)
      setIsButtonClickable(false);
  
      setSaved(saved1);
      setNumOfSaved(j);
      })
      .catch(error => {
        // handle error
        console.log(error);
      });
      
    console.log(answers);
    setAnswerQueue([]);
    if(update)
    setUpdate(false);
    setUpdateIndex(null)
    }
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
      <h1 style={{ paddingTop: '72px', marginBottom: '36px', textAlign: 'center' ,color:'white'}}>{courseName.charAt(0).toUpperCase()+courseName.slice(1)}</h1>

      {/* Title */}
      <h2 style={{ marginBottom: '72px', textAlign: 'center' , color:'white'}}>{title.charAt(0).toUpperCase()+title.slice(1)}</h2>

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
    <StudentNavbar2/>
    <canvas ref={canvasRef} style={{ display: 'none' }} />
    <video ref={webcamRef} className={`${started ? styles.invisible : 'w-100'}`} />
    {!enabled && (
  <div className="alert alert-warning text-center">
    <p>{title} {courseName} is ready.
    You have to enable your webcam to take the exam.</p>
    <button className="btn btn-primary" onClick={startExam}>
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
    color: 'white',
    paddingTop:'72px' // set the text color to a dark gray
  }}>{courseName.charAt(0).toUpperCase()+courseName.slice(1)}</h1>
  <h2 style={{
    fontSize: '2.5rem', // increase the font size of the h2 element
    fontWeight: 'bold', // make the text bold
    marginBottom: '0.5rem', // add some margin at the bottom
    color: 'white', // set the text color to blue
  }}>{title}</h2>
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
      fontSize: '1.3rem',
      fontWeight: 'normal',
      marginRight: '0.5rem',
      color: 'black',
      position: 'fixed',
      top: '5rem',
      right: '1rem',
      zIndex: '9999',
      borderRadius: '50%', // make the element circular
      width: '4rem', // set the width and height to the same value to create a circle
      height: '4rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: backgroundColor,
    }}>
      {`${remainingTime}`}
    </h3>
</div>

        {questions.map((question, index) => (
          <Card key={question._id} className="mt-5" style={{marginBottom:'90px'}}>
            <Card.Header style={{ backgroundColor: '#d4edda', display: 'flex', justifyContent: 'center' }}>
    <h5 className="card-title">
      Question {index + 1}
    </h5>
  </Card.Header>
            <Card.Body>
              <Card.Title  style={{  display: 'flex', justifyContent: 'center' , fontSize:'2em' }} >
                {question.text} ({question.grade} grades)
              </Card.Title>
              {question.attachment && (
  <div>
   
    {isImageAttachment(question.attachment) && (
      <div style={{ maxWidth: '40%', margin: '10px 0' }}>
        <Card.Img src={imageUrl[question._id]} alt="Attachment" />
      </div>
    )}
     <Button variant="primary" onClick={() => handleDownload(question.attachment)}>
      Download Attachment
    </Button>
  </div>
)}

{question.type=='text'&& <input type="file" onChange={handleFileChange} />}
              {question.type=='text'&&<Button variant="primary" className="ml-3" onClick={() => handleUpload(question._id)}>
                Upload your answers
              </Button>}
              <ToastContainer />
              {question.type === 'mcq' && (
  <ul className="list-unstyled mt-3" style={{ display: 'flex', flexWrap: 'wrap' }}>
    {question.choices.map((choice, choiceIndex) => (
      <li key={choiceIndex} style={{ width: '50%' }}>
        <label>
          <input
            type="radio"
            name={`question${index}`}
            value={choice}
            checked={answers[question._id] === choiceIndex}
            onChange={() => handleAnswerChange(question._id, choiceIndex,index)}
          />
          <span className="mr-2">{String.fromCharCode(97 + choiceIndex)})</span>
          {choice}
        </label>
        {question.choiceAttachments && question.choiceAttachments[choiceIndex] && (
          <div style={{ maxWidth: '80%', margin: '10px 0' }}>
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
    const id=question._id;
    const value=e.target.value;
    setAnswerQueue(prevQueue => [...prevQueue, { index, value }]);
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
                  <Drawing onUpdate={(data ) => handleDrawingUpdate(question._id, data,index)} imageUrl={drawingsForStudent[index]}/>
                </div>
              )}
             <Badge variant='primary'>{savedText[index]}</Badge>
             



            </Card.Body>
          </Card>
        ))}
        {/* {!submitted && !isSubmitting && (
          <Button className="btn btn-primary mt-3" variant='success' onClick={handleSubmit} style={{
            width: '100%', // set the width of the button to 100% of its container
            paddingBottom:'40px',
            height:'2px', // center the button horizontally
            fontSize: '1.2rem', // set the font size of the button
            fontWeight: 'bold', // make the text bold
          }}>
            {buttonText}
          </Button>
        )} */}
        {isSubmitting && <p className="mt-3">Submitting...</p>}
        <div className="button-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'lightgray', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="exam-info">
        <span className="exam-name">{title}</span>
      </div>
      <div className="answered-questions" style={{ textAlign: 'center' }}>
        {numOfSaved}/{questions.length} Answered Questions
      </div>
      <div className="submit-button" style={{ textAlign: 'right' }}>
      <Button  variant='success' onClick={handleSubmit} disabled={!isButtonClickable} style={{
            width: '100%', // set the width of the button to 100% of its container
            paddingBottom:'40px',
            height:'2px', // center the button horizontally
            fontSize: '1.2rem', // set the font size of the button
            fontWeight: 'bold', // make the text bold
          }}>
            {buttonText}
          </Button>
      </div>
    </div>
      </div>
      
    )}
     
  </div>
);

  
};

export default StudentExam;
