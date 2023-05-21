import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from '../pages/Instructor.module.css';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { Form , Button } from 'react-bootstrap';
import { FaPlus, FaMinus , FaMinusCircle ,faUpload} from 'react-icons/fa';
const QuestionForm = ({ onFinish ,isOpen}) => {
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    choices: ['', ''],
    answer: '',
    category: 'Easy',
    type:'mcq',
    attachment: null,
    choiceAttachments: [null, null]
  });
const[type,setType]=useState("mcq")
const[numberOfChoices,setNumberOfChoices]=useState(2)
const [file, setFile] = useState(null);
const[choiceFile,setChoiceFile]=useState([null,null])
  const handleNewQuestionChange = (event) => {
    
    setNewQuestion({
      ...newQuestion,
      [event.target.name]: event.target.value
    });
    console.log(event.target.name,event.target.value)
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setNewQuestion({
      ...newQuestion,
      attachment: e.target.files[0]
    });
  };
  const handleChoiceFileChange = (e,index) => {
    console.log(index)
    setNewQuestion({
      ...newQuestion,
      choiceAttachments: newQuestion.choiceAttachments.map((attachment, i) => {
        if (i === index) {
          console.log('here')
          return e.target.files[0];
        } else {
          return attachment;
        }
      }
      )
    });
    console.log(newQuestion.choiceAttachments)
  };
  
  const handleNewChoiceChange = (event, index) => {
    const updatedChoices = [...newQuestion.choices];
    updatedChoices[index] = event.target.value;

    setNewQuestion({
      ...newQuestion,
      choices: updatedChoices
    });
  };

  const handleAddChoice = () => {
    const updatedChoices = [...newQuestion.choices, ''];
    const updatedChoiceAttachments = [...newQuestion.choiceAttachments, null];

    setNewQuestion({
      ...newQuestion,
      choices: updatedChoices,
      choiceAttachments: updatedChoiceAttachments
    });
    setNumberOfChoices(numberOfChoices+1)
  };

  const handleRemoveChoice = (index) => {
    const updatedChoices = [...newQuestion.choices];
    const updatedChoiceAttachments = [...newQuestion.choiceAttachments];
    console.log(updatedChoiceAttachments)
    updatedChoices.splice(index, 1);
    
    updatedChoiceAttachments.splice(index, 1);
    console.log(updatedChoiceAttachments)
    setNumberOfChoices(numberOfChoices-1)

    setNewQuestion({
      ...newQuestion,
      choices: updatedChoices,
      choiceAttachments: updatedChoiceAttachments
    });
    const fileInput = document.getElementById(`choice-file-${index}`);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFinish = () => {
    onFinish(newQuestion);
  };
  const handleCancel = () => {
    onFinish(null);
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleCancel}
      className={styles['modal']}
      overlayClassName={styles['overlay']}
    >
      <div className="modal-header">
        <h2 className="modal-title">Add Question</h2>
        <button className="close-button" onClick={handleCancel}>
          <FaTimes />
        </button>
      </div>
      <div className="modal-body">
        <Form>
          <Form.Group >
          <Form.Label style={{color:'green'}}>-If you want to make a variable to be generated randomly during exam Write it like this %%variable%% </Form.Label>
          <Form.Label style={{color:'green'}}>-If you want to make an equation to be computed according to the randomly generated numbers during exam Write it like this equation(your equation), divide is written / , power is written ** </Form.Label>
            <Form.Label>Question Type:</Form.Label>
            <Form.Control as="select" name="type" value={newQuestion.type} onChange={handleNewQuestionChange}>
              <option value="mcq">MCQ</option>
              <option value="text">Text</option>
            </Form.Control>
          </Form.Group>
          <Form.Group >
            <Form.Label>Question Text:</Form.Label>
            <Form.Control type="text" name="text" value={newQuestion.text} onChange={handleNewQuestionChange} style={{width:'90%'}} />
          </Form.Group>
          {newQuestion.type === 'mcq' && (
            <Form.Group >
              <Form.Label>Choices:</Form.Label>
              <Button variant="primary" type="button" onClick={handleAddChoice} >
                
                <FaPlus />
              </Button>
              <br />
              {newQuestion.choices.map((choice, index) => (
  <div key={index} className="d-flex align-items-center mb-2">
    <Form.Control
      type="text"
      value={choice}
      onChange={(event) => handleNewChoiceChange(event, index)}
      style={{ marginBottom: '0' , width: '60%'}}
    />
     <Form.Control type="file" onChange={(e) => handleChoiceFileChange(e,index)} style={{ width: '35%' }} id={`choice-file-${index}`}/>
    {numberOfChoices > 2 && (
      <Button variant="danger" type="button" onClick={() => handleRemoveChoice(index)} className="ms-3">
        <FaMinusCircle />
      </Button>
    )}
  </div>
))}
              
            </Form.Group>
          )}
          {newQuestion.type === 'mcq' && (
            <Form.Group >
              <Form.Label>Answer:</Form.Label>
              <Form.Select name="answer"  value={newQuestion.answer} onChange={handleNewQuestionChange} style={{width:'60%'}}>
              <option value="">select option</option>
                {newQuestion.choices.map((choice, index) => (
                 
                  <option key={index} value={choice}>{choice}</option>
                ))}
              </Form.Select>
              {/* <Form.Control type="text" name="answer" value={newQuestion.answer} onChange={handleNewQuestionChange} /> */}
            </Form.Group>
          )}
          <Form.Group >
            <Form.Label>Category:</Form.Label>
            <Form.Select name="category"  value={newQuestion.category} onChange={handleNewQuestionChange} style={{width:'15%'}}>
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </Form.Select>
            {/* <Form.Control type="text" name="category" value={newQuestion.category} onChange={handleNewQuestionChange} /> */}
          </Form.Group>
        
          <Form.Group >
  <Form.Label>Attachments:</Form.Label>
  <Form.Control type="file" onChange={(e) => handleFileChange(e)} style={{ width: '35%' }}/>
</Form.Group>
        </Form>
      </div>
      <div className="modal-footer">
        <Button variant="primary" onClick={handleFinish}>
          Finish
        </Button>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default QuestionForm;
