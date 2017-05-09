import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { TextField } from 'redux-form-material-ui';
import RaisedButton from 'material-ui/RaisedButton';

import { signInUser, clearAuthError } from '../../actions/auth_actions';

// validation functions
const required = value => (!value ? 'Required' : undefined);
const email = value => (value &&
!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? 'Invalid email' : undefined);

// in-line styles
const buttonStyle = {
  margin: 12
};

export class Signin extends Component {
  constructor() {
    super();
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }
  componentDidMount() {
    this.props.clearAuthError();

    this.refs.email            // the Field
      .getRenderedComponent() // on Field, returns ReduxFormMaterialUITextField
      .getRenderedComponent() // on ReduxFormMaterialUITextField, returns TextField
      .focus();               // on TextField
  }

  handleFormSubmit(values) {
    this.props.signInUser({ email: values.email, password: values.password });
  }

  renderAlert() {
    if (this.props.errorMessage) {
      return (
        <div className="alert alert-danger">
          {this.props.errorMessage}
        </div>
      );
    }
  }

  render() {
    const { handleSubmit, pristine, submitting, reset } = this.props;

    return (
      <form onSubmit={handleSubmit(this.handleFormSubmit)}>
        <div>
          <Field
            name="email"
            component={TextField}
            hintText="Email"
            floatingLabelText="Email"
            validate={[required, email]}
            ref="email" withRef
          />
        </div>
        <div>
          <Field
            name="password"
            component={TextField}
            hintText="Password"
            floatingLabelText="Password"
            validate={required}
            type="password"
          />
        </div>

        {this.renderAlert()}

        <div>
          <RaisedButton
            type="submit"
            disabled={pristine || submitting}
            label="Submit"
            primary={true}
            style={buttonStyle}
          />
          <RaisedButton
            disabled={pristine || submitting}
            label="Clear"
            onClick={reset}
            style={buttonStyle}
          />
        </div>
      </form>
    );
  }
}

Signin.propTypes = {
  signInUser: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    errorMessage: state.auth.error
  };
}

const SigninForm = reduxForm({
  form: 'signin'  // name of form.  Redux will put this in our application state
})(Signin);

// We'll pass this mergeProps parameter to redux's connect so that we
// can override properties during unit testing.
const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, ownProps);
};

export default connect(mapStateToProps, { signInUser, clearAuthError }, mergeProps)(SigninForm);
