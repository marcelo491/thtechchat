import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import qs from 'query-string';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import reset from '../../assets/reset.png';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Link from '@material-ui/core/Link';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import logologin from '../../assets/logologin.png';
import toastError from '../../errors/toastError';
import api from '../../services/api';
import { i18n } from '../../translate/i18n';

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: theme.palette.background.default, // usa cor definida no tema
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  leftContainer: {
    width: "30%",
    display: "flex", // Centraliza o conteúdo
    justifyContent: "center", // Centraliza horizontalmente
    alignItems: "center", // Centraliza verticalmente
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundColor: theme.palette.background.default, // utiliza cor do tema
    [theme.breakpoints.down('sm')]: {
      display: "none",
    },
  },
  logo: {
    width: "80%",
    maxWidth: "300px",
    height: "auto",
  },
  rightContainer: {
    width: "70%",
    display: "flex",
    justifyContent: "center",
    backgroundColor: theme.palette.background.paper, // utiliza cor paper do tema
    alignItems: "center",
    padding: theme.spacing(2),
    marginRight: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      width: "100%",
    },
  },
  paper: {
    backgroundColor: theme.palette.background.paper, // utiliza cor paper do tema
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(7, 4),
    borderRadius: theme.shape.borderRadius,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(2, 0, 1),
    borderRadius: "50px",
    textTransform: "none",
    padding: theme.spacing(1, 3),
    height: "50px",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
  voltarButton: {
    borderRadius: "50px",
    textTransform: "none",
    padding: theme.spacing(1, 3),
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
  },
  // Caso queira ajustar o botão "Enviar" com o mesmo estilo redondo
  enviarButton: {
    borderRadius: "50px",
    textTransform: "none",
    padding: theme.spacing(1, 3),
    height: "50px",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const ForgetPassword = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  let companyId = null;
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [showResetPasswordButton, setShowResetPasswordButton] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(""); // Mensagens de erro
  const [randomValue, setRandomValue] = useState(""); // Cache-bypass
  const [logoWithRandom, setLogoWithRandom] = useState(""); // URL da logo

  useEffect(() => {
    const random = Math.random(); // Gera cache-bypass
    setRandomValue(random);
    const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/login.png`;
    setLogoWithRandom(`${logo}?r=${random}`); // Define a URL da logo
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleAdditionalFields = () => {
    setShowAdditionalFields(!showAdditionalFields);
    if (showAdditionalFields) {
      setShowResetPasswordButton(false);
    } else {
      setShowResetPasswordButton(true);
    }
  };

  const params = qs.parse(window.location.search);
  if (params.companyId !== undefined) {
    companyId = params.companyId;
  }

  const initialState = { email: "" };
  const [user] = useState(initialState);
  const dueDate = moment().add(3, "day").format();

  const handleSendEmail = async (values) => {
    const email = values.email;
    try {
      const response = await api.post(
        `${process.env.REACT_APP_BACKEND_URL}/forgetpassword/${email}`
      );
      console.log("API Response:", response.data);
      if (response.data.status === 404) {
        toast.error("Email não encontrado");
      } else {
        toast.success(i18n.t("Email enviado com sucesso!"));
      }
    } catch (err) {
      console.log("API Error:", err);
      toastError(err);
    }
  };

  const handleResetPassword = async (values) => {
    const { email, token, newPassword, confirmPassword } = values;
    if (newPassword === confirmPassword) {
      try {
        await api.post(
          `${process.env.REACT_APP_BACKEND_URL}/resetpasswords/${email}/${token}/${newPassword}`
        );
        setError("");
        toast.success(i18n.t("Senha redefinida com sucesso."));
        history.push("/login");
      } catch (err) {
        toastError(err);
      }
    }
  };

  const isResetPasswordButtonClicked = showResetPasswordButton;
  const UserSchema = Yup.object().shape({
    email: Yup.string().email("E-mail inválido").required("Obrigatório"),
    newPassword: isResetPasswordButtonClicked
      ? Yup.string()
          .required("Campo obrigatório")
          .matches(
            passwordRegex,
            "Sua senha precisa ter no mínimo 8 caracteres, sendo uma letra maiúscula, uma minúscula e um número."
          )
      : Yup.string(),
    confirmPassword: Yup.string().when("newPassword", {
      is: (newPassword) => isResetPasswordButtonClicked && newPassword,
      then: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "As senhas não correspondem")
        .required("Campo obrigatório"),
      otherwise: Yup.string(),
    }),
  });

  return (
    <div className={classes.root}>
      {/* Container esquerdo com a logo (usada como banner) */}
      <div
        className={classes.leftContainer}
        style={{ backgroundImage: `url(${logoWithRandom})` }}
      />
      <div className={classes.rightContainer}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Typography component="h1" variant="h5" style={{ marginBottom: theme.spacing(2) }}>
              Esqueceu sua senha?
            </Typography>
            <Typography
              variant="body2"
              style={{
                marginBottom: theme.spacing(2),
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Enviaremos as instruções para o seu e-mail cadastrado.
            </Typography>
            <Formik
              initialValues={{
                email: "",
                token: "",
                newPassword: "",
                confirmPassword: "",
              }}
              enableReinitialize={true}
              validationSchema={UserSchema}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  if (showResetPasswordButton) {
                    handleResetPassword(values);
                  } else {
                    handleSendEmail(values);
                    setShowResetPasswordButton(true);
                    setShowAdditionalFields(true);
                  }
                  actions.setSubmitting(false);
                }, 400);
              }}
            >
              {({ touched, errors, isSubmitting }) => (
                <Form className={classes.form}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        variant="outlined"
                        fullWidth
                        id="email"
                        label="Informe seu e-mail."
                        name="email"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        autoComplete="email"
                        required
                      />
                    </Grid>
                    {showAdditionalFields && (
                      <>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            variant="outlined"
                            fullWidth
                            id="token"
                            label="Código de Verificação"
                            name="token"
                            error={touched.token && Boolean(errors.token)}
                            helperText={touched.token && errors.token}
                            autoComplete="off"
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            variant="outlined"
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            label="Nova senha"
                            name="newPassword"
                            error={touched.newPassword && Boolean(errors.newPassword)}
                            helperText={touched.newPassword && errors.newPassword}
                            autoComplete="off"
                            required
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={togglePasswordVisibility}>
                                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            variant="outlined"
                            fullWidth
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            label="Confirme a senha"
                            name="confirmPassword"
                            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                            helperText={touched.confirmPassword && errors.confirmPassword}
                            autoComplete="off"
                            required
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={toggleConfirmPasswordVisibility}>
                                    {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                  <Grid container spacing={2} className={classes.buttonContainer}>
                    <Grid item>
                      <Button
                        variant="outlined"
                        component={RouterLink}
                        to="/login"
                        className={classes.voltarButton}
                      >
                        Voltar
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        type="submit"
                        variant="contained"
                        className={classes.enviarButton}
                      >
                        Enviar
                      </Button>
                    </Grid>
                  </Grid>
                  {error && (
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  )}
                </Form>
              )}
            </Formik>
          </div>
          <Box mt={5} />
        </Container>
      </div>
    </div>
  );
};

export default ForgetPassword;
