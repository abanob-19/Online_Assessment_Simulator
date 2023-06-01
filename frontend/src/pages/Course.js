
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import styles from '../pages/Instructor.module.css';
import InstructorNavbar from "../components/instructorNavbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button ,OverlayTrigger, Tooltip} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
const Course = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [questionBanks, setQuestionBanks] = useState(null);
  const [newQuestionBankName, setNewQuestionBankName] = useState(null);
  const [editingQuestionBankId, setEditingQuestionBankId] = useState(null);
  const [loading,setLoading]=useState(false)
  const { courseName } = useParams();
  const[version,setVersion]=useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Fetch question banks from server and update state
    const fetchData = async () => { 
 
      setLoading(true)
        await fetch(`/instructor/seeCourse/${courseName}`)
      .then(async response => await response.json())
      .then(data => setQuestionBanks(data))
      .catch(error => console.error(error));}
      if (!user)
      { 
        navigate('/'); return  ; 
      }
      else if (user.role != "instructor")
       { navigate('/StudentPage'); return  ;}
       document.title = "Online Assessment Simulator";
      fetchData();
      console.log(questionBanks);
      setLoading(false)
     
  }, [version]);

const[newBank,setNewBank]=useState(false)

  const handleNewQuestionBankClick = () => {
    // Show the new question bank input field
    setNewQuestionBankName("");
    setEditingQuestionBankId(null);
    setNewBank(true)
    setShowModal(true);
  };

  const handleNewQuestionBankNameChange = event => {
    setNewQuestionBankName(event.target.value);
  };

   const handleNewQuestionBankSubmit = async () => {
    // Send a POST request to create the new question bank
  //check that newQuestionBankName is not in questionBanks

    if(newQuestionBankName==null||newQuestionBankName==""){
      alert("Please enter a name for the question bank")
      return
    }
    console.log(questionBanks)
    for(let i=0;i<questionBanks.length;i++)
    {
      if(questionBanks[i].title==newQuestionBankName)
      {
        alert("A question bank with this name already exists")
        return
      }
    }
    setLoading(true)
    fetch(`/instructor/addQuestionBank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ questionBankName: newQuestionBankName,
        name: courseName })
    })
      .then(async response => await response.json())
      .then(data => {
        setQuestionBanks([...questionBanks, data]);
        setNewQuestionBankName(null);
        setNewBank(false);
        setShowModal(false);
        setVersion(version => version + 1);
      })
      .catch(error => console.error(error));
      
      
   };

  const handleQuestionBankEditClick = (questionBankId) => {
    // Show the edit input field for the selected question bank
    const questionBankToEdit = questionBanks.find(questionBank => questionBank._id === questionBankId);
   
    setNewQuestionBankName(questionBankToEdit.title);
    setEditingQuestionBankId(questionBankId);
  };

  const handleQuestionBankNameChange = event => {
    setNewQuestionBankName(event.target.value);
  };

  const handleQuestionBankSubmit = async (questionBankId) => {
    // Send a PUT request to update the selected question bank
    if(newQuestionBankName==null||newQuestionBankName==""){
      alert("Please enter a name for the question bank")
      return
    }
    setLoading(true)
    await fetch(`/instructor/editQuestionBank/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id:questionBankId,
        name: courseName,
        qname: newQuestionBankName })
    })
      .then(async response =>await response.json())
      .then(data => {
        setQuestionBanks(questionBanks.map(questionBank => {
          if (questionBank.id === questionBankId) {
            return data;
          } else {
            return questionBank;
          }
        }));
        setNewQuestionBankName(null);
        setEditingQuestionBankId(null);
        setVersion(version => version + 1);
      })
      .catch(error => console.error(error));
   };
   

  const handleQuestionBankDelete = (questionBankId) => {
    const confirmed = window.confirm("Are you sure you want to delete this question bank?");
    if (confirmed) {
    setLoading(true)
    fetch(`/instructor/deleteQuestionBank/`, {
      method: "Delete",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: questionBankId,
            name: courseName })
    })
      .then(response => {
        if (response.ok) {
          setQuestionBanks(questionBanks.filter(questionBank => questionBank.id !== questionBankId));
        } else {
          console.error("Failed to delete question bank.");
          console.error(response);
        }
        setVersion(version => version + 1);
       
      })
      .catch(error => console.error(error));}
  };
  if (!questionBanks||loading) {
    return (
      <div className={styles['container']}>
        <div className={styles['loader']}></div>
      </div>
    );
  }
  return (
    <div>
    <InstructorNavbar />
    <div className="d-flex align-items-center justify-content-center mb-3" style={{paddingTop:'72px'}}>
    <div >
  <h1 className="text-center mb-0" style={{color:'#B2D1EE'}}>{courseName.charAt(0).toUpperCase() + courseName.slice(1)}</h1>
  <h2 className="text-center mb-0" style={{color:'#B2D1EE'}}>Question Banks</h2>
  
</div>
      
     
      
    </div>
    <br />
    <div>
    
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Question Bank</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  <div className="mb-3">
    <label htmlFor="newQuestionBankName" className="form-label">Enter New Name</label>
    <input type="text" className="form-control" id="newQuestionBankName" value={newQuestionBankName} onChange={handleNewQuestionBankNameChange} />
  </div>
</Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button> */}
          <Button variant="success" onClick={handleNewQuestionBankSubmit}>
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    {questionBanks.map(questionBank => (
      <div key={questionBank._id} className="card mb-3" style={{ maxWidth: '750px', margin: '0 auto' }}>
        <div className="card-body">
          {editingQuestionBankId === questionBank._id ? (
            <div className="mb-3">
              <input type="text" className="form-control me-2" value={newQuestionBankName} onChange={handleQuestionBankNameChange} />
              <button className="btn btn-success me-2" onClick={() => handleQuestionBankSubmit(questionBank._id)}>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Save
              </button>
              <button className="btn btn-danger" onClick={() => setEditingQuestionBankId(null)}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between">
              <Link to={`/QuestionBank/?questionBankName=${questionBank.title}&name=${questionBank.course}`} className="text-decoration-none">
                <h5 className="card-title mb-0" style={{cursor: 'pointer',  fontWeight: 'bold' , }}>{questionBank.title}</h5>
              </Link>
              <div>
                <button className="btn btn-primary me-2" onClick={() => handleQuestionBankEditClick(questionBank._id)}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="btn btn-danger" onClick={() => handleQuestionBankDelete(questionBank._id)}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ))}
    <div>
      {/* your component code */}
      <OverlayTrigger placement="left" overlay={renderTooltip}>
      <Button
        variant="success"
        className="d-flex align-items-center fixed-bottom"
        style={{
          width: "110px",
          height: "45px",
          position: "fixed",
          top: "10px",
          left: "170px",
          zIndex: "9999", // add a high z-index value
        }}
        onClick={handleNewQuestionBankClick}
      >
        <FontAwesomeIcon icon={faPlus} /> Add bank
      </Button>
    </OverlayTrigger>
    </div>
  </div>
  );
};
export default Course;
const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Add new question bank
  </Tooltip>
);