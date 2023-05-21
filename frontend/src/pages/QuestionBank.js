import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react"
import { Link } from 'react-router-dom';
import InstructorNavbar from '../components/instructorNavbar';
import axios from 'axios';
import styles from '../pages/Instructor.module.css';
import { Button, Card, Form, ListGroup,OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faSave, faTimes, faP , faDownload, faUpload} from '@fortawesome/free-solid-svg-icons';
//import QuestionForm from "../components/QuestionForm";
import QuestionForm from "../components/QuestionForm";
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Add new question 
  </Tooltip>
);
const renderTooltip2 = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Delete Attachment 
  </Tooltip>
);
const QuestionBank = () => {
  const xx=''
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const questionBankName = searchParams.get('questionBankName'); 
    const name = searchParams.get('name');
    const [questionBank, setQuestionBank] = useState(null);
    const [version, setVersion] = useState(0);
    const [editedChoice, setEditedChoice] = useState(null);
    const [editedChoiceIndex, setEditedChoiceIndex] = useState(null);
    const [editedFile, setEditedFile] = useState(null);
    const [editedQuestionIndex, setEditedQuestionIndex] = useState(null);
    const [AddedChoice, setAddedChoice] = useState(null);
    const [file, setFile] = useState(null);
    const[aurl,setAurl]=useState(null)
    const[warning,setWarning]=useState(false)
    const[warningIndex,setWarningIndex]=useState(null)
    const[user,setUser]=useState(JSON.parse(localStorage.getItem('user')));
    const navigate = useNavigate();
const[loading,setLoading]=useState(false)
//initialize a state variable to store the question id as key and the image url as value
const [imageUrl, setImageUrl] = useState({});
const [choicesUrl, setChoicesUrl] = useState({});
const[attachment,setAttachment]=useState(null)
const[question,setQuestion]=useState(null)
const [index, setIndex] = useState(null);

const isImageAttachment = (attachment) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const extension = attachment.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
};
  const getImageUrl = async (attachment) => {
    const response = await axios.get(`/instructor/getImage/?attachment=${attachment}`);
    console.log(response.data);
    return response.data;
  };

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    const handleUpload =  (q,newQuestionFile,o) => {
      if (file||newQuestionFile){
      const formData = new FormData()
      if(newQuestionFile)
      formData.append('attachment', newQuestionFile);
      formData.append('attachment', file);
      formData.append('questionId', q);
      formData.append('questionBankId', questionBank._id);
      formData.append('courseName', name);
      if(file)
      setLoading(true)
      fetch(`/instructor/uploadFile`, {
        method: 'POST',
        'Content-Type': 'multipart/form-data',
        body: formData, 
    
   
      })
        .then(json => {
          console.log(json);
          setFile(null);
          alert('File uploaded successfully');
          setVersion(version => version + 1); // force re-render
        })
        .catch(error => {
          console.error(error);
          alert('Failed to edit question');
        });}
        else {
          if(o)
        alert('No file selected');}
      }
  
        
      

    const handleEditChoice = (index,qIndex) => {
        setEditedChoiceIndex(index);
        setEditedChoice(questionBank.questions[qIndex].choices[index]);
        setEditedQuestionIndex(qIndex);
        console.log(choicesUrl)
      };
    
      const handleFinishEditChoice =async (newChoice,question) => {
        // const updatedQuestionBank = { ...questionBank };
        // updatedQuestionBank.questions[editedChoiceIndex].choices[editedChoice] = newChoice;
        if(newChoice==""&&(!editedFile&&!question.choiceAttachments[editedChoiceIndex]))
        alert("Choice can't be empty");
        else{
        question.choices[editedChoiceIndex] = newChoice;
        //loop on the choices of the question and check if there is a duplicate
        for(let i=0;i<question.choices.length;i++){
          for(let j=i+1;j<question.choices.length;j++){
            if(question.choices[i]==question.choices[j]){
              alert("Duplicate choices are not allowed");
              return;
            }
          }
        }
        setLoading(true)
        console.log(question._id);
        await fetch('/instructor/editMcqQuestion', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionBankId: questionBank._id,
              name,
              text: question.text,
              choices: question.choices,
              answer: question.answer,
              category: question.category,
              id: question._id,
              index:null
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to edit question');
              }
              return response.json();
            })
            .then(async json => {
              console.log(editedFile);
              console.log(question._id);
              await handleUploadChoiceAttachments(question._id,editedFile,false,editedChoiceIndex)
              console.log(json);
              setDisplayForm(false);
              alert('Question edited successfully');
              setVersion(version => version + 1); // force re-render
            })
            .catch(error => {
              console.error(error);
              alert('Failed to edit question');
            });
       setVersion(version => version + 1); // force re-render
        setEditedChoice(null);
        setEditedChoiceIndex(null);
        setEditedQuestionIndex(null);
        setEditedFile(null);
        }  };
    //create a function to handle delete choice
    const handleDeleteChoice=(index,question)=>{
        // const updatedQuestionBank = { ...questionBank };
        // updatedQuestionBank.questions[editedChoiceIndex].choices[editedChoice] = newChoice;
        if(question.choices.length==2)
            alert("You can't delete more choices");
        else
        {
          const confirmed = window.confirm("Are you sure you want to delete this choice?");
    if (confirmed) {
        question.choices.splice(index,1);
        setLoading(true)
        fetch('/instructor/editMcqQuestion', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionBankId:questionBank._id,
              name,
              text: question.text,
              choices: question.choices,
              answer: question.answer,
              category: question.category,
                grade: question.grade,
              id: question._id,
              index:index
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to delete choice');
              }
              return response.json();
            })
            .then(json => {
              console.log(json);
              setDisplayForm(false);
              alert('Choice deleted successfully');
              setVersion(version => version + 1); // force re-render
            })
            .catch(error => {
              console.error(error);
              alert('Failed to delete choice');
              setVersion(version => version + 1); // force re-render
            });}
          }  //setVersion(version => version + 1); // force re-render
      };
      const handleDeleteChoiceAttachment=(index,question)=>{
        // const updatedQuestionBank = { ...questionBank };
        // updatedQuestionBank.questions[editedChoiceIndex].choices[editedChoice] = newChoice;
       if(question.choices[index]==''||question.choices[index]==null)
       { alert("Choice cannot be empty");
        return}
          const confirmed = window.confirm("Are you sure you want to delete this Attachment?");
          
    if (confirmed) {
        
        setLoading(true)
        fetch('/instructor/editMcqQuestionAttachment', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionBankId:questionBank._id,
              name,
              text: question.text,
              choices: question.choices,
              answer: question.answer,
              category: question.category,
                grade: question.grade,
              id: question._id,
              index:index
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to delete Attachment');
              }
              return response.json();
            })
            .then(json => {
              console.log(json);
              setDisplayForm(false);
              alert('Attachment deleted successfully');
              setVersion(version => version + 1); // force re-render
            })
            .catch(error => {
              console.error(error);
              alert('Failed to delete choice Attachment');
              setVersion(version => version + 1); // force re-render
            });}
            //setVersion(version => version + 1); // force re-render
      };
    //create a function to handle edit question
    const handleEditQuestion = () => {
        console.log("edit question");
    }
    //create a function to handle delete question
    const handleDeleteQuestion = (question) => {
      const confirmed = window.confirm("Are you sure you want to delete this question ?");
    if (confirmed) {
      setLoading(true)
        fetch('/instructor/deleteMcqQuestion', {
          method: 'Delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            questionBankId:questionBank._id,
            name,
            id: question,
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete question');
            }
            return response.json();
          })
          .then(json => {
            console.log(json);
            alert('Question deleted successfully');
            setVersion(version => version + 1); // force re-render
          })
          .catch(error => {
            console.error(error);
            alert('Failed to delete question');
            setVersion(version => version + 1); // force re-render
          });
      }}
      const handleDeleteQuestionAttachment = (question) => {
        const confirmed = window.confirm("Are you sure you want to delete this Question Attachment ?");
      if (confirmed) {
        setLoading(true)
          fetch('/instructor/deleteMcqQuestionAttachment', {
            method: 'Delete',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionBankId:questionBank._id,
              name,
              id: question,
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to delete question Attachment');
                
              }
              return response.json();
            })
            .then(json => {
              console.log(json);
              alert('Question Attachment deleted successfully');
              setVersion(version => version + 1); // force re-render
            })
            .catch(error => {
              console.error(error);
              alert('Failed to delete question attachment');
            });
        }}
    //create a function to handle add choice
    const[editedQuestionIndexforAddChoice,setEditedQuestionIndexforAddChoice]=useState(null);
    const handleAddChoice = (qIndex) => {
        setAddedChoice("")
        setEditedQuestionIndexforAddChoice(qIndex);
        console.log(choicesUrl)
    }
   const handleFinishAddedChoice=async (AddedChoice,question)=>{
        // const updatedQuestionBank = { ...questionBank };
        // updatedQuestionBank.questions[editedChoiceIndex].choices[editedChoice] = newChoice;
        if(AddedChoice==""&&!editedFile)
        alert("Choice can't be empty");
        else{
        // question.choices.push(AddedChoice);
        //loop on the choices of the question and check if there is a duplicate
        for(let i=0;i<question.choices.length;i++){
          for(let j=i+1;j<question.choices.length;j++){
            if(question.choices[i]==question.choices[j]||question.choices[i]==AddedChoice){
              alert("Duplicate choices are not allowed");
              return;
            }
          }
        }
        question.choices.push(AddedChoice);
        setLoading(true)
        await fetch('/instructor/editMcqQuestion', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionBankId:questionBank._id,
              name,
              text: question.text,
              choices: question.choices,
              answer: question.answer,
              category: question.category,
              id: question._id,
              index:null
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to edit question');
              }
              return response.json();
            })
            .then(async json => {
              console.log(json);
              await handleUploadChoiceAttachments(question._id,editedFile,false,question.choices.length-1)
              setDisplayForm(false);
              alert('Question edited successfully');
              setVersion(version => version + 1); // force re-render
            })
            .catch(error => {
              console.error(error);
              alert('Failed to edit question');
            });
       setVersion(version => version + 1); // force re-render
        setAddedChoice(null);
        setEditedQuestionIndexforAddChoice(null);
        setEditedFile(null)
   }};


    //create a function to handle edit answer
    const[editedQuestionIndexforEditAnswer,setEditedQuestionIndexforEditAnswer]=useState(null);
    const[editedAnswer,setEditedAnswer]=useState(null);

    const handleEditAnswer = (qIndex) => {
        setEditedAnswer(questionBank.questions[qIndex].answer)
        setEditedQuestionIndexforEditAnswer(qIndex)
        
    }
    const handleFinishEditAnswer=async(newAnswer,question,index)=>{
       setLoading(true)
       await fetch('/instructor/editMcqQuestion', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionBankId:questionBank._id,
              name,
              text: question.text,
              choices: question.choices,
              answer: newAnswer,
              category: question.category,
              id: question._id,
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to edit answer');
              }
              return response.json();
            })
            .then( json => {
              console.log(json);
              setDisplayForm(false);
              alert('Answer edited successfully');
              window.location.reload(); // force re-render
            })
            .catch(error => {
              console.error(error);
              alert('Failed to edit answer');
            });
      // setVersion(version => version + 1); // force re-render
       setEditedAnswer(null)
       setEditedQuestionIndexforEditAnswer(null)
    }
    const[editedQuestionIndexforEditCategory,setEditedQuestionIndexforEditCategory]=useState(null);
    const[editedCategory,setEditedCategory]=useState(null);

    //create a function to handle edit category
    const handleEditCategory = (qIndex) => {
        setEditedCategory(questionBank.questions[qIndex].category)
        setEditedQuestionIndexforEditCategory(qIndex)
        
    }
    const handleFinishEditCategory=(newCategory,question)=>{
      setLoading(true)
        fetch('/instructor/editMcqQuestion', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionBankId:questionBank._id,
              name,
              text: question.text,
              choices: question.choices,
              answer: question.answer,
              category: newCategory,
              id: question._id,
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to edit category');
              }
              return response.json();
            })
            .then(json => {
              console.log(json);
              setDisplayForm(false);
              alert('Category edited successfully');
              setVersion(version => version + 1); // force re-render
            })
            .catch(error => {
              console.error(error);
              alert('Failed to edit category');
            });
      // setVersion(version => version + 1); // force re-render
       setEditedCategory(null)
       setEditedQuestionIndexforEditCategory(null)
    }
    const[editedQuestionIndexforEditGrade,setEditedQuestionIndexforEditGrade]=useState(null);
    const[editedGrade,setEditedGrade]=useState(null);

    //create a function to handle edit category
  
    const[editedQuestionIndexforEditText,setEditedQuestionIndexforEditText]=useState(null);
    const[editedText,setEditedText]=useState(null);

    const handleEditText = (qIndex) => {
        setEditedText(questionBank.questions[qIndex].text)
        setEditedQuestionIndexforEditText(qIndex)
        
    }
    const handleFinishEditText=(newText,question)=>{
      console.log(newText)
      console.log(newText=="")
      if(newText=="")
      alert("Text can't be empty");
      else{
      setLoading(true)
        fetch('/instructor/editMcqQuestion', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionBankId:questionBank._id,
              name,
              text: newText,
              choices: question.choices,
              answer: question.answer,
              category: question.category,
              id: question._id,
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to edit Text');
              }
              return response.json();
            })
            .then(json => {
              console.log(json);
              setDisplayForm(false);
              alert('Text edited successfully');
              setVersion(version => version + 1); // force re-render
            })
            .catch(error => {
              console.error(error);
              alert('Failed to edit Text');
            });
      // setVersion(version => version + 1); // force re-render
       setEditedText(null);
       setEditedQuestionIndexforEditText(null)}
    }
 
 
    const url = `/instructor/openQuestionBank?questionBankName=${questionBankName}&name=${name}`;
    const fetchData = async () => {
      setLoading(true)
      const response = await fetch(url);
      const json = await response.json();
      setQuestionBank(json);
      console.log(json);
      
      
      for(var i=0;i<json.questions.length;i++){
        
        if(json.questions[i].attachment&& isImageAttachment(json.questions[i].attachment)){
         handleurls(json.questions[i]._id,json.questions[i].attachment)
        }
      
      }
     
//         const initialChoicesUrl = {};
// for (let i = 0; i < json.questions.length; i++) {
//   if (json.questions[i].type=="mcq"){
// console.log(i)
// initialChoicesUrl[json.questions[i]._id] = new Array(json.questions[i].choices.length).fill(null);}
// }
// console.log(initialChoicesUrl)
// setChoicesUrl(initialChoicesUrl);

// localStorage.setItem('cUrls', {});  
      for (var i=0;i<json.questions.length;i++){
        if (warning==false&&json.questions[i].type=="mcq"&&json.questions[i].choices.indexOf(json.questions[i].answer) === -1) {
          console.log(i )
          setWarning(true)
          setWarningIndex(i)
        }
        if(json.questions[i].type=="mcq"){
        for (var j=0;j<json.questions[i].choices.length;j++){
         
          if(json.questions[i].choiceAttachments&&json.questions[i].choiceAttachments[j]&& isImageAttachment(json.questions[i].choiceAttachments[j])){
            await handleChoiceUrls(json.questions[i]._id,j,json.questions[i].choiceAttachments[j],json.questions[i].choices.length)
            
           }
        }}
        
      }
      setLoading(false)
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
    useEffect(() => {
      if (!user)
      { 
        navigate('/'); return  ; 
      }
      else if (user.role != "instructor")
       { navigate('/StudentPage'); return  ;}
       document.title = "Online Assessment Simulator";
      if (!questionBankName) return; // add a check for undefined
  
      
      fetchData();
      
      //loop over questionBank.questions 
      
    }, [version]);
  
    
  
   
  const handleAddQuestion = () => {
    setDisplayForm(true);
  }

  const [displayForm, setDisplayForm] = useState(false);

  const handleFinish = async (newQuestion) => {
   
    if(newQuestion){
      var flag=false;
      //loop over newQuestion.choices to check if there is an empty choice
      for(var i=0;i<newQuestion.choices.length;i++){
        if(newQuestion.choices[i]==""&&!newQuestion.choiceAttachments[i]){
          flag=true;
          break;
        }
      }
      //loop over newQuestion.choices to check for duplicate choices
      var flag2=false
      for(var i=0;i<newQuestion.choices.length;i++){
        for(var j=i+1;j<newQuestion.choices.length;j++){
          if(newQuestion.choices[i]==newQuestion.choices[j]){
            flag2=true;
            break;
          }
        }
      }


      if((newQuestion.text=="")||(flag&&newQuestion.type=="mcq") ||(newQuestion.answer==""&&newQuestion.type=="mcq"))
      alert("please fill all fields");
      else if(flag2&&newQuestion.type=="mcq")
      alert("please enter unique choices");
      else{
      console.log(newQuestion.type)
      setLoading(true)
    await fetch('/instructor/addMcqQuestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        questionBankName,
        name,
        text: newQuestion.text,
        choices: newQuestion.choices,
        answer: newQuestion.answer,
        category: newQuestion.category,
        type: newQuestion.type,

      })
    })
      .then( response => {
        if (!response.ok) {
          throw new Error(response);
        }
        return  response.json();
      })
      .then(async json => {
        console.log(json);
       handleUpload(json[json.length-1]._id , newQuestion.attachment,false)
       for (let i=0;i<newQuestion.choiceAttachments.length;i++){
        if(newQuestion.choiceAttachments[i]){
         await handleUploadChoiceAttachments(json[json.length-1]._id ,newQuestion.choiceAttachments[i] , false , i )
        }
       }
        alert('Question added successfully');
        setVersion(version => version + 1); // force re-render
        setDisplayForm(false);
      })
      .catch(error => {
        console.error(error);
        alert(error);
      });
  }}
  else{
    setDisplayForm(false);
  }
}
const handleUploadChoiceAttachments = async (q,newQuestionFile,o,index) => {
  if (newQuestionFile){
  const formData = new FormData()
  if(newQuestionFile)
  formData.append('attachment', newQuestionFile);
  formData.append('questionId', q);
  formData.append('questionBankId', questionBank._id);
  formData.append('courseName', name);
  formData.append('choiceIndex', index);

  await fetch(`/instructor/uploadChoiceAttachments`, {
    method: 'POST',
    'Content-Type': 'multipart/form-data',
    body: formData, 


  })
    .then(json => {
      console.log(json);
      setVersion(version => version + 1); // force re-render
    })
    .catch(error => {
      console.error(error);
      alert('Failed to edit question');
    });}
    else {
      if(o)
    alert('No file selected');}
  }
