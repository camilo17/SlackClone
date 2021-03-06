import React, { Component } from "react";
import { observer } from "mobx-react";
import { extendObservable } from "mobx";
import {
  Container,
  Header,
  Input,
  Button,
  Message,
  Form,
  Divider,
  Segment
} from "semantic-ui-react";

import { gql } from "apollo-boost";
import { graphql } from "react-apollo";
import styled from "styled-components";

import { wsLink } from "../apollo";

const OuterContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right bottom, #551a8b, #433a4c);
`;
class Login extends Component {
  constructor(props) {
    super(props);

    extendObservable(this, {
      email: "",
      password: "",
      errors: {
        emailError: "",
        passwordError: ""
      }
    });
  }

  onSubmit = async () => {
    const { email, password } = this;

    const response = await this.props.mutate({
      variables: {
        email,
        password
      }
    });

    const { ok, token, refreshToken, errors } = response.data.login;

    if (ok) {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      wsLink.subscriptionClient.tryReconnect();
      this.props.history.push("/view-team");
    } else {
      const err = {};
      errors.forEach(({ path, message }) => {
        err[`${path}Error`] = message;
      });

      this.errors = err;
    }
  };

  onChange = e => {
    const { name, value } = e.target;

    this[name] = value;
  };
  render() {
    const { email, password, errors: { emailError, passwordError } } = this;

    const errorList = [];
    if (emailError) {
      errorList.push(emailError);
    }
    if (passwordError) {
      errorList.push(passwordError);
    }

    return (
      <OuterContainer>
        <Container text>
          <Header as="h2">Login</Header>
          <Form>
            <Form.Field error={!!emailError}>
              <Input
                name="email"
                onChange={this.onChange}
                value={email}
                fluid
                placeholder="Email"
              />
            </Form.Field>
            <Form.Field error={!!passwordError}>
              <Input
                name="password"
                onChange={this.onChange}
                value={password}
                type="password"
                fluid
                placeholder="Password"
              />
            </Form.Field>
            <Segment>
              <Button fluid onClick={this.onSubmit} primary>
                Log in
              </Button>
              <Divider horizontal>Or</Divider>
              <Button
                fluid
                secondary
                onClick={() => {
                  this.props.history.push("/register");
                }}
              >
                Sign Up
              </Button>
            </Segment>
          </Form>

          {errorList.length ? (
            <Message
              error
              header="There was some errors with your submission"
              list={errorList}
            />
          ) : null}
        </Container>
      </OuterContainer>
    );
  }
}

const loginMutation = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ok
      token
      refreshToken
      errors {
        path
        message
      }
    }
  }
`;

export default graphql(loginMutation)(observer(Login));
