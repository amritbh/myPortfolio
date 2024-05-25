import React, { useRef, useState } from 'react';
import classnames from 'classnames';
import Alert from '../alerts/Alerts';
import axios from 'axios';

import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
} from 'reactstrap';

export const ContactUs = () => {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    phone: '',
    message: '',
    messageTitle: '',
  });

  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      phone: '',
      message: '',
      messageTitle: '',
    };

    let isValid = true;

    if (username.trim() === '') {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (email.trim() === '') {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(email)) {
      errors.email = 'Invalid email address';
      isValid = false;
    }
    if (phone && !isValidPhoneNumber(phone)) {
      errors.phone = 'Invalid phone number';
      isValid = false;
    }

    if (message.trim() === '') {
      errors.message = 'Message is required';
      isValid = false;
    }

    if (messageTitle.trim() === '') {
      errors.messageTitle = 'Subject is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };
  function isValidEmail(email) {
    // Regular expression for a basic email validation
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailPattern.test(email);
  }

  function isValidPhoneNumber(phone) {
    // Regular expression for basic phone number validation
    const phonePattern = /^\d{10}$/; // Assumes a 10-digit phone number
    return phonePattern.test(phone);
  }

  const handleUsernameChange = (e) => {
    setUserName(e.target.value);
    setFormErrors({ ...formErrors, username: '' });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormErrors({ ...formErrors, email: '' });
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setFormErrors({ ...formErrors, phone: '' });
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setFormErrors({ ...formErrors, message: '' });
  };

  const handleMessageTitleChange = (e) => {
    setMessageTitle(e.target.value);
    setFormErrors({ ...formErrors, messageTitle: '' });
  };

  const form = useRef(null);
  // const userName = useRef();
  // const email = useRef(null);
  // const userMessage = useRef(null);
  const [alert, setAlert] = useState(null);

  const successAlert = {
    color: 'success',
    icon: 'ni ni-like-2',
    message: ' Your message has been sent successfully!',
  };

  const errorAlert = {
    color: 'danger',
    icon: 'ni ni-bell-55',
    message: ' Oops! Something went wrong. Please try again later.',
  };

  const userData = {
    id: `${new Date().getTime()}-${Math.floor(
      Math.random() * 1000
    )}`.toString(),
    username: username,
    email: email,
    phone: phone,
    messageTitle: messageTitle,
    message: message,
  };

  const sendEmail = (e) => {
    e.preventDefault();
    console.log('UserData', userData);
    if (validateForm()) {
      axios
        .post(
          'https://vg270aahel.execute-api.us-east-1.amazonaws.com/v1/portfolio',
          userData,
          {headers: {'Accept': 'application/json'}}
        )
        .then(
          (result) => {
            console.log(result.data);
            setAlert(successAlert);
            setUserName(' ');
            setMessage(' ');
            setEmail(' ');
            setPhone(' ');
            setMessageTitle(' ');
          },
          (error) => {
            console.log(error);
            setAlert(errorAlert);
          }
        );
    }

    // const emailJsServiceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;

    // const emailJsTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

    // const emailJsPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    // if (
    //   emailJsServiceId &&
    //   emailJsTemplateId &&
    //   emailJsPublicKey &&
    //   form.current
    // ) {
    //   emailjs
    //     .sendForm(
    //       emailJsServiceId,
    //       emailJsTemplateId,
    //       form.current,
    //       emailJsPublicKey
    //     )
    //     .then(
    //       (result) => {
    //         console.log(result.text);
    //         setAlert(successAlert);
    //       },
    //       (error) => {
    //         console.log(error.text);
    //         setAlert(errorAlert);
    //       }
    //     );
    // }
  };

  return (
    <>
      <section className="section section-lg section-shaped">
        <form onSubmit={sendEmail}>
          {alert && (
            <Alert
              color={alert.color}
              icon={alert.icon}
              message={alert.message}
            />
          )}
          <Container>
            <Row className="justify-content-center">
              <Col lg="8">
                <Card className="bg-gradient-secondary shadow">
                  <CardBody className="p-lg-5">
                    <h4 className="mb-1">Want to work with me?</h4>
                    <p className="mt-0">
                      Reach out to me using the form below.
                    </p>
                    <FormGroup className={classnames('mt-5', {})}>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-user-run" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Guest Name"
                          type="text"
                          name="user_name"
                          value={username}
                          onChange={handleUsernameChange}
                        />
                      </InputGroup>
                      {formErrors.username && (
                        <div className="text-danger">{formErrors.username}</div>
                      )}
                    </FormGroup>
                    <FormGroup className={classnames({})}>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-email-83" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Email address"
                          name="user_email"
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                        />
                      </InputGroup>
                      {formErrors.email && (
                        <div className="text-danger">{formErrors.email}</div>
                      )}
                    </FormGroup>

                    <FormGroup className={classnames({})}>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-mobile-button" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Phone Number (Optional)"
                          name="user_phoneNo"
                          type="text"
                          value={phone}
                          onChange={handlePhoneChange}
                        />
                      </InputGroup>
                      {formErrors.phone && (
                        <div className="text-danger">{formErrors.phone}</div>
                      )}
                    </FormGroup>

                    <FormGroup className={classnames({})}>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-ungroup" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Subject"
                          name="message_subject"
                          type="text"
                          value={messageTitle}
                          onChange={handleMessageTitleChange}
                        />
                      </InputGroup>
                      {formErrors.messageTitle && (
                        <div className="text-danger">
                          {formErrors.messageTitle}
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup className="mb-4">
                      <Input
                        className="form-control-alternative"
                        cols="80"
                        name="user_message"
                        placeholder="Type a message..."
                        rows="4"
                        type="textarea"
                        value={message}
                        onChange={handleMessageChange}
                      />
                      {formErrors.message && (
                        <div className="text-danger">{formErrors.message}</div>
                      )}
                    </FormGroup>

                    <div>
                      <Button
                        block
                        className="btn-round"
                        color="default"
                        size="lg"
                        type="submit"
                      >
                        Send Message
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </form>
      </section>
    </>
  );
};

export default ContactUs;
