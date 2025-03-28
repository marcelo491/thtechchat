import React, { useState, useEffect } from 'react';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import {
  Grid, TextField, Button, MenuItem, Select, FormControl, InputLabel, Typography, InputAdornment, IconButton, Stepper, Step, StepLabel, CircularProgress, useTheme
} from '@material-ui/core';
import { Visibility, VisibilityOff, InfoOutlined } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import usePlans from '../../hooks/usePlans';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '70%',
    maxWidth: '700px',
    margin: '0 auto',
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: (props) => (props.palette.type === 'dark' ? '#2c2c2c' : '#ffffff'),
    borderRadius: 5,
    //boxShadow: (props) => (props.palette.type === 'dark' ? '0 1px 4px rgba(255, 255, 255, 0.1)' : '0 1px 4px rgba(0, 0, 0, 0.1)'),
  },
  sectionTitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: (props) => (props.palette.type === 'dark' ? '#ffffff' : '#333333'),
  },
  submit: {
    marginTop: theme.spacing(2),
    backgroundColor: '#556EE6',
    color: '#fff',
    height: '45px',
    width: '100%',
    borderRadius: '22px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      backgroundColor: '#4455cc',
    },
  },
  inputField: {
    backgroundColor: (props) => (props.palette.type === 'dark' ? '#3a3a3a' : '#ffffff'),
    borderRadius: 8,
    width: '100%',
    color: (props) => (props.palette.type === 'dark' ? '#ffffff' : '#000000'),
    '& .MuiFilledInput-input': {
      color: (props) => (props.palette.type === 'dark' ? '#ffffff' : '#000000'),
    },
  },
  inputLabel: {
    color: (props) => (props.palette.type === 'dark' ? '#b0b0b0' : '#757575'),
    marginBottom: theme.spacing(1),
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  iconButton: {
    padding: 10,
    color: (props) => (props.palette.type === 'dark' ? '#ffffff' : '#000000'),
  },
  stepper: {
    marginBottom: theme.spacing(3),
    backgroundColor: 'transparent',
  },
  loadingIndicator: {
    color: '#556EE6',
    marginRight: theme.spacing(1),
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Muito curto!').max(50, 'Muito extenso!').required('Nome é obrigatório'),
  companyName: Yup.string().min(2, 'Muito curto!').max(50, 'Muito extenso!').required('Nome da empresa é obrigatório'),
  password: Yup.string().min(5, 'Muito curto!').max(50, 'Muito extenso!').required('Senha é obrigatória'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  phone: Yup.string().matches(
    /^(?:\+?\d{1,3}[-.\s]?)?\(?(?:\d{2,3})\)?[-.\s]?\d{4,5}[-.\s]?\d{4}$/,
    'Número de telefone inválido. Por favor, insira um número de telefone válido do Brasil ou internacional.'
  ).required('Telefone é obrigatório'),
  planId: Yup.string().required('Plano é obrigatório'),
});

const steps = ['Configurações Gerais', 'Configurações de Contato', 'Configurações de Plano'];

const CompanyForm = ({ initialValues, onSubmit }) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      try {
        const list = await listPlans();
        setPlans(list);
      } catch (error) {
        console.error('Erro ao carregar planos', error);
      }
    }
    fetchData();
  }, [listPlans]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    try {
      await onSubmit(values);
      resetForm();
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ ...initialValues, planId: initialValues.planId || (plans[0] && plans[0].id) }}
      validationSchema={UserSchema}
      onSubmit={handleSubmit}
    >
      {({ touched, errors, handleChange, values }) => (
        <Form className={classes.form}>
          <Stepper activeStep={step} className={classes.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <>
              <Typography className={classes.sectionTitle}>{steps[step]}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InputLabel className={classes.inputLabel}>Nome da Empresa</InputLabel>
                  <Field
                    as={TextField}
                    variant="filled"
                    fullWidth
                    id="companyName"
                    name="companyName"
                    error={touched.companyName && Boolean(errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                    className={classes.inputField}
                    InputLabelProps={{
                      className: classes.inputLabel,
                    }}
                    aria-required="true"
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel className={classes.inputLabel}>Nome <InfoOutlined fontSize="small" titleAccess="Seu nome completo" /></InputLabel>
                  <Field
                    as={TextField}
                    autoComplete="name"
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="filled"
                    fullWidth
                    id="name"
                    className={classes.inputField}
                    InputLabelProps={{
                      className: classes.inputLabel,
                    }}
                    aria-required="true"
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel className={classes.inputLabel}>Email</InputLabel>
                  <Field
                    as={TextField}
                    variant="filled"
                    fullWidth
                    id="email"
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    autoComplete="email"
                    className={classes.inputField}
                    InputLabelProps={{
                      className: classes.inputLabel,
                    }}
                    aria-required="true"
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel className={classes.inputLabel}>Senha</InputLabel>
                  <Field
                    as={TextField}
                    variant="filled"
                    fullWidth
                    name="password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            className={classes.iconButton}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    id="password"
                    autoComplete="current-password"
                    className={classes.inputField}
                    aria-required="true"
                  />
                </Grid>
              </Grid>
              <div className={classes.buttonGroup}>
                <Button
                  type="button"
                  variant="contained"
                  className={classes.submit}
                  onClick={handleNext}
                >
                  Avançar
                </Button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Typography className={classes.sectionTitle}>{steps[step]}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InputLabel className={classes.inputLabel}>Telefone</InputLabel>
                  <Field
                    as={TextField}
                    variant="filled"
                    fullWidth
                    id="phone"
                    name="phone"
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                    autoComplete="phone"
                    inputProps={{ maxLength: 15 }}
                    className={classes.inputField}
                    InputLabelProps={{
                      className: classes.inputLabel,
                    }}
                    aria-required="true"
                  />
                </Grid>
              </Grid>
              <div className={classes.buttonGroup}>
                <Button
                  type="button"
                  variant="contained"
                  className={classes.submit}
                  onClick={handleBack}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  className={classes.submit}
                  onClick={handleNext}
                >
                  Avançar
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Typography className={classes.sectionTitle}>{steps[step]}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InputLabel className={classes.inputLabel}>Selecione seu plano de assinatura</InputLabel>
                  <FormControl
                    variant="filled"
                    fullWidth
                    className={classes.inputField}
                  >
                    <Select
                      variant="filled"
                      id="planId"
                      name="planId"
                      value={values.planId}
                      onChange={handleChange}
                      className={classes.inputField}
                    >
                      {plans.map((plan, key) => (
                        <MenuItem key={key} value={plan.id}>
                          {plan.name} - Atendentes: {plan.users} - WhatsApp: {plan.connections} - Filas: {plan.queues} - R$ {plan.value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <div className={classes.buttonGroup}>
                <Button
                  type="button"
                  variant="contained"
                  className={classes.submit}
                  onClick={handleBack}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className={classes.submit}
                >
                  {loading ? <CircularProgress size={24} className={classes.loadingIndicator} /> : 'Concluir Cadastro'}
                </Button>
              </div>
            </>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default CompanyForm;