if (!questionBank||loading) {
  return (
    <div className={styles['container']}>
      <div className={styles['loader']}></div>
    </div>
  );
}
 
  const handleDownload = async (attachment) => {
    try {
      const response = await axios.get(`/instructor/downloadFile/?attachment=${attachment}`, {
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
  
  // call the handleDownload function when the user clicks a download button or link
  
  return (
    <div  >
      <InstructorNavbar />
      <h1 style={{paddingTop:'72px', textAlign: 'center' , color:'#B2D1EE'}}>{name.charAt(0).toUpperCase()+name.slice(1)}/{questionBankName}</h1>
      {warning&&<div style={{display:'flex',justifyContent:'space-between'}}>
      <h3 style={{color:'red'}}> You have Errors in Question {warningIndex+1}</h3> 
      </div>}
      {displayForm&&<QuestionForm onFinish={handleFinish}  />}
      {questionBank && questionBank.questions && questionBank.questions.map(( question, qIndex) => (
        <Card key={question._id} className={styles.courseCard}  style={{ boxShadow: '0px 0px 24px 24px rgba(0,0,0,0.1)', borderRadius: '10px' , width:'70%', margin: '0 auto', marginBottom: '24px'}}>
          <Card.Body>
          
            {editedQuestionIndexforEditText === qIndex && editedText !== null ? (
              <div>
                <Form.Label style={{color:'green'}}>-If you want to make a variable to be generated randomly during exam Write it like this %%variable%% </Form.Label>
                <Form.Label style={{color:'green'}}>-If you want to make an equation to be computed according to the randomly generated numbers during exam Write it like this equation(your equation), divide is written / , power is written ** </Form.Label>
                <Form.Control type="text" value={editedText} onChange={(e) => setEditedText(e.target.value)} style={{width:'60%'}}/>
                <Button variant="primary" onClick={() => handleFinishEditText(editedText, question)}> <FontAwesomeIcon icon={faSave} />Save</Button>
                <button className="btn btn-danger" onClick={() => {setEditedText(null);setEditedQuestionIndexforEditText(null)}}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
              </button>
              </div>
            ) : (
              <div className="d-flex align-items-center">
              <h3 className="mb-0 me-2">{qIndex+1})   {question.text}</h3>
              <div className="d-flex">
                <FontAwesomeIcon icon={faEdit} className="text-warning ms-2" style={{ cursor: 'pointer' , height:"30px" }} onClick={() => {
                  setEditedText(question.text);
                  setEditedQuestionIndexforEditText(qIndex);
                }} />
                <FontAwesomeIcon icon={faTrashAlt} className="text-danger ms-2" style={{ cursor: 'pointer' ,  height:"30px"  }} onClick={() => handleDeleteQuestion(question._id)} />
              </div>
            </div>
            )}
            {question.type === "mcq" && 
            <ListGroup className="my-3" style={{width:'60%'}}>
              <h2>Choices:</h2>
              {question.choices.map((choice, cIndex) => (
                <ListGroup.Item key={cIndex}>
                  {editedChoiceIndex === cIndex && editedChoice !== null && editedQuestionIndex===qIndex ? (
                    <div>
                         <Form.Label style={{color:'green'}}>-If you want to make a variable to be generated randomly during exam Write it like this %%variable%% </Form.Label>
                <Form.Label style={{color:'green'}}>-If you want to make an equation to be computed according to the randomly generated numbers during exam Write it like this equation(your equation), divide is written / , power is written ** </Form.Label>
                      <Form.Control type="text" value={editedChoice} onChange={(e) => setEditedChoice(e.target.value)} style={{ width: '80%' }} />
                      <Form.Control type="file" onChange={(e) => setEditedFile(e.target.files[0])} style={{ width: '80%' }} />
                      <Button variant="primary" onClick={() => handleFinishEditChoice(editedChoice, question, cIndex)}> <FontAwesomeIcon icon={faSave} />Save</Button>
                      <button className="btn btn-danger" onClick={() => {setEditedChoice(null);setEditedChoiceIndex(null); setEditedQuestionIndex(null);setEditedFile(null)}}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
              </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
  {choice}
  <FontAwesomeIcon icon={faEdit} style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={() => {
    setEditedChoice(choice);
    setEditedChoiceIndex(cIndex);
    setEditedQuestionIndex(qIndex);
  }} />
  <FontAwesomeIcon icon={faTrashAlt} style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={() => handleDeleteChoice(cIndex, question)} />
  {question.choiceAttachments && question.choiceAttachments[cIndex] && (
    <div style={{ marginLeft: 'auto', height: '100%', maxWidth: '50%', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FontAwesomeIcon
          icon={faTrashAlt}
          style={{ cursor: 'pointer', marginRight: '10px', color: 'red' }}
          onClick={() => handleDeleteChoiceAttachment(cIndex, question)}
        />
        <img
          src={choicesUrl[question._id][cIndex]}
          alt="Attachment"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <OverlayTrigger placement="right" overlay={renderTooltip2}>
        <div style={{ width: '20%' }}>
          {/* Other actions */}
        </div>
      </OverlayTrigger>
    </div>
  )}
</div>


                  
                  )}
                </ListGroup.Item>
              ))}
              {editedQuestionIndexforAddChoice === qIndex && AddedChoice !== null ? (
                <div>
                     <Form.Label style={{color:'green'}}>-If you want to make a variable to be generated randomly during exam Write it like this %%variable%% </Form.Label>
                <Form.Label style={{color:'green'}}>-If you want to make an equation to be computed according to the randomly generated numbers during exam Write it like this equation(your equation) divide is written / , power is written ** </Form.Label>
                  <Form.Control type="text" value={AddedChoice} onChange={(e) => setAddedChoice(e.target.value)} style={{ width: '80%' }}/>
                  <Form.Control type="file" onChange={(e) => setEditedFile(e.target.files[0])} style={{ width: '80%' }} />
                  <Button variant="primary" onClick={() => handleFinishAddedChoice(AddedChoice, question)}> <FontAwesomeIcon icon={faSave} /> Save</Button>
                  <button className="btn btn-danger" onClick={() => {setEditedQuestionIndexforAddChoice(null);setAddedChoice(null);setEditedFile(null)}}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
              </button>
                </div>
              ) : (
                <div>
                  <Button variant="success" onClick={() => handleAddChoice(qIndex)}> <FontAwesomeIcon icon={faPlus} className="me-2" />Add Choice</Button>
                </div>
              )}
            </ListGroup>}
            {question.type=="mcq"&& <div>
            {editedQuestionIndexforEditAnswer === qIndex && editedAnswer !== null ? (
              <div>
              <Form.Select value={editedAnswer} onChange={(e) => {setEditedAnswer(e.target.value)}} style={{width:'20%'}}>
                {question.choices.map((choice, index) => (
                  <option key={index} value={choice}>{choice}</option>
                ))}
              </Form.Select>
              <Button variant="primary" onClick={() => handleFinishEditAnswer(editedAnswer, question,qIndex)}>
                <FontAwesomeIcon icon={faSave} className="me-2" />Save
              </Button>
              <button className="btn btn-danger" onClick={() => {
                setEditedAnswer(null);
                setEditedQuestionIndexforEditAnswer(null);
              }}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
              </button>
            </div>
            ) : (
              <div className="d-flex align-items-center">
              <h3 className="mb-0 me-2">Answer:</h3>
              <p className="mb-0">{question.answer}</p> {question.choices.indexOf(question.answer) === -1 &&
      <p className="mb-0 text-danger">Warning: Invalid answer</p>
    }
    
              <FontAwesomeIcon icon={faEdit}  style={{ cursor: 'pointer' , marginLeft: '10px' }} onClick={() => {
                setEditedAnswer(question.answer);
                setEditedQuestionIndexforEditAnswer(qIndex);
                if (question.choices.indexOf(question.answer) === -1)
              setEditedAnswer(question.choices[0])
              }} className="ms-2"/>
            </div>
            )} </div>}
            {editedQuestionIndexforEditCategory === qIndex && editedCategory !== null ? (
              <div>
                 <Form.Select value={editedCategory} onChange={(e) => setEditedCategory(e.target.value)} style={{width:'15%'}}>
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </Form.Select>
                <Button variant="primary" onClick={() => handleFinishEditCategory(editedCategory, question)}><FontAwesomeIcon icon={faSave} />Save</Button>
                <button className="btn btn-danger" onClick={() => {
                setEditedCategory(null);
                setEditedQuestionIndexforEditCategory(null);
              }}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
              </button>
              </div>
            ) : (
              <div className="d-flex align-items-center">
              <h3 className="mb-0 me-2">Category:</h3>
              <p className="mb-0">{question.category}</p>
                <FontAwesomeIcon icon={faEdit}  style={{ cursor: 'pointer' , marginLeft: '10px' }}onClick={() => {
                  setEditedCategory(question.category);
                  setEditedQuestionIndexforEditCategory(qIndex);
                }}/>
              </div>
            )}
            {/* {editedQuestionIndexforEditGrade === qIndex && editedGrade !== null ? (
              <div>
<Form.Control type="number" value={editedGrade} onChange={(e) => setEditedGrade(e.target.value)} style={{ width: '15%' }} />                
<Button variant="primary" onClick={() => handleFinishEditGrade(editedGrade, question)}><FontAwesomeIcon icon={faSave} className="me-2" />Save</Button>
<button className="btn btn-danger" onClick={() => {
                setEditedGrade(null);
                setEditedQuestionIndexforEditGrade(null);
              }}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
              </button>
                
              </div>
            ) : (
              <div className="d-flex align-items-center">
              <h3 className="mb-0 me-2">Grade:</h3>
              <p className="mb-0">{question.grade}</p>
              <FontAwesomeIcon icon={faEdit}  style={{ cursor: 'pointer' , marginLeft: '10px' }} onClick={() => {
                setEditedGrade(question.grade);
                setEditedQuestionIndexforEditGrade(qIndex);
              }} />
            </div>
            )} */}
           <Form.Group controlId="formFile">
  <Form.Label>Attachments:</Form.Label>
  <Form.Control type="file" onChange={(e) => handleFileChange(e)} style={{ width: '35%' }}/>
  <Button className="my-2" variant="primary" onClick={() => handleUpload(question._id,null,true)}>
    <FontAwesomeIcon icon={faUpload} className="me-2" />
    Upload
  </Button>
  
  {question.attachment &&
    <Button variant="danger" onClick={() => handleDownload(question.attachment)}>
      <FontAwesomeIcon icon={faDownload} className="me-2" />
      Download
    </Button>
  }
  {question.attachment && isImageAttachment(question.attachment) && <img src={imageUrl[question._id]}alt="Attachment"   style={{ maxWidth: "80%", maxHeight: "80%" }}/>
}
{question.attachment && (
  <div>
    <OverlayTrigger placement="right" overlay={renderTooltip2}>
      <FontAwesomeIcon
        icon={faTrashAlt}
        className="text-danger ms-2"
        style={{ cursor: 'pointer' }}
        onClick={() => handleDeleteQuestionAttachment(question._id)}
      />
    </OverlayTrigger>
  </div>
)}
</Form.Group>
          </Card.Body>
        </Card>
      ))}
       <div>
      {/* your component code */}
      <OverlayTrigger placement="left" overlay={renderTooltip}>
      <button
  className="btn btn-success d-flex align-items-center"
  style={{
    width: "140px",
    height: "45px",
    position: "fixed",
    top: "10px",
    left: "170px",
    zIndex: "9999", // add a high z-index value
  }}
  onClick={() => setDisplayForm(true)}
>
  <FontAwesomeIcon icon={faPlus} /> Add question
</button>

</OverlayTrigger>
    </div>
    </div>
  );
};

export default QuestionBank;