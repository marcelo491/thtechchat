import React, { useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import qs from 'query-string';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import logologin from '../../assets/logologin.png';
import signup from '../../assets/signup.png'; // Imagem de fundo
import toastError from '../../errors/toastError';
import usePlans from '../../hooks/usePlans';
import { openApi } from '../../services/api';
import { i18n } from '../../translate/i18n';
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: theme.palette.background.default, // Utiliza a cor de fundo do tema
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  leftContainer: {
    width: "70%",
    background: `url(${signup})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    [theme.breakpoints.down('sm')]: {
      display: "none",
    },
  },
  rightContainer: {
    width: "30%",
    display: "flex",
    justifyContent: "center",
    backgroundColor: theme.palette.background.paper, // Utiliza a cor paper do tema
    alignItems: "center",
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: "100%",
    },
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper, // Utiliza a cor paper do tema
    padding: theme.spacing(2),
    borderRadius: "10px",
    width: "120%",
    maxWidth: "400px",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    borderRadius: '7px',
    marginTop: theme.spacing(2),
  },
  // Caso precise alterar as cores dos labels dos inputs, você pode usar as cores do tema:
  inputLabel: {
    color: theme.palette.text.primary,
  },
  underline: {
    "&::before": {
      borderBottom: `1px solid ${theme.palette.text.primary}`,
    },
  },
  powered: {
    color: theme.palette.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing(3),
  },
  whatsappButton: {
    marginTop: theme.spacing(2),
    backgroundColor: '#CCF3FB', // Se desejar, pode ajustar para usar o tema
    color: '#0292B0',
    height: '50px',
    borderRadius: '7px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    '&:hover': {
      backgroundColor: '#9AE7F7',
    },
  },
  submit: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.primary.main, // Usa a cor primária do tema
    color: theme.palette.primary.contrastText,
    height: '50px',
    borderRadius: '7px',
    marginBottom: theme.spacing(3), 
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  link: {
    color: theme.palette.primary.main, // Usa a cor primária do tema
    textDecoration: 'none',
    marginTop: theme.spacing(3),
    display: 'block',
    textAlign: 'center',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  logo: {
    margin: "0 auto",
    width: "80%",
    marginBottom: theme.spacing(2),
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Muito curto!')
    .max(50, 'Muito extenso!')
    .required('Obrigatório'),
  companyName: Yup.string()
    .min(2, 'Muito curto!')
    .max(50, 'Muito extenso!')
    .required('Obrigatório'),
  password: Yup.string()
    .min(5, 'Muito curto!')
    .max(50, 'Muito extenso!')
    .required('Obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('Obrigatório'),
  phone: Yup.string()
    .required('O número de telefone é obrigatório')
    .matches(
      /^(?:\+?\d{1,3}[-.\s]?)?\(?(?:\d{2,3})\)?[-.\s]?\d{4,5}[-.\s]?\d{4}$/,
      'Número de telefone inválido. Por favor, insira um número de telefone válido do Brasil ou internacional.'
    ),
  planId: Yup.string().required('Obrigatório'),
});

const SignUp = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [allowregister, setallowregister] = useState('enabled');
  const [randomValue, setRandomValue] = useState(""); // Estado para cache-bypass
  const [bannerUrl, setBannerUrl] = useState(""); // Estado para a URL do banner
  const [trial, settrial] = useState('3');
  let companyId = null;

  // Lógica para gerar URL da logo com cache-bypass
  useEffect(() => {
    const random = Math.random();
    setRandomValue(random);

    const banner = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/banner-signup.png`;
    setBannerUrl(`${banner}?r=${random}`);
  }, []);
  
  const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/signup.png`;
  const logoWithRandom = `${logo}?r=${randomValue}`;

  useEffect(() => {
    fetchallowregister();
    fetchtrial();
  }, []);

  const fetchtrial = async () => {
    try {
      const response = await api.get("/settings/trial");
      settrial(response.data.value);
    } catch (error) {
      console.error('Error retrieving trial', error);
    }
  };

  const fetchallowregister = async () => {
    try {
      const response = await api.get("/settings/allowregister");
      setallowregister(response.data.value);
    } catch (error) {
      console.error('Error retrieving allowregister', error);
    }
  };

  if (allowregister === "disabled") {
    history.push("/login");
  }

  const params = qs.parse(window.location.search);
  if (params.companyId !== undefined) {
    companyId = params.companyId;
  }

  const initialState = { name: '', email: '', password: '', phone: '', companyName: '', planId: '' };
  const [user, setUser] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);

  const dueDate = moment().add(trial, "day").format();

  const handleSignUp = async (values) => {
    Object.assign(values, { recurrence: 'MENSAL' });
    Object.assign(values, { dueDate: dueDate });
    Object.assign(values, { status: 't' });
    Object.assign(values, { campaignsEnabled: true });

    try {
      await openApi.post('/companies/cadastro', values);
      toast.success(i18n.t('signup.toasts.success'));
      history.push('/login');
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const [plans, setPlans] = useState([]);
  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className={classes.root}>
      <div
        className={classes.leftContainer}
        style={{ backgroundImage: `url(${bannerUrl})` }}
      />
      <div className={classes.rightContainer}>
        <Container className={classes.paper}>
          <CssBaseline />
          <img
            className={classes.logo}
            src={logoWithRandom}
            alt="Logo"
            style={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(5) }}
          />
          <Typography component="h1" variant="h5" style={{ color: theme.palette.text.primary }}>
            {i18n.t("signup.title")}
          </Typography>
          <Formik
            initialValues={user}
            enableReinitialize={true}
            validationSchema={UserSchema}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                handleSignUp(values);
                actions.setSubmitting(false);
              }, 400);
            }}
          >
            {({ touched, errors }) => (
              <Form className={classes.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="companyName"
                      label={i18n.t('signup.form.company')}
                      error={touched.companyName && Boolean(errors.companyName)}
                      helperText={touched.companyName && errors.companyName}
                      name="companyName"
                      required
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="name"
                      label={i18n.t('signup.form.name')}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      required
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="email"
                      label={i18n.t('signup.form.email')}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      required
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      name="password"
                      label={i18n.t('signup.form.password')}
                      type={showPassword ? 'text' : 'password'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      id="password"
                      required
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      type="number"
                      fullWidth
                      id="phone"
                      label={i18n.t('signup.form.phone')}
                      name="phone"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                      required
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="planId" style={{ color: theme.palette.text.primary }}>
                        Selecione seu plano de assinatura
                      </InputLabel>
                      <Select
                        variant="outlined"
                        fullWidth
                        label="Selecione seu plano de assinatura"
                        labelId="planId"
                        id="planId"
                        name="planId"
                        required
                        onChange={handleInputChange}
                        // Se necessário, você pode customizar o estilo do Select utilizando o theme
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className={classes.submit}
                >
                  {i18n.t('signup.buttons.submit')}
                </Button>
                <Grid container justify="flex-end">
                  <Grid item>
                    <Link
                      href="#"
                      variant="body2"
                      component={RouterLink}
                      to="/login"
                      className={classes.link}
                    >
                      {i18n.t('signup.buttons.login')}
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Container>
      </div>
    </div>
  );
};

export default SignUp;
